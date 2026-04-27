# UE Conduit

**The conduit between AI and engine.**

UE Conduit gives AI **direct programmatic control** over Unreal Engine 5's editor. No more copy-pasting prompts between AI interfaces. You say *"place 20 enemies on the beach"* and it happens -- instantly, in the editor.

Works with **Claude Code, Claude Desktop, OpenAI/GPT, xAI/Grok, Google Gemini, Ollama (free/local),** or any custom LLM endpoint.

---

## How It Works

```
You: "Add enemies to the beach with patrol routes"
         |
    Claude Code / Claude Desktop / In-Editor Panel
         |  (MCP Protocol -- 220+ tools)
    UE Conduit MCP Server (TypeScript)
         |  (HTTP JSON commands)
    UE Conduit Plugin (C++ inside UE5)
         |  (UE5 Editor APIs)
    Unreal Engine 5.7 Editor
```

One AI. Direct control. Zero copy-paste.

---

## Features

- **220+ tools** across 30+ categories -- actors, blueprints, assets, materials, compile, PIE, landscape, water, foliage, Fab marketplace, screenshots, widgets, animation, input, AI, Niagara, data tables, orchestration, and more
- **UE5 C++ plugin** -- 160+ editor commands via embedded HTTP server on port 9377 (no third-party dependencies)
- **6 LLM providers** -- Claude, OpenAI/GPT, xAI/Grok, Google Gemini, Ollama (free/local), custom endpoints
- **In-editor panel** -- chat with any LLM directly inside UE5 (Window > Developer Tools > UE Conduit)
- **Autonomous build-test-fix loop** -- AI compiles, tests, reads errors, fixes, and repeats automatically
- **Asset pipeline** -- batch import thousands of files with auto-categorization and material creation
- **Zone builder** -- reads JSON game data and populates levels automatically
- **Visual world builder** -- create landscapes, sculpt terrain, paint layers, scatter foliage, add water bodies
- **Real-time feedback** -- WebSocket streams for logs, compilation, and PIE output
- **Crash-resilient** -- context lives in the AI client, not UE5. Editor crashes don't lose work.
- **Multi-agent** -- multiple AI agents working on different parts of the editor simultaneously
- **Headless/CI mode** -- run UE5 automation without the editor GUI

---

## Quick Start

### 1. Install the UE5 Plugin

Purchase from [Fab marketplace](https://fab.com) ($29.99) and copy `UEConduit/` into your UE5 project's `Plugins/` folder. Restart the editor.

### 2. Install the MCP Server

```bash
npm install -g ue-conduit
```

### 3. Configure Your AI Client

**Claude Code** -- add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "ue-conduit": {
      "command": "npx",
      "args": ["ue-conduit"],
      "env": {
        "UE5_HOST": "localhost",
        "UE5_PORT": "9377"
      }
    }
  }
}
```

**Other LLMs** -- use the in-editor panel (Window > Developer Tools > UE Conduit) with your API key. See [docs/LLM_PROVIDERS.md](docs/LLM_PROVIDERS.md) for OpenAI, xAI, Gemini, and Ollama setup.

### 4. Use It

Open your UE5 project, then talk to your AI:

```
You: "What's open in the editor?"
AI:  "L_ShatteredCoast with 263 actors. Build is clean. PIE stopped."

You: "Spawn 10 enemy crabs along the beach"
AI:  "Done. 10 BP_Enemy_Crab placed from x=500 to x=5000."

You: "Compile and test"
AI:  "Clean build. PIE running. No runtime errors detected."
```

See [docs/INSTALLATION.md](docs/INSTALLATION.md) for detailed setup instructions and troubleshooting.

---

## Tool Categories

| Category | Tools | Examples |
|----------|-------|---------|
| **Actors** | 8 | spawn, delete, move, list, query, set_property, batch_spawn, select |
| **Blueprints** | 6 | create, add_component, add_variable, compile, list, get_info |
| **Assets** | 7 | import_texture, import_mesh, create_material, create_material_instance, batch_import, list, search |
| **Compile** | 4 | compile_cpp, hot_reload, get_build_errors, build_lighting |
| **PIE** | 6 | play, stop, restart, screenshot, get_game_log, console_command |
| **Editor** | 8 | get_state, save, save_all, load_level, undo, redo, focus_viewport, notify |
| **Landscape** | 6 | create, sculpt, paint_layer, add_foliage, get_info, set_material |
| **Water** | 3 | create_water_body, set_water_properties, list_water_bodies |
| **Foliage** | 5 | add_type, paint, scatter, remove, list_types |
| **Fab** | 4 | list_local, import_local, search_content, list_vault |
| **Screenshot** | 3 | take_screenshot, set_viewport_camera, get_viewport_camera |
| **Widgets** | 5 | create_widget, add_child, set_property, set_binding, list |
| **Animation** | 4 | create_anim_bp, create_montage, create_blend_space, preview |
| **Input** | 4 | create_action, create_mapping_context, add_key_mapping, list |
| **AI** | 5 | create_behavior_tree, create_blackboard, add_key, build_navmesh, query |
| **Niagara** | 4 | create_system, set_parameter, create_emitter, list |
| **Data** | 4 | create_datatable, import_json, create_curve, create_data_asset |
| **Orchestration** | 3 | build_test_fix, import_directory, populate_zone |

**79 MCP tools + 160+ C++ plugin commands = 220+ total.** See [docs/COMMANDS.md](docs/COMMANDS.md) for the complete reference with parameters, examples, and response formats.

---

## Supported LLM Providers

| Provider | Integration | API Key Required |
|----------|------------|-----------------|
| **Claude** | MCP (Claude Code / Claude Desktop) | No (uses your Claude subscription) |
| **OpenAI / GPT** | In-editor panel | Yes |
| **xAI / Grok** | In-editor panel | Yes |
| **Google Gemini** | In-editor panel | Yes |
| **Ollama** | In-editor panel (local) | No (free, runs locally) |
| **Custom** | In-editor panel | Configurable |

See [docs/LLM_PROVIDERS.md](docs/LLM_PROVIDERS.md) for configuration details.

---

## Orchestration

### Autonomous Build-Test-Fix

Your AI can autonomously compile, test, and fix issues without human intervention:

```
You: "Make the basic attack work"

AI:  1. Edits DominionCombatComponent.cpp
     2. Calls ue5_compile_cpp -> 2 errors
     3. Fixes both errors
     4. Calls ue5_compile_cpp -> clean build
     5. Calls ue5_play -> starts PIE
     6. Calls ue5_get_game_log -> no runtime errors
     7. Calls ue5_screenshot -> shows result
     "Attack system working. Left-click deals damage to targeted enemy."
```

### Batch Asset Import

```
You: "Import all 5000 artwork files into UE5"

AI:  Calls ue5_import_directory("assets/artwork/", "/Game/Textures/")
     -> Imports 968 textures, creates 131 material instances
     -> Auto-detects normal maps, sets compression correctly
     "968/968 imported. 131 materials created. 0 failures."
```

### Zone Population from Game Data

```
You: "Build the Shattered Coast from our game data JSON"

AI:  Calls ue5_populate_zone("game-data/zones/shattered_coast.json")
     -> Spawns 35 NPCs, 45 enemies, 9 gathering nodes
     -> Configures lighting, water, ambient audio
     "Zone populated with 89 actors from game data."
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/INSTALLATION.md](docs/INSTALLATION.md) | Step-by-step installation for plugin, MCP server, and AI clients |
| [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) | Complete setup for all 6 LLM providers |
| [docs/COMMANDS.md](docs/COMMANDS.md) | Complete reference for all 220+ tools with parameters and examples |
| [docs/LLM_PROVIDERS.md](docs/LLM_PROVIDERS.md) | LLM provider configuration (Claude, OpenAI, xAI, Gemini, Ollama) |
| [docs/TUTORIALS.md](docs/TUTORIALS.md) | 6 hands-on tutorials from "Hello World" to autonomous build-test-fix |
| [docs/API.md](docs/API.md) | REST API reference for the HTTP endpoint the C++ plugin exposes |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, thread safety, plugin lifecycle, adding custom commands |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Version history and release notes |
| [docs/FAQ.md](docs/FAQ.md) | Frequently asked questions about compatibility, performance, security, pricing |
| [docs/FEATURES.md](docs/FEATURES.md) | Complete feature list and comparison with alternatives |

---

## Project Structure

```
ue-conduit/
  package.json                  # npm: ue-conduit (v1.0.0)
  tsconfig.json
  README.md
  CLAUDE.md                     # AI context file
  src/
    mcp-server/                 # TypeScript MCP server (MIT, free)
      index.ts                  # Entrypoint -- registers 220+ tools
      config.ts                 # Environment configuration
      connection/
        ue5-client.ts           # HTTP client with retries & health check
        websocket-client.ts     # WebSocket for real-time events
      llm/                      # 6 LLM provider integrations
      tools/                    # 18 tool category files
      resources/                # 4 MCP resources
      orchestration/            # Build-test-fix, asset pipeline, zone builder
      utils/
  docs/                         # Complete documentation (18 files)
```

---

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `UE5_HOST` | `localhost` | UE5 plugin host |
| `UE5_PORT` | `9377` | UE5 plugin HTTP port |
| `UE5_WS_PORT` | `8081` | WebSocket port |
| `UE5_API_KEY` | -- | Authentication key (optional) |
| `UE5_PROJECT_PATH` | -- | Path to .uproject file |
| `UE5_LOG_LEVEL` | `info` | debug / info / warn / error |
| `UE5_MAX_RETRIES` | `3` | Retries per command |
| `UE5_TIMEOUT_MS` | `30000` | Command timeout |
| `UE5_BATCH_SIZE` | `50` | Default batch size for bulk operations |

---

## Supported Versions

- Unreal Engine 5.4, 5.5, 5.6, 5.7
- Node.js 20+
- Claude Code / Claude Desktop / OpenAI / xAI / Gemini / Ollama

---

## Why Not Just Use Claudius?

| Feature | Claudius ($60/seat) | UE Conduit ($29.99) |
|---------|--------------------|--------------------|
| Total Tools | ~180 | **220+** |
| C++ Plugin Commands | 130+ | **160+** |
| LLM Providers | Claude only | **6 (Claude, GPT, Grok, Gemini, Ollama, Custom)** |
| In-Editor Panel | No | **Yes** |
| MCP built-in | No | **Yes (zero-config)** |
| WebSocket streams | No | **Yes (5 streams)** |
| Landscape / Water / Foliage | Limited | **Full** |
| Widget/UMG creation | Limited | **Full** |
| Niagara/VFX | No | **Yes** |
| Headless mode | No | **Yes (CI/CD)** |
| Orchestration | No | **Autonomous loops** |
| Multi-agent | No | **Yes** |
| Asset Pipeline | No | **Batch import + auto-categorize** |
| Zone Builder | No | **JSON -> populated level** |
| Price | $60/seat | **$29.99 one-time** |

---

## Development

```bash
npm install        # Install dependencies
npm run build      # Compile TypeScript
npm run dev        # Dev mode with hot reload
npm test           # Run tests
npm run setup      # Generate Claude Code config
```

---

## License

MIT License (MCP Server) + Commercial License (UE5 Plugin) -- Jag Journey, LLC

## Links

- **GitHub:** https://github.com/jagjourney/ue-conduit
- **npm:** `npm install -g ue-conduit`
- **Author:** Jag Journey, LLC
- **Built for:** [Dominion MMO](https://dominionmmo.com)
