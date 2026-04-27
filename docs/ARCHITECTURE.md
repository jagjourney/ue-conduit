# UE Conduit -- Technical Architecture

**Version:** 1.0.0
**Author:** Jag Journey, LLC

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Component Descriptions](#component-descriptions)
4. [MCP Protocol](#mcp-protocol)
5. [HTTP Command Flow](#http-command-flow)
6. [Thread Safety Model](#thread-safety-model)
7. [Plugin Lifecycle](#plugin-lifecycle)
8. [WebSocket Event System](#websocket-event-system)
9. [Orchestration Engine](#orchestration-engine)
10. [Adding Custom Commands](#adding-custom-commands)
11. [Security Model](#security-model)
12. [Error Handling](#error-handling)

---

## System Overview

UE Conduit is a two-part system that gives AI assistants direct control over the Unreal Engine 5 editor:

1. **UE5 C++ Plugin** -- An editor plugin that embeds an HTTP server inside UE5, listens for JSON commands, and executes them on the game thread using native UE5 editor APIs.

2. **MCP Server** -- A TypeScript process that speaks the Model Context Protocol (MCP) over stdio, translating AI tool calls into HTTP requests to the UE5 plugin.

The design is deliberately simple: JSON over HTTP. No custom binary protocols, no IPC, no shared memory. This makes the system debuggable (you can use cURL), extensible (any language can call it), and LLM-agnostic (any AI that makes HTTP calls can control UE5).

---

## Architecture Diagram

```
+-------------------------------------------------------------------+
|                        USER / DEVELOPER                           |
+-------------------------------------------------------------------+
          |                                          |
          | Natural Language                         | Direct HTTP
          v                                          v
+-------------------+                    +-----------------------+
|                   |                    |                       |
|   Claude Code     |                    |   Any HTTP Client     |
|   Claude Desktop  |                    |   (cURL, Python,      |
|   (AI Assistant)  |                    |    Postman, etc.)     |
|                   |                    |                       |
+--------+----------+                    +----------+------------+
         |                                          |
         | MCP Protocol (stdio)                     |
         | Tool calls: ue5_spawn_actor, etc.        |
         v                                          |
+-------------------+                               |
|                   |                               |
|   MCP Server      |                               |
|   (TypeScript)    |                               |
|                   |                               |
|  +-------------+  |                               |
|  | 76 Tools    |  |                               |
|  | 4 Resources |  |                               |
|  | 3 Orch.     |  |                               |
|  +------+------+  |                               |
|         |         |                               |
|  +------v------+  |                               |
|  | UE5 Client  +--+------HTTP POST /api/command---+
|  | (Retries,   |  |                               |
|  |  Timeout,   |  |                               |
|  |  Health)    |  |                               |
|  +------+------+  |                               |
|         |         |                               |
|  +------v------+  |                               |
|  | WebSocket   |  |                               |
|  | Client      |  |                               |
|  | (Log, Build)|  |                               |
|  +-------------+  |                               |
+-------------------+                               |
         |                                          |
         |          HTTP JSON                       |
         +------------------+-----------------------+
                            |
                            v
              +----------------------------+
              |      UE5 Editor Plugin     |
              |       (C++ Module)         |
              |                            |
              |  +----------------------+  |
              |  |   HTTP Server        |  |
              |  |   Port 9377          |  |
              |  +----------+-----------+  |
              |             |              |
              |  +----------v-----------+  |
              |  |   Request Router     |  |
              |  |   (Category/Command) |  |
              |  +----------+-----------+  |
              |             |              |
              |  +----------v-----------+  |
              |  |  Game Thread         |  |
              |  |  Dispatch            |  |
              |  +----------+-----------+  |
              |             |              |
              |  +----------v-----------+  |
              |  |  Command Handlers    |  |
              |  |                      |  |
              |  |  Level  | Editor     |  |
              |  |  Asset  | Blueprint  |  |
              |  |  Build  | PIE        |  |
              |  |  Land.  | Water      |  |
              |  |  Foliage| Fab        |  |
              |  +----------+-----------+  |
              |             |              |
              |  +----------v-----------+  |
              |  |  UE5 Editor APIs     |  |
              |  |  (GEditor, FKismet,  |  |
              |  |   FAssetImport, etc) |  |
              |  +----------------------+  |
              +----------------------------+
                            |
                            v
              +----------------------------+
              |    Unreal Engine 5 Editor   |
              |    (Viewport, Outliner,     |
              |     Content Browser, etc.)  |
              +----------------------------+
```

---

## Component Descriptions

### UE5 C++ Plugin (`src/ue5-plugin/UEConduit/`)

The editor-side component. Loads at engine startup (`PostEngineInit` phase) and runs for the lifetime of the editor session.

| Component | File | Responsibility |
|-----------|------|---------------|
| **Module** | `UEConduitModule.cpp/h` | Plugin lifecycle, command handler registration, port configuration |
| **HTTP Server** | `UEConduitServer.cpp/h` | Embedded HTTP server using `FHttpServerModule`, request parsing, response formatting |
| **Command Interface** | `ICommandHandler.h` | Abstract base class for all command handlers |
| **Level Commands** | `LevelCommands.cpp` | Actor CRUD: spawn, delete, move, query, list, set properties |
| **Editor Commands** | `EditorCommands.cpp` | State queries, save, load, undo/redo, camera, screenshots, notifications |
| **Blueprint Commands** | `BlueprintCommands.cpp` | Blueprint creation, components, variables, compilation |
| **Asset Commands** | `AssetCommands.cpp` | Import, materials, material instances, content browser search |
| **Build Commands** | `BuildCommands.cpp` | C++ compilation, hot reload, lighting build |
| **PIE Commands** | `PIECommands.cpp` | Play/stop, game log, console commands |
| **Landscape Commands** | `LandscapeCommands.cpp` | Terrain creation, sculpting, layer painting |
| **Water Commands** | `WaterCommands.cpp` | Water body creation and configuration |
| **Foliage Commands** | `FoliageCommands.cpp` | Instanced foliage painting and management |
| **Fab Commands** | `FabCommands.cpp` | Content browser search, local asset import |

### MCP Server (`src/mcp-server/`)

The AI-side component. A Node.js TypeScript process that speaks MCP over stdio.

| Component | File | Responsibility |
|-----------|------|---------------|
| **Entrypoint** | `index.ts` | Server initialization, tool/resource registration, connection management |
| **Config** | `config.ts` | Environment variable loading with defaults |
| **UE5 Client** | `connection/ue5-client.ts` | HTTP client with retries, exponential backoff, health checking |
| **WebSocket Client** | `connection/websocket-client.ts` | Real-time event streams with auto-reconnect |
| **Tool Categories** | `tools/*.ts` | 17 tool files, each registering 3-9 MCP tools |
| **Resources** | `resources/*.ts` | 4 MCP resources for editor state, build status, project structure, game log |
| **Orchestration** | `orchestration/*.ts` | 3 high-level automation engines |
| **Logger** | `utils/logger.ts` | Structured logging with configurable verbosity |

### Tool Categories (17 files, 76 tools)

| File | Tools | MCP Tool Names |
|------|-------|---------------|
| `actor-tools.ts` | 8 | `ue5_spawn_actor`, `ue5_delete_actor`, `ue5_move_actor`, `ue5_list_actors`, `ue5_query_actor`, `ue5_set_actor_property`, `ue5_batch_spawn`, `ue5_select_actor` |
| `blueprint-tools.ts` | 6 | `ue5_create_blueprint`, `ue5_add_component`, `ue5_add_variable`, `ue5_compile_blueprint`, `ue5_list_blueprints`, `ue5_get_blueprint_info` |
| `asset-tools.ts` | 7 | `ue5_import_texture`, `ue5_import_mesh`, `ue5_create_material`, `ue5_create_material_instance`, `ue5_batch_import`, `ue5_list_assets`, `ue5_search_assets` |
| `compile-tools.ts` | 4 | `ue5_compile_cpp`, `ue5_hot_reload`, `ue5_get_build_errors`, `ue5_build_lighting` |
| `pie-tools.ts` | 6 | `ue5_play`, `ue5_stop`, `ue5_restart_pie`, `ue5_screenshot`, `ue5_get_game_log`, `ue5_execute_console_command` |
| `editor-tools.ts` | 8 | `ue5_get_editor_state`, `ue5_save_level`, `ue5_save_all`, `ue5_load_level`, `ue5_undo`, `ue5_redo`, `ue5_focus_viewport`, `ue5_notify` |
| `landscape-tools.ts` | 6 | `ue5_create_landscape`, `ue5_sculpt_landscape`, `ue5_paint_landscape_layer`, `ue5_add_foliage`, `ue5_get_landscape_info`, `ue5_set_landscape_material` |
| `water-tools.ts` | 3 | `ue5_create_water_body`, `ue5_set_water_properties`, `ue5_list_water_bodies` |
| `foliage-tools.ts` | 5 | `ue5_add_foliage_type`, `ue5_paint_foliage`, `ue5_scatter_foliage`, `ue5_remove_foliage`, `ue5_list_foliage_types` |
| `fab-tools.ts` | 4 | `ue5_fab_list_local`, `ue5_fab_import_local`, `ue5_fab_search_content`, `ue5_fab_list_vault` |
| `screenshot-tools.ts` | 3 | `ue5_take_screenshot`, `ue5_set_viewport_camera`, `ue5_get_viewport_camera` |
| `widget-tools.ts` | 5 | `ue5_create_widget`, `ue5_add_widget_child`, `ue5_set_widget_property`, `ue5_set_widget_binding`, `ue5_list_widgets` |
| `animation-tools.ts` | 4 | `ue5_create_anim_blueprint`, `ue5_create_montage`, `ue5_create_blend_space`, `ue5_play_animation_preview` |
| `input-tools.ts` | 4 | `ue5_create_input_action`, `ue5_create_mapping_context`, `ue5_add_key_mapping`, `ue5_list_input_actions` |
| `ai-tools.ts` | 5 | `ue5_create_behavior_tree`, `ue5_create_blackboard`, `ue5_add_blackboard_key`, `ue5_build_navmesh`, `ue5_query_navmesh` |
| `niagara-tools.ts` | 4 | `ue5_create_niagara_system`, `ue5_set_niagara_parameter`, `ue5_create_niagara_emitter`, `ue5_list_niagara_systems` |
| `data-tools.ts` | 4 | `ue5_create_datatable`, `ue5_import_json_to_datatable`, `ue5_create_curve`, `ue5_create_data_asset` |

Plus 3 orchestration tools registered in `index.ts`: `ue5_build_test_fix`, `ue5_import_directory`, `ue5_populate_zone`.

**Total: 79 tools.**

---

## MCP Protocol

The Model Context Protocol (MCP) is an open standard from Anthropic for connecting AI assistants to external tools and data sources.

### Transport

UE Conduit uses the **stdio transport**:

1. Claude Code launches the MCP server as a child process
2. Communication happens over stdin/stdout as JSON-RPC messages
3. The MCP server translates tool calls into HTTP requests to UE5

### Tools

Each MCP tool maps to one or more UE5 editor commands. The tool definition includes:
- Name (e.g., `ue5_spawn_actor`)
- Description (used by the AI to decide when to call it)
- Parameter schema (Zod-validated)
- Handler function (sends HTTP to UE5 and returns result)

### Resources

MCP resources provide read-only data that the AI can access:

| URI | Name | Description |
|-----|------|-------------|
| `editor://state` | Editor State | Current level, actor count, PIE state, build status, selected actors, engine version |
| `editor://build` | Build Status | Last compile result, errors, warnings, duration |
| `editor://project` | Project Structure | Project name, modules, plugins, content folders |
| `editor://log` | Game Log | Last 100 lines of UE5 output log |

Resources are polled periodically (editor state every 5 seconds) and updated in real-time via WebSocket.

---

## HTTP Command Flow

When the AI calls a tool like `ue5_spawn_actor`, this is the exact sequence of events:

```
1. Claude Code sends MCP tool_call to MCP Server (stdio)
         |
2. MCP Server validates parameters (Zod schema)
         |
3. MCP Server builds HTTP request:
   POST http://localhost:9377/api/command
   {
     "command_id": "uec_42_1711234567890",
     "category": "level",
     "command": "spawn_actor",
     "params": { ... }
   }
         |
4. UE5 Plugin receives HTTP request (background thread)
         |
5. Request Router parses JSON, looks up category handler
         |
6. Command dispatched to Game Thread via AsyncTask(ENamedThreads::GameThread)
         |
7. Game Thread executes: UWorld::SpawnActor<>()
         |
8. Result JSON built and sent back as HTTP response
         |
9. MCP Server receives response, formats as MCP tool_result
         |
10. Claude Code receives result, presents to AI
```

### Retry Logic

The MCP server's UE5 client handles transient failures:

```
Attempt 1: Send request
  -> Connection refused
  -> Wait 1 second

Attempt 2: Send request
  -> Connection refused
  -> Wait 2 seconds

Attempt 3: Send request
  -> Success (or final failure after max retries)
```

Default: 3 retries with exponential backoff (1s, 2s, 4s, capped at 5s).

---

## Thread Safety Model

Unreal Engine 5 requires that most editor operations happen on the **game thread**. The UE Conduit plugin handles this by:

1. **HTTP requests arrive on a background thread** (managed by `FHttpServerModule`)
2. **Requests are dispatched to the game thread** using `AsyncTask(ENamedThreads::GameThread, ...)`
3. **The HTTP response is held until the game thread completes** the operation
4. **The response is sent back on the background thread**

This means:
- Commands are **synchronous** from the caller's perspective
- Commands are **sequential** -- only one executes at a time on the game thread
- The editor remains **responsive** between commands (they typically complete in under 50ms)
- **Long-running operations** (compilation, lighting) block the HTTP response until complete

### Safe Operations

All command handlers use game-thread-safe UE5 APIs:
- `GEditor` for editor state
- `GWorld` for level operations
- `FKismetEditorUtilities` for Blueprint operations
- `UAssetImportTask` for asset imports
- `FScopedTransaction` for undo/redo support

---

## Plugin Lifecycle

```
1. Editor launches
         |
2. PostEngineInit loading phase
         |
3. FUEConduitModule::StartupModule()
   - Parse -UEConduitPort= command line arg (or use default 9377)
   - Create FUEConduitServer instance
   - Register all command handlers (level, editor, blueprint, etc.)
   - Call HttpServer->Start(port)
   - Log: "[UEConduit] HTTP server started on port 9377"
         |
4. Server is now listening for HTTP requests
   (editor is fully operational)
         |
5. User/AI sends commands via HTTP
         |
6. Editor shutdown initiated
         |
7. FUEConduitModule::ShutdownModule()
   - Call HttpServer->Stop()
   - Release all command handlers
   - Log: "[UEConduit] HTTP server stopped"
```

---

## WebSocket Event System

The WebSocket system runs independently of the HTTP command system and provides push-based real-time events.

```
UE5 Plugin                          MCP Server
    |                                    |
    |  ws://localhost:8081               |
    |<------- WebSocket Connect ---------|
    |                                    |
    |<------- Subscribe message ---------|
    |  {"type":"subscribe",              |
    |   "streams":["log","compile"]}     |
    |                                    |
    |-------- Log event ---------------->|
    |  {"stream":"log","data":{...}}     |  --> GameLogResource
    |                                    |
    |-------- Compile event ------------>|
    |  {"stream":"compile","data":{...}} |  --> BuildStatusResource
    |                                    |
```

The MCP server's `WebSocketClient` features:
- **Auto-reconnect** with exponential backoff (up to 20 attempts)
- **Event buffering** (last 100 events per stream)
- **Event emitter pattern** for decoupled consumers
- **Typed events** via the `StreamEvent` interface

---

## Orchestration Engine

Three high-level automation systems are built on top of the basic command tools:

### Build-Test-Fix Loop (`orchestration/build-test-fix.ts`)

An autonomous compile-test cycle that integrates with Claude's code editing:

```
Start
  |
  v
Compile C++ (build/compile)
  |
  +-- Errors? --> Return errors to Claude (Claude fixes code, calls again)
  |
  v
Start PIE (console/start_pie)
  |
  +-- Failed? --> Return PIE errors
  |
  v
Wait 3 seconds
  |
  v
Check game log for runtime errors
  |
  +-- Errors? --> Stop PIE, return errors to Claude
  |
  v
Take screenshot (viewport/screenshot)
  |
  v
Stop PIE
  |
  v
Return success with screenshot path
```

Safety: maximum iteration count (default 10) prevents infinite loops.

### Asset Pipeline (`orchestration/asset-pipeline.ts`)

Batch import engine with intelligent categorization:

```
Scan source directory
  |
  v
Categorize files by extension:
  .png/.jpg/.tga  --> Textures/
  .fbx/.obj/.gltf --> Meshes/
  .wav/.ogg       --> Audio/
  |
  v
For each category, import in batches (default 50 per batch):
  - Auto-detect normal maps by filename pattern (_normal, _nm, _nrm)
  - Set compression settings accordingly (TC_Normalmap vs TC_Default)
  - Set sRGB flag (off for normals/masks, on for diffuse)
  |
  v
Optional: group textures by base name and auto-create material instances
  sword_01_diffuse + sword_01_normal --> MI_sword_01
  |
  v
Return summary: imported/failed/skipped counts
```

### Level Builder (`orchestration/level-builder.ts`)

Populates a game zone from a JSON definition file:

```
Read zone JSON file
  |
  v
Load target level (if specified)
  |
  v
Configure lighting:
  - Directional light (sun)
  - Sky light
  - Exponential height fog
  |
  v
Spawn NPCs at defined positions
  |
  v
Spawn enemies with level ranges and patrol paths
  |
  v
Place gathering nodes with resource types and respawn timers
  |
  v
Place spawn points (player, graveyard, flight points)
  |
  v
Place ambient sound actors with attenuation radii
  |
  v
Return summary: actors placed per category, failures
```

---

## Adding Custom Commands

### On the Plugin Side (C++)

1. Create a new command handler class implementing `ICommandHandler`:

```cpp
// Public/Commands/MyCommandHandler.h
#pragma once
#include "Commands/ICommandHandler.h"

class FMyCommandHandler : public ICommandHandler
{
public:
    virtual bool HandleCommand(
        const FString& Command,
        const TSharedPtr<FJsonObject>& Params,
        FString& OutMessage,
        TSharedPtr<FJsonObject>& OutOutput
    ) override;
};
```

2. Implement the handler:

```cpp
// Private/Commands/MyCommands.cpp
#include "Commands/MyCommandHandler.h"

bool FMyCommandHandler::HandleCommand(
    const FString& Command,
    const TSharedPtr<FJsonObject>& Params,
    FString& OutMessage,
    TSharedPtr<FJsonObject>& OutOutput)
{
    if (Command == TEXT("my_custom_command"))
    {
        // Your logic here using UE5 editor APIs
        OutMessage = TEXT("Custom command executed");
        OutOutput = MakeShared<FJsonObject>();
        OutOutput->SetStringField(TEXT("result"), TEXT("success"));
        return true;
    }
    return false; // Unknown command
}
```

3. Register it in `UEConduitModule.cpp`:

```cpp
HttpServer->RegisterCommandHandler(TEXT("custom"), CreateMyCommandHandler());
```

### On the MCP Server Side (TypeScript)

1. Create a new tool file:

```typescript
// src/mcp-server/tools/custom-tools.ts
import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerCustomTools(server: any, ue5: UE5Client) {
  server.tool(
    "ue5_my_custom_command",
    "Description of what this command does.",
    {
      param1: z.string().describe("Parameter description"),
      param2: z.number().optional().default(42),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("custom", "my_custom_command", {
        param1: params.param1,
        param2: params.param2,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
```

2. Import and register in `index.ts`:

```typescript
import { registerCustomTools } from "./tools/custom-tools.js";
// ...
registerCustomTools(server, ue5);
```

---

## Security Model

### Network Exposure

- The HTTP server binds to `localhost` only by default
- No external network access unless explicitly configured
- WebSocket server also binds to localhost

### Authentication

- Optional API key via `X-API-Key` header
- Set via `UE5_API_KEY` environment variable
- When set, all unauthenticated requests are rejected with 401

### Command Validation

- All parameters are validated before execution
- Path traversal is blocked in file system operations
- Blueprint and asset operations are scoped to the project's Content directory

### Risk Considerations

- UE Conduit has full editor access -- it can delete actors, modify assets, and execute console commands
- Do not expose the HTTP port to the public internet
- Use the API key feature if multiple users share the same machine
- The autonomous build-test-fix loop has a configurable iteration cap to prevent runaway loops

---

## Error Handling

### MCP Server Level

1. **Connection failures** -- Automatic retry with exponential backoff
2. **Timeout** -- Configurable per-command timeout (default 30s)
3. **Invalid parameters** -- Zod schema validation before HTTP call
4. **UE5 errors** -- Passed through as structured error responses

### Plugin Level

1. **Unknown category** -- Returns 404 with valid category list
2. **Unknown command** -- Returns 404 with available commands for that category
3. **Missing parameters** -- Returns 400 with description of required fields
4. **Game thread crash** -- Caught by UE5's exception handling, returns 500
5. **Undo support** -- Most commands are wrapped in `FScopedTransaction` for undo/redo

### Crash Resilience

The key design advantage of UE Conduit: **context lives in Claude, not in UE5.**

If the UE5 editor crashes:
1. Claude Code retains full conversation context
2. The MCP server detects the disconnection via health checks
3. The user restarts UE5
4. The MCP server auto-reconnects
5. Claude can resume exactly where it left off -- no work is lost

---

*UE Conduit -- The conduit between AI and engine.*
*Jag Journey, LLC*
