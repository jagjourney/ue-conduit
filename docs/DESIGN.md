# UE Conduit with Claude — Complete Product Specification

**Codename:** UE Conduit (UEC)
**Tagline:** *"The conduit between AI and engine"*
**Author:** Jag Journey, LLC
**Date:** March 23, 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Problem](#2-the-problem)
3. [Market Analysis](#3-market-analysis)
4. [Product Architecture](#4-product-architecture)
5. [Component 1: MCP Server](#5-component-1-mcp-server)
6. [Component 2: UE5 Plugin (or Claudius Integration)](#6-component-2-ue5-plugin)
7. [Component 3: Orchestration Engine](#7-component-3-orchestration-engine)
8. [Component 4: Claude Code Integration](#8-component-4-claude-code-integration)
9. [Component 5: Claude Desktop Integration](#9-component-5-claude-desktop-integration)
10. [Complete Tool Reference](#10-complete-tool-reference)
11. [Workflow Examples](#11-workflow-examples)
12. [Autonomous Build-Test-Fix Loop](#12-autonomous-build-test-fix-loop)
13. [Multi-Agent Architecture](#13-multi-agent-architecture)
14. [Security Model](#14-security-model)
15. [Distribution Strategy](#15-distribution-strategy)
16. [Monetization](#16-monetization)
17. [Implementation Roadmap](#17-implementation-roadmap)
18. [Technical Deep Dives](#18-technical-deep-dives)
19. [API Reference](#19-api-reference)
20. [FAQ](#20-faq)

---

## 1. Executive Summary

**UE Conduit** is an open-source MCP (Model Context Protocol) server that gives Claude Code and Claude Desktop **direct programmatic control** over Unreal Engine 5's editor. Instead of copying prompts between two AI interfaces, developers say *"Claude, add 20 enemies to the beach"* and it happens — instantly, in the editor, with zero human intervention.

**What makes this different from everything else:**

| Feature | ChatGPT/Copilot UE Plugins | Claudius Code ($60) | **UE Conduit** |
|---------|---------------------------|---------------------|---------------------------|
| AI inside editor | Yes | Yes (via Claude) | AI runs externally with **full project context** |
| Direct editor control | No (text only) | Yes (130+ commands) | Yes (wraps Claudius + adds 50+ orchestration tools) |
| Server + client awareness | No | No | **Yes — same Claude manages server code AND UE5** |
| Autonomous operation | No | No | **Yes — build-test-fix loops without human** |
| Multi-agent parallel work | No | No | **Yes — 7+ agents on different tasks simultaneously** |
| Crash recovery | Context lost | Context lost | **Context preserved in Claude Code** |
| MCP Protocol native | No | No | **Yes — first-class Claude Code/Desktop integration** |
| Open source | No | No ($60/seat) | **Core is free and open source** |
| Cost per session | $3-10 per editor session | $3-10 per editor session | **$0 extra — uses your existing Claude Code sub** |

---

## 2. The Problem

### 2.1 The Current Pain (What We Experienced Today)

Building Dominion MMO with UE5 Claude required:

1. **Manual prompt relay** — Claude Code writes a prompt → user copies it → pastes into UE5 Claude → waits → screenshots result → pastes back into Claude Code
2. **No shared context** — UE5 Claude doesn't know the server has 18 microservices with 200+ endpoints. Claude Code doesn't know what UE5 Claude already built.
3. **Script-writing instead of doing** — UE5 Claude often writes Python import scripts instead of directly creating assets, because it's easier to describe than to execute
4. **Crash = lost everything** — When UE5 crashes (and it does), all context is gone. Must re-explain everything.
5. **Two separate AI bills** — Each UE5 Claude session costs $3-10. Over a day of development, that's $30-100 just for the UE5 side.
6. **No verification** — Claude Code has no way to verify that UE5 Claude actually did what was asked. Relies on human screenshots.
7. **Sequential bottleneck** — Can only do one thing at a time in UE5. Can't have one agent importing assets while another builds Blueprints.

### 2.2 The Real Cost

For our session today:
- Claude Code: ~$15 (18 agents, full server build)
- UE5 Claude: ~$13 (218 turns at $10.31)
- Human time lost to copy-paste relay: ~2 hours
- Work lost to UE5 crashes: ~1 hour
- Total overhead from the two-system gap: **~3 hours and $13**

With the Bridge, the UE5 Claude cost drops to $0 (Claude Code does it all), and the 3 hours of relay time drops to zero.

### 2.3 Who Else Has This Problem

- **Solo indie devs** using AI to build games (growing fast — thousands on Reddit, Discord, X)
- **Small studios** (2-10 people) using AI to accelerate development
- **Content creators** automating cinematic production in UE5
- **Technical artists** automating repetitive editor workflows
- **CI/CD pipelines** needing to interact with UE5 editor for testing

---

## 3. Market Analysis

### 3.1 Existing Solutions

**Claudius Code** (claudiuscode.com) — $59.99/seat
- 130+ commands via HTTP API (port 8080) or file-based JSON
- 19 command categories (Level, Editor, Blueprint, Asset, Animation, etc.)
- YAML "Skills" system for chaining commands
- Includes CLAUDE.md for AI context
- **Limitation:** No MCP integration, no orchestration, no multi-agent, still requires copy-paste workflow

**UnrealClaude / Claude Assistant Panel** (built into some UE5 setups)
- Chat interface inside UE5 editor
- Can execute editor commands via conversation
- **Limitation:** Separate AI instance, no server context, crashes lose everything

**GitHub Copilot for UE5** — Free with Copilot sub
- Code completion in IDE (VS/Rider)
- **Limitation:** C++ only, no editor control, no Blueprint support

**ChatGPT plugins for UE5** — Various free/paid
- Mostly text-based chat assistants
- **Limitation:** No direct editor control at all

### 3.2 The Gap

Nobody has built the **orchestration layer** — the system that lets a single AI instance:
1. Understand the full project (server + client + assets + docs)
2. Directly control the UE5 editor via API
3. Run autonomous build-test-fix cycles
4. Coordinate multiple parallel agents
5. Persist context across crashes

**UE Conduit fills this gap.**

### 3.3 Market Size

- ~500K active UE5 developers worldwide
- ~50K using AI tools for development (growing 200%+ YoY)
- ~5K who would pay for premium AI workflow tools
- Conservative TAM: $500K-2M/year at $99-199/year pricing

---

## 4. Product Architecture

### 4.1 System Overview

```
+------------------------------------------------------------------+
|                          DEVELOPER                                |
|                                                                   |
|  "Claude, add 20 enemies to the beach with patrol routes"         |
+-------------------------------+----------------------------------+
                                |
                                v
+-------------------------------+----------------------------------+
|                     CLAUDE CODE CLI                                |
|                   (or Claude Desktop)                              |
|                                                                    |
|  Has full project context:                                         |
|  - Server code (18 services, 200+ endpoints)                      |
|  - Game data (31 JSON files, classes, abilities, items)            |
|  - UE5 C++ source (120+ files)                                    |
|  - Documentation, lore, art assets                                 |
|  - Git history, CLAUDE.md                                          |
|                                                                    |
|  Spawns sub-agents for parallel work:                              |
|  - Agent 1: Server code changes                                   |
|  - Agent 2: UE5 editor operations (via MCP)                       |
|  - Agent 3: Asset import pipeline (via MCP)                       |
|  - Agent 4: Testing and verification (via MCP PIE)                |
+-------------------------------+----------------------------------+
                                |
                          MCP Protocol
                                |
                                v
+-------------------------------+----------------------------------+
|                   MCP SERVER (Node.js/TypeScript)                  |
|                   "ue-conduit"                          |
|                                                                    |
|  50+ MCP Tools:                                                    |
|  - ue5_spawn_actor, ue5_create_blueprint, ue5_import_asset         |
|  - ue5_compile, ue5_play, ue5_screenshot, ue5_get_state           |
|  - ue5_batch_import, ue5_create_material, ue5_paint_landscape     |
|                                                                    |
|  MCP Resources:                                                    |
|  - editor://state (current level, selected actors, build status)   |
|  - editor://log (real-time output log)                             |
|  - editor://project (asset tree, class hierarchy)                  |
|                                                                    |
|  Orchestration:                                                    |
|  - Command queue with retry logic                                  |
|  - Batch operation support                                         |
|  - Real-time WebSocket event stream                                |
|  - Health monitoring and auto-reconnect                            |
+-------------------------------+----------------------------------+
                                |
                          HTTP/WebSocket
                         localhost:8080
                                |
                                v
+-------------------------------+----------------------------------+
|                   UE5 EDITOR PLUGIN                                |
|                   (Claudius Code or custom)                         |
|                                                                    |
|  130+ Editor Commands:                                             |
|  - Level: spawn, delete, move, query actors                       |
|  - Blueprint: create, add components, compile                      |
|  - Asset: import, create materials, data tables                    |
|  - Compile: C++ hot reload, full rebuild                           |
|  - PIE: start, stop, query game state                             |
|  - Viewport: camera, screenshots, view modes                      |
|  - Landscape: paint, sculpt, foliage                              |
|  - Animation: montages, blend spaces, state machines              |
|  - Sequencer: cinematic automation                                 |
|  - AI: behavior trees, blackboards, nav mesh                      |
+------------------------------------------------------------------+
```

### 4.2 Communication Flow

```
Developer speaks → Claude Code reasons → MCP tool call →
MCP Server translates → HTTP POST to UE5 → UE5 executes →
JSON response → MCP Server parses → Claude Code understands →
Claude Code decides next action → repeat
```

**Round-trip latency: ~50-100ms** (10-50ms UE5 plugin + 20-50ms MCP overhead)

### 4.3 Key Design Principles

1. **Single brain** — One Claude instance has ALL context (server, client, assets, docs)
2. **Direct control** — No human relay; Claude calls tools, UE5 executes
3. **Crash-resilient** — Context lives in Claude Code, not UE5. Crashes don't lose work.
4. **Parallel** — Multiple agents can operate on different parts of the editor simultaneously
5. **Observable** — Claude can see what's happening (screenshots, logs, game state)
6. **Reversible** — Undo support for all operations
7. **Extensible** — Custom tools can be added by anyone
8. **Open** — Core is open source; plugin compatibility is documented

---

## 5. Component 1: MCP Server

### 5.1 Technology Stack

```
ue-conduit/
  package.json                    # Node.js project
  tsconfig.json                   # TypeScript config
  src/
    index.ts                      # MCP server entrypoint
    config.ts                     # Configuration (ports, paths, auth)
    connection/
      ue5-client.ts               # HTTP client to UE5 plugin
      websocket-client.ts         # WebSocket for real-time events
      health-monitor.ts           # Connection health + auto-reconnect
      command-queue.ts            # Ordered command execution with retry
    tools/
      actor-tools.ts              # 8 tools: spawn, delete, move, list, query, select, group, duplicate
      blueprint-tools.ts          # 6 tools: create, add_component, add_variable, compile, open, list
      asset-tools.ts              # 7 tools: import_texture, import_mesh, import_audio, create_material, create_mi, list, search
      compile-tools.ts            # 4 tools: hot_reload, full_build, get_errors, clean
      level-tools.ts              # 5 tools: load, save, get_info, add_sublevel, list_levels
      pie-tools.ts                # 5 tools: start, stop, restart, screenshot, get_game_log
      landscape-tools.ts          # 4 tools: paint_layer, add_foliage, sculpt, add_water
      widget-tools.ts             # 4 tools: create_widget, add_widget_child, set_binding, preview
      animation-tools.ts          # 3 tools: create_montage, create_blend_space, create_anim_bp
      data-tools.ts               # 3 tools: create_datatable, import_json_to_datatable, create_curve
      batch-tools.ts              # 3 tools: batch_spawn, batch_import, batch_execute
      project-tools.ts            # 3 tools: get_project_info, get_class_hierarchy, get_content_browser
    resources/
      editor-state.ts             # MCP resource: real-time editor state
      build-status.ts             # MCP resource: compilation status
      game-log.ts                 # MCP resource: PIE output
      project-structure.ts        # MCP resource: asset tree, classes
      screenshot.ts               # MCP resource: latest viewport screenshot
    orchestration/
      build-test-fix.ts           # Autonomous compilation loop
      asset-pipeline.ts           # Batch asset import with progress
      level-builder.ts            # High-level level construction
      blueprint-builder.ts        # High-level BP construction
    utils/
      ue5-paths.ts                # UE5 path helpers (/Game/..., /Engine/...)
      type-converters.ts          # Convert between MCP params and UE5 JSON
      error-handler.ts            # Standardized error handling
      logger.ts                   # Structured logging
  tests/
    tools/                        # Unit tests for each tool category
    integration/                  # Integration tests against mock UE5
    e2e/                          # End-to-end tests against real UE5
  docs/
    SETUP.md                      # Getting started guide
    TOOLS.md                      # Complete tool reference
    TUTORIALS.md                  # Step-by-step tutorials
    CONTRIBUTING.md               # How to add custom tools
    CLAUDE.md                     # Context for Claude Code
```

### 5.2 MCP Server Configuration

```json
// Claude Code settings (~/.claude/settings.json)
{
  "mcpServers": {
    "ue5": {
      "command": "npx",
      "args": ["ue-conduit"],
      "env": {
        "UE5_HOST": "localhost",
        "UE5_PORT": "8080",
        "UE5_API_KEY": "your-api-key",
        "UE5_PROJECT_PATH": "D:/laragon/www/wowsmack/client/game",
        "UE5_LOG_LEVEL": "info"
      }
    }
  }
}
```

```json
// Claude Desktop settings (~/.claude/claude_desktop_config.json)
{
  "mcpServers": {
    "ue5": {
      "command": "npx",
      "args": ["ue-conduit"],
      "env": {
        "UE5_HOST": "localhost",
        "UE5_PORT": "8080"
      }
    }
  }
}
```

### 5.3 Connection Management

```typescript
class UE5Connection {
  // Auto-reconnect with exponential backoff
  // Health check every 5 seconds
  // Queue commands during disconnection
  // Replay queued commands on reconnect
  // WebSocket for real-time events (log, compile, PIE)

  async isConnected(): Promise<boolean>;
  async getEditorState(): Promise<EditorState>;
  async executeCommand(category: string, command: string, params: object): Promise<CommandResult>;
  async startEventStream(): AsyncGenerator<EditorEvent>;
}
```

---

## 6. Component 2: UE5 Plugin

### 6.1 Option A: Use Claudius Code (Recommended for Phase 1)

Claudius ($59.99) already provides 130+ commands via HTTP on port 8080. Our MCP server can wrap it directly:

**Advantages:**
- Already built and tested across UE5 5.4-5.7
- 130+ commands covering all major editor operations
- Active development with updates
- Full C++ source included for extension

**Setup:**
1. Install Claudius from Fab Marketplace
2. Install UE Conduit: `npm install -g ue-conduit`
3. Configure Claude Code MCP settings
4. Done — Claude Code now controls UE5

### 6.2 Option B: Build Custom Plugin (Phase 2+)

For features Claudius doesn't support, or for a fully open-source stack:

**Custom Plugin Features Beyond Claudius:**
- WebSocket event stream (Claudius only has HTTP request/response)
- Blueprint node graph manipulation (Claudius has basic BP, we need full K2 node control)
- UMG widget creation/modification (Claudius has limited UI support)
- Enhanced landscape operations (weight painting, erosion, procedural generation)
- DataTable import from JSON with type inference
- Niagara system creation and parameter control
- Enhanced Action System - create Input Actions, Mapping Contexts programmatically
- Subsystem integration (WorldSubsystem, GameInstanceSubsystem access)

**Custom Plugin HTTP API (supplement to Claudius):**

```
Port 9377 (separate from Claudius 8080)

WebSocket Endpoints:
  ws://localhost:9378/events     → Real-time editor events
  ws://localhost:9378/compile    → Live compilation output
  ws://localhost:9378/pie        → PIE game log stream
  ws://localhost:9378/progress   → Long-running operation progress

HTTP Endpoints (beyond Claudius):
  POST /api/v1/blueprint/add-node        → Add K2 node to event graph
  POST /api/v1/blueprint/connect-pins    → Connect Blueprint pins
  POST /api/v1/blueprint/add-event       → Add event (BeginPlay, Tick, etc.)
  POST /api/v1/widget/create             → Create UMG widget Blueprint
  POST /api/v1/widget/add-child          → Add child widget
  POST /api/v1/widget/set-binding        → Set property binding
  POST /api/v1/datatable/from-json       → Create DataTable from JSON file
  POST /api/v1/landscape/weight-paint    → Paint landscape material layers
  POST /api/v1/niagara/create-system     → Create Niagara particle system
  POST /api/v1/input/create-action       → Create Enhanced Input Action
  POST /api/v1/input/create-context      → Create Input Mapping Context
  GET  /api/v1/stream/subscribe          → Subscribe to editor event categories
```

### 6.3 Hybrid Approach (Recommended)

Use Claudius for the 130 standard commands, add our custom plugin for the 20+ advanced operations Claudius doesn't cover. The MCP server routes commands to whichever plugin handles them:

```
MCP Server
  ├── Standard commands → Claudius (port 8080)
  │   (spawn_actor, import_asset, compile, PIE, etc.)
  │
  └── Advanced commands → Custom Plugin (port 9377)
      (BP node graph, UMG widgets, WebSocket streams, etc.)
```

---

## 7. Component 3: Orchestration Engine

This is what makes the Bridge unique. Not just forwarding commands — **intelligently orchestrating complex multi-step operations.**

### 7.1 Build-Test-Fix Loop

```typescript
class BuildTestFixLoop {
  /**
   * Autonomous cycle:
   * 1. Claude Code writes/modifies C++ code
   * 2. Triggers compilation via MCP
   * 3. Reads build errors from WebSocket stream
   * 4. If errors: fixes the code, goes to step 2
   * 5. If clean: starts PIE
   * 6. Reads game log for runtime errors
   * 7. If runtime errors: fixes code, goes to step 2
   * 8. If clean: takes screenshot, reports success
   *
   * Max iterations: 10 (prevents infinite loops)
   * Human can interrupt at any point
   */
  async run(task: string): Promise<BuildResult>;
}
```

### 7.2 Asset Pipeline

```typescript
class AssetPipeline {
  /**
   * Batch import with intelligence:
   * 1. Scan source directory for assets
   * 2. Categorize by type (texture, mesh, audio)
   * 3. Determine optimal import settings per asset
   * 4. Import in parallel batches (50 at a time)
   * 5. Create materials for textures
   * 6. Create material instances with proper parameters
   * 7. Organize in content browser by category
   * 8. Report results with any failures
   */
  async importDirectory(sourcePath: string, destPath: string): Promise<ImportResult>;
}
```

### 7.3 Level Builder

```typescript
class LevelBuilder {
  /**
   * High-level level construction:
   * 1. Claude Code describes the zone ("a beach with cliffs, cave entrance, NPC village")
   * 2. LevelBuilder plans actor placement based on game-data JSON
   * 3. Spawns terrain features, applies landscape material
   * 4. Places enemies from game-data with proper levels and patrol routes
   * 5. Places NPCs with quest associations
   * 6. Adds environmental effects (water, fog, lighting)
   * 7. Sets up audio (ambient sounds, music triggers)
   * 8. Validates against game design constraints
   */
  async buildZone(zoneData: ZoneDefinition): Promise<BuildResult>;
}
```

### 7.4 Blueprint Builder

```typescript
class BlueprintBuilder {
  /**
   * Construct Blueprints from high-level descriptions:
   * 1. Claude Code describes: "An enemy that patrols, aggros at 10m, attacks every 2s"
   * 2. BlueprintBuilder creates the BP class
   * 3. Adds components (mesh, collision, AI)
   * 4. Adds variables (Health, Damage, PatrolPoints)
   * 5. Creates event graph nodes (BeginPlay → AI patrol, OnSeePlayer → Chase)
   * 6. Compiles and validates
   */
  async build(spec: BlueprintSpec): Promise<BlueprintResult>;
}
```

---

## 8. Component 4: Claude Code Integration

### 8.1 How Developers Use It

Once configured, new MCP tools appear in Claude Code automatically:

```
You: "What's the current state of the UE5 editor?"

Claude Code: [reads editor://state resource]
"The editor has L_ShatteredCoast open with 263 actors. The last build
was clean. PIE is not running. The viewport is looking at coordinates
(2400, 1800, 500) — that's near the cliff area."

You: "Place a ring of torches around the village center"

Claude Code: [calls ue5_get_actors to find village NPCs]
[calculates circle positions around the NPC cluster center]
[calls ue5_spawn_actor 12 times for torch Blueprints]
"Placed 12 torches in a circle (radius 500) around the village center
at (3200, 2100). Each torch has a PointLight component. Want me to
adjust the light color or intensity?"

You: "Make them warm orange and flickering"

Claude Code: [calls ue5_set_property on each torch's PointLight]
"Updated all 12 torches: color set to warm orange (R=1.0, G=0.6, B=0.2),
intensity 5000, flicker enabled via random intensity variation."
```

### 8.2 Natural Language → Tool Mapping

Claude Code is smart enough to map natural requests to the right tool calls:

| User says | Claude Code does |
|-----------|-----------------|
| "Add 20 enemies to the beach" | `ue5_spawn_actor` x20 with beach coordinates |
| "The ground is gray, add textures" | `ue5_create_material` + `ue5_set_landscape_material` |
| "Compile and test" | `ue5_compile` → `ue5_start_pie` → `ue5_get_game_log` |
| "Import all our artwork" | `ue5_batch_import` with artwork directory |
| "Create an ability for the Striker class" | `ue5_create_blueprint` + add components + event graph |
| "The enemies aren't attacking" | `ue5_screenshot` → analyze → fix BP → recompile |
| "Make the water look better" | `ue5_set_property` on water material |
| "Show me what the player sees" | `ue5_start_pie` → `ue5_screenshot` → analyze |

### 8.3 Context Advantages

Because Claude Code has the full project context, it can make intelligent decisions:

- **Server awareness:** "Add an NPC that sells items" → Claude knows the auction-service API, creates an NPC that calls the right endpoint
- **Game data awareness:** "Place enemies for a level 3-5 zone" → Claude reads `game-data/npcs/shattered_coast_npcs.json` and uses the right enemy types
- **Art awareness:** "Use our Coastal Crab texture" → Claude knows the artwork is at `assets/artwork/characters/enemies/` and imports the right file
- **Lore awareness:** "Add a quest giver for the main story" → Claude reads `game-data/quests/main_story_act1.json` and places the right NPC with the right quest

---

## 9. Component 5: Claude Desktop Integration

The same MCP server works with Claude Desktop (the GUI app), providing a more visual experience:

### 9.1 Visual Feedback

Claude Desktop can display screenshots from UE5:
- Request a viewport screenshot via MCP resource
- Display it inline in the conversation
- User can point at areas: "Make that cliff taller"

### 9.2 Desktop-Specific Features

- **Live preview panel** — Shows UE5 viewport state (requires periodic screenshots)
- **Asset browser** — MCP resource listing all project assets
- **Build status indicator** — Green/yellow/red based on last compile
- **PIE controls** — Play/Stop buttons that map to MCP tools

---

## 10. Complete Tool Reference

### 10.1 Actor Tools (8)

| Tool | Description | Parameters |
|------|-------------|-----------|
| `ue5_spawn_actor` | Spawn actor in level | blueprint, location, rotation, scale, properties, label |
| `ue5_delete_actor` | Delete actor by label or ID | actor_label or actor_id |
| `ue5_move_actor` | Set actor transform | actor_label, location, rotation, scale |
| `ue5_list_actors` | List all actors in level | filter_class, filter_tag, filter_name |
| `ue5_query_actor` | Get actor details | actor_label (returns all properties) |
| `ue5_select_actor` | Select actor in editor | actor_label |
| `ue5_duplicate_actor` | Duplicate actor with offset | actor_label, offset |
| `ue5_set_actor_property` | Set any property on actor | actor_label, property_path, value |

### 10.2 Blueprint Tools (6)

| Tool | Description | Parameters |
|------|-------------|-----------|
| `ue5_create_blueprint` | Create new Blueprint | name, parent_class, path, components |
| `ue5_add_component` | Add component to BP | blueprint, component_type, name, properties |
| `ue5_add_variable` | Add variable to BP | blueprint, name, type, default_value, expose_to_editor |
| `ue5_compile_blueprint` | Compile a Blueprint | blueprint |
| `ue5_open_blueprint` | Open BP in editor | blueprint |
| `ue5_list_blueprints` | List all BPs | path_filter |

### 10.3 Asset Tools (7)

| Tool | Description | Parameters |
|------|-------------|-----------|
| `ue5_import_texture` | Import image as texture | source_path, dest_path, compression, sRGB |
| `ue5_import_mesh` | Import 3D model | source_path, dest_path, format |
| `ue5_import_audio` | Import sound file | source_path, dest_path |
| `ue5_create_material` | Create material asset | name, path, domain, blend_mode, textures, parameters |
| `ue5_create_material_instance` | Create material instance | name, parent_material, path, parameters |
| `ue5_list_assets` | List assets in path | path, type_filter, recursive |
| `ue5_search_assets` | Search assets by name | query, type_filter |

### 10.4 Compile Tools (4)

| Tool | Description | Parameters |
|------|-------------|-----------|
| `ue5_compile_cpp` | Trigger C++ compilation | clean_build (bool) |
| `ue5_hot_reload` | Trigger hot reload | — |
| `ue5_get_build_errors` | Get compilation errors | — |
| `ue5_clean_build` | Clean and full rebuild | — |

### 10.5 Level Tools (5)

| Tool | Description | Parameters |
|------|-------------|-----------|
| `ue5_load_level` | Load a level | level_path |
| `ue5_save_level` | Save current level | — |
| `ue5_get_level_info` | Get level details | (returns actors, bounds, sublevels) |
| `ue5_add_sublevel` | Add streaming sublevel | level_path, transform |
| `ue5_list_levels` | List all levels | — |

### 10.6 PIE Tools (5)

| Tool | Description | Parameters |
|------|-------------|-----------|
| `ue5_play` | Start Play-In-Editor | mode (PIE/SIE/standalone) |
| `ue5_stop` | Stop PIE | — |
| `ue5_restart_pie` | Stop and restart PIE | — |
| `ue5_screenshot` | Take viewport screenshot | filename (returns file path) |
| `ue5_get_game_log` | Get recent PIE log lines | last_n_lines |

### 10.7 Landscape Tools (4)

| Tool | Description | Parameters |
|------|-------------|-----------|
| `ue5_paint_landscape` | Paint landscape layer | layer_name, location, radius, strength |
| `ue5_add_foliage` | Add foliage instances | mesh, locations[], density, scale_range |
| `ue5_sculpt_landscape` | Modify landscape height | location, radius, strength, mode |
| `ue5_add_water` | Add water body | type (ocean/lake/river), spline_points |

### 10.8 Widget Tools (4)

| Tool | Description | Parameters |
|------|-------------|-----------|
| `ue5_create_widget` | Create UMG widget BP | name, path, root_widget_type |
| `ue5_add_widget_child` | Add child to widget | widget, child_type, name, slot_properties |
| `ue5_set_widget_property` | Set widget property | widget, widget_name, property, value |
| `ue5_preview_widget` | Preview widget in editor | widget |

### 10.9 Batch Tools (3)

| Tool | Description | Parameters |
|------|-------------|-----------|
| `ue5_batch_spawn` | Spawn multiple actors | actors[] (array of spawn params) |
| `ue5_batch_import` | Import multiple assets | source_dir, dest_path, type_filter |
| `ue5_batch_execute` | Execute multiple commands | commands[] (array of command objects) |

### 10.10 Project Tools (3)

| Tool | Description | Parameters |
|------|-------------|-----------|
| `ue5_get_project_info` | Get project metadata | (returns name, engine version, modules, plugins) |
| `ue5_get_class_hierarchy` | Get C++ class tree | root_class (e.g., "AActor") |
| `ue5_get_content_browser` | Get asset tree | path, depth |

**Total: 49 MCP tools**

---

## 11. Workflow Examples

### 11.1 "Build a complete enemy type"

```
You: "Create a Void Aberration enemy — it's a floating dark sphere that
      shoots purple projectiles, patrols between void rifts, and has 500 HP."

Claude Code:
  1. Reads game-data/npcs/shattered_coast_npcs.json for reference stats
  2. ue5_create_blueprint("BP_Enemy_VoidAberration", parent="DominionEnemyCharacter")
  3. ue5_add_component(mesh=Sphere, material=M_VoidDark)
  4. ue5_add_component(SphereCollision, radius=1000)  // aggro range
  5. ue5_add_component(NiagaraSystem)  // dark particle effect
  6. ue5_add_variable(MaxHealth=500, Damage=45, ProjectileClass=BP_VoidBolt)
  7. ue5_compile_blueprint()
  8. ue5_spawn_actor(BP_Enemy_VoidAberration, near void rift locations)
  9. ue5_screenshot() → shows result to user
  "Created BP_Enemy_VoidAberration and placed 6 instances near void rifts."
```

### 11.2 "Import all game artwork"

```
You: "Import all 5,004 art assets into UE5 and organize them properly"

Claude Code:
  1. Reads ASSETS_INTEGRATION.md for the mapping
  2. ue5_batch_import("assets/artwork/weapons/", "/Game/Textures/Items/Weapons/")
  3. ue5_batch_import("assets/artwork/armor/", "/Game/Textures/Items/Armor/")
  4. ue5_batch_import("assets/artwork/mounts/", "/Game/Textures/Mounts/")
  ... (9 categories)
  5. For each weapon texture: ue5_create_material_instance(parent=M_ItemIcon)
  6. Reports: "Imported 968 textures, created 131 material instances.
     12 files skipped (unsupported format). See log for details."
```

### 11.3 "Fix the game — it crashes when I attack"

```
You: "The game crashes when I left-click to attack"

Claude Code:
  1. ue5_get_game_log(last_n=50) → finds crash callstack
  2. Reads the relevant C++ file that crashed
  3. Identifies: null pointer in DominionCombatComponent::ProcessAttack
  4. Edits the C++ file to add null check
  5. ue5_compile_cpp()
  6. Reads compile output → clean build
  7. ue5_play()
  8. Monitors game log for 10 seconds
  9. "Fixed. The attack handler was accessing the target before null-checking.
     Added a guard. Game is running clean now — tested attack on 3 enemies."
```

---

## 12. Autonomous Build-Test-Fix Loop

The most powerful feature. Claude Code can run unsupervised cycles:

```
Mode: Autonomous
Task: "Make all 6 class abilities work in combat"

Cycle 1:
  - Reads game-data/abilities/striker_abilities.json
  - Creates BP_Ability_PowerStrike Blueprint
  - Adds damage calculation, animation montage, particle effect
  - ue5_compile → 2 errors (missing include, wrong type)
  - Fixes both errors
  - ue5_compile → clean
  - ue5_play → tests ability → works
  - "Striker: PowerStrike complete (12/120 abilities done)"

Cycle 2:
  - Creates BP_Ability_BladeFlurry (AoE)
  - ...
  (repeats for all 120 abilities)

Cycle 120:
  - "All 120 abilities implemented and tested.
     3 have known issues (see list). 117 working clean."
```

**Safety rails:**
- Max 10 consecutive compile failures → pause and ask human
- Max 3 PIE crashes → pause and ask human
- Never modifies files outside the project directory
- Creates git commits at checkpoints for rollback
- Human can interrupt at any time with Ctrl+C

---

## 13. Multi-Agent Architecture

Claude Code can run multiple agents that share the UE5 connection:

```
Main Claude Code Session
  │
  ├── Agent 1: "Server Agent"
  │   - Writing Go/Rust service code
  │   - Running tests
  │   - No UE5 interaction
  │
  ├── Agent 2: "Blueprint Agent" (uses MCP)
  │   - Creating enemy Blueprints
  │   - Setting up AI behavior trees
  │   - Compiling Blueprints
  │
  ├── Agent 3: "Asset Agent" (uses MCP)
  │   - Importing textures
  │   - Creating materials
  │   - Organizing content browser
  │
  ├── Agent 4: "Level Design Agent" (uses MCP)
  │   - Placing actors
  │   - Painting landscape
  │   - Setting up lighting
  │
  └── Agent 5: "QA Agent" (uses MCP)
      - Running PIE
      - Checking for crashes
      - Verifying gameplay
```

**Coordination:** The MCP server queues commands to prevent conflicts. Agents request locks on specific assets/actors when needed.

---

## 14. Security Model

### 14.1 Authentication

- API key required for all MCP ↔ UE5 communication
- Key stored in environment variable, never in code
- Optional: HMAC signing on requests for tamper protection

### 14.2 Authorization

- Localhost-only by default (binds to 127.0.0.1)
- Optional IP whitelist for remote development
- Read-only mode available (observe but can't modify)
- Per-tool permissions (e.g., allow spawn but not delete)

### 14.3 Safety

- All operations logged with timestamps
- Undo support (editor undo stack)
- Git commit checkpoints before major operations
- Max operation limits (prevent runaway loops)
- Human confirmation required for destructive operations (delete level, remove assets)

### 14.4 Network

- No internet exposure — all communication is localhost
- No telemetry or data collection
- No cloud dependencies — works fully offline
- API key is never sent to Anthropic or any third party

---

## 15. Distribution Strategy

### 15.1 Open Source Core

**Repository:** GitHub (public)
**License:** MIT

Includes:
- MCP server (full source)
- Tool definitions (all 49)
- Documentation and tutorials
- Example configurations
- Test suite

### 15.2 Marketplace Presence

- **npm:** `npm install -g ue-conduit`
- **Fab/Epic Marketplace:** Listed as companion to Claudius
- **GitHub Releases:** Pre-built binaries for Windows/Mac/Linux

### 15.3 Community

- Discord server for support and feature requests
- GitHub Discussions for design decisions
- Monthly dev logs / blog posts
- Video tutorials on YouTube
- Template projects for common game types

### 15.4 Compatibility

- Works with Claudius Code ($60) as the UE5 plugin
- Works with our custom open-source plugin (free)
- Works with any future UE5 plugin that exposes an HTTP API
- Plugin-agnostic MCP layer (configurable endpoints)

---

## 16. Monetization

### 16.1 Pricing: $29.99 One-Time Purchase

Half the price of Claudius ($60), double the features.

**What you get for $29.99:**
- UE Conduit UE5 Plugin (C++ source included)
- UE Conduit MCP Server (73 tools)
- All orchestration features (build-test-fix, asset pipeline, zone builder)
- Multi-agent support
- All future updates (lifetime)
- Commercial license (use in shipped games)
- Full C++ and TypeScript source code

**Free tier (open source MCP server only):**
- MCP server TypeScript code (MIT license)
- 73 tool definitions
- Community support
- Requires your own UE5 plugin (Claudius or custom)

**What's paid ($29.99):**
- UEConduit C++ plugin (the engine side)
- Pre-built, tested, ready to drop into any UE5 project
- 160+ editor commands
- WebSocket event streams
- Headless/CI mode
- Priority support via Discord

### 16.2 Distribution

- **Fab Marketplace**: Primary storefront ($29.99)
- **Itch.io**: Alternative storefront ($29.99)
- **Direct**: Via dominionmmo.com/ue-conduit ($29.99)
- **GitHub**: MCP server only (free, MIT)
- **npm**: `npm install ue-conduit` (free MCP server)

### 16.3 Revenue Projections

| Scenario | Units Sold | Revenue |
|----------|-----------|---------|
| Conservative (Year 1) | 500 | $14,997 |
| Moderate (Year 2) | 2,000 | $59,980 |
| Optimistic (Year 3) | 10,000 | $299,900 |

### 16.4 Competitive Pricing

| Product | Price | Commands | MCP | Multi-Agent | Orchestration |
|---------|-------|----------|-----|------------|---------------|
| **UE Conduit** | **$29.99** | **160+** | **Yes** | **Yes** | **Yes** |
| Claudius Code | $59.99 | 130+ | No | No | No |
| ChatGPT UE plugins | Free-$20 | 0 (text only) | No | No | No |
| GitHub Copilot | $10/mo | 0 (C++ only) | No | No | No |

---

## 17. Implementation Roadmap

### Phase 1: MVP (2 weeks)

**Goal:** Claude Code can spawn actors and compile C++ in UE5

- [ ] MCP server skeleton (TypeScript, connects to Claudius HTTP API)
- [ ] 5 core tools: spawn_actor, list_actors, compile_cpp, get_build_errors, screenshot
- [ ] Claude Code configuration
- [ ] Health monitoring and auto-reconnect
- [ ] Basic documentation

**Deliverable:** Demo video — "Claude, place 10 enemies on the beach" → happens in UE5

### Phase 2: Full Tool Coverage (2 weeks)

**Goal:** All 49 tools working

- [ ] All actor tools (8)
- [ ] All blueprint tools (6)
- [ ] All asset tools (7)
- [ ] All compile tools (4)
- [ ] All level tools (5)
- [ ] All PIE tools (5)
- [ ] All landscape tools (4)
- [ ] All widget tools (4)
- [ ] All batch tools (3)
- [ ] All project tools (3)
- [ ] Comprehensive test suite

**Deliverable:** Full tool reference documentation with examples

### Phase 3: Orchestration (2 weeks)

**Goal:** Autonomous build-test-fix loop working

- [ ] WebSocket event streaming
- [ ] Build-test-fix loop with error handling
- [ ] Asset pipeline automation
- [ ] Level builder high-level API
- [ ] Blueprint builder high-level API
- [ ] Safety rails and max iteration limits

**Deliverable:** Demo video — Claude Code autonomously builds a complete enemy type from description

### Phase 4: Multi-Agent & Polish (2 weeks)

**Goal:** Multiple agents working in parallel on UE5

- [ ] Command queue with agent coordination
- [ ] Asset locking to prevent conflicts
- [ ] Progress tracking and reporting
- [ ] Claude Desktop integration
- [ ] Screenshot/visual feedback as MCP resources
- [ ] npm package published
- [ ] GitHub repository public

**Deliverable:** Public launch — blog post, demo videos, GitHub release

### Phase 5: Community & Growth (Ongoing)

- [ ] Fab Marketplace listing
- [ ] Community Discord
- [ ] Tutorial series (YouTube + written)
- [ ] Custom UE5 plugin (open source alternative to Claudius)
- [ ] CI/CD headless mode
- [ ] Remote development support

---

## 18. Technical Deep Dives

### 18.1 MCP Protocol Specifics

The MCP server implements the Anthropic MCP specification:

```typescript
import { McpServer } from "@anthropic-ai/mcp";

const server = new McpServer({
  name: "ue-conduit",
  version: "1.0.0",
});

// Register tools
server.tool("ue5_spawn_actor", {
  description: "Spawn an actor in the UE5 editor",
  parameters: {
    type: "object",
    properties: {
      blueprint: { type: "string", description: "Blueprint path" },
      location: {
        type: "object",
        properties: {
          x: { type: "number" },
          y: { type: "number" },
          z: { type: "number" },
        },
      },
      // ...
    },
  },
  handler: async (params) => {
    const result = await ue5Client.executeCommand("level", "spawn_actor", {
      class_path: params.blueprint,
      location: params.location,
      actor_label: params.label,
    });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  },
});

// Register resources
server.resource("editor://state", {
  description: "Current UE5 editor state",
  handler: async () => {
    const state = await ue5Client.getEditorState();
    return { content: [{ type: "text", text: JSON.stringify(state) }] };
  },
});

server.listen();
```

### 18.2 Claudius Command Translation

The MCP server translates high-level tool calls into Claudius JSON commands:

```typescript
// MCP tool call from Claude Code:
// ue5_spawn_actor({ blueprint: "/Game/Blueprints/BP_Enemy", location: {x:100, y:200, z:0} })

// Translated to Claudius HTTP POST:
const claudiusRequest = {
  command_id: `spawn_${Date.now()}`,
  category: "level",
  command: "spawn_actor",
  params: {
    class_path: "/Game/Blueprints/BP_Enemy",
    location: { x: 100, y: 200, z: 0 },
    rotation: { pitch: 0, yaw: 0, roll: 0 },
    actor_label: "Enemy_001"
  }
};

const response = await fetch("http://localhost:8080", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(claudiusRequest),
});
```

### 18.3 Error Recovery

```typescript
class ErrorRecovery {
  // Compile error → parse error, locate file, fix, recompile
  async handleCompileError(error: CompileError): Promise<FixResult> {
    // 1. Parse error message for file path and line number
    const { file, line, message } = parseCompileError(error);

    // 2. Return error details to Claude Code for fixing
    return {
      type: "compile_error",
      file,
      line,
      message,
      suggestion: "Fix the error and call ue5_compile_cpp again",
    };
  }

  // PIE crash → read crash log, identify cause
  async handlePIECrash(crashLog: string): Promise<CrashAnalysis> {
    return {
      type: "pie_crash",
      callstack: parseCrashCallstack(crashLog),
      likelyCause: identifyLikelyCause(crashLog),
      suggestion: "Examine the callstack and fix the null pointer/assertion",
    };
  }

  // Connection lost → queue commands, reconnect, replay
  async handleDisconnect(): Promise<void> {
    // Commands are queued automatically
    // Reconnection attempts every 5 seconds with backoff
    // On reconnect: replay queued commands in order
  }
}
```

---

## 19. API Reference

### 19.1 MCP Server Configuration

| Env Variable | Default | Description |
|-------------|---------|-------------|
| `UE5_HOST` | `localhost` | UE5 plugin host |
| `UE5_PORT` | `8080` | UE5 plugin HTTP port (Claudius default) |
| `UE5_CUSTOM_PORT` | `9377` | Custom plugin HTTP port (if using hybrid) |
| `UE5_WS_PORT` | `9378` | WebSocket port for event streams |
| `UE5_API_KEY` | — | Authentication key |
| `UE5_PROJECT_PATH` | — | Absolute path to .uproject file |
| `UE5_LOG_LEVEL` | `info` | Logging verbosity (debug/info/warn/error) |
| `UE5_MAX_RETRIES` | `3` | Max retries per command |
| `UE5_TIMEOUT_MS` | `30000` | Command timeout in milliseconds |
| `UE5_BATCH_SIZE` | `50` | Max items per batch operation |

### 19.2 MCP Resources

| Resource URI | Description | Auto-refresh |
|-------------|-------------|-------------|
| `editor://state` | Current level, selected actors, build status, PIE status | 5s |
| `editor://log` | Last 100 lines of UE5 output log | Real-time |
| `editor://project` | Project structure, asset tree, C++ classes | On-demand |
| `editor://screenshot` | Latest viewport screenshot (PNG) | On-demand |
| `editor://build` | Last build result (errors, warnings) | On-compile |

---

## 20. FAQ

**Q: Do I still need the UE5 Claude chat panel?**
A: No. Claude Code controls UE5 directly. The chat panel becomes optional.

**Q: What if UE5 crashes?**
A: Claude Code retains full context. It detects the crash via connection loss, waits for UE5 to restart, reconnects, and continues where it left off.

**Q: Can this work with Unreal Engine 4?**
A: The MCP server is engine-agnostic. If UE4 has an HTTP API plugin, it would work. Claudius supports UE5 5.4+ only.

**Q: Does this replace Claudius?**
A: No — it builds on top of it. Claudius provides the 130+ commands inside UE5. We provide the MCP bridge that connects Claude Code to those commands.

**Q: Can I use this with GPT-4/Gemini instead of Claude?**
A: MCP is currently Claude-specific. However, the HTTP API layer works with any AI that can make HTTP calls. MCP support for other models may come in the future.

**Q: How fast is it?**
A: Command round-trip is ~50-100ms. Batch operations (spawning 100 actors) complete in ~2-5 seconds. Asset imports depend on file size but are parallelized.

**Q: Is this production-safe?**
A: The plugin is editor-only and never ships with your game. It cannot affect packaged builds. All operations go through UE5's standard editor APIs.

**Q: Can multiple developers share one MCP server?**
A: Studio tier supports this. Each developer's Claude Code connects to a shared MCP server, with command attribution and conflict resolution.

---

## Appendix: Why This Changes Everything

Today, AI-assisted game development is:
- Text → human copies → editor → human verifies → text → repeat

Tomorrow, with UE Conduit:
- Natural language → direct editor control → autonomous verification → done

The developer becomes a **director**, not a **typist**. You describe what you want, Claude builds it, tests it, fixes it, and shows you the result. The copy-paste era is over.

**This is the future of game development. Let's build it.**

---

*UE Conduit — Designed by Jag Journey, LLC*
*For the game development community*
*March 2026*
