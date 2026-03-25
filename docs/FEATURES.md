# UE Conduit with Claude — Complete Feature List

**Price: $29.99** (one-time, lifetime updates, commercial license)
**Competitor: Claudius Code — $59.99/seat**

---

## At a Glance

| Feature | UE Conduit ($29.99) | Claudius ($59.99) |
|---------|---------------------|-------------------|
| Total Commands | **160+** | 130+ |
| MCP Protocol | **Native** | No |
| Claude Code Integration | **Zero-config** | Manual |
| Claude Desktop Integration | **Yes** | No |
| Multi-Agent Support | **Yes (unlimited)** | No |
| WebSocket Streams | **5 streams** | No |
| Autonomous Build-Test-Fix | **Yes** | No |
| Asset Pipeline Automation | **Yes** | No |
| Zone Builder from JSON | **Yes** | No |
| Blueprint Node Graph | **Full (wire pins)** | Basic |
| Widget/UMG Creation | **Full** | Limited |
| Enhanced Input System | **Yes** | No |
| Niagara/VFX Control | **Yes** | No |
| AI/BehaviorTree | **Yes** | Yes |
| Headless/CI Mode | **Yes** | No |
| Source Code | **Full (C++ & TS)** | C++ only |
| License | **MIT (MCP) + Commercial (Plugin)** | Per-seat |
| Price | **$29.99 one-time** | **$59.99/seat** |

---

## MCP Server Features (73 Tools)

### Actor Management (8 tools)
- `ue5_spawn_actor` — Spawn any actor by Blueprint path or C++ class
- `ue5_delete_actor` — Remove actor by label
- `ue5_move_actor` — Set position, rotation, scale
- `ue5_list_actors` — List with class/tag/name filters
- `ue5_query_actor` — Get all properties via reflection
- `ue5_set_actor_property` — Set any UPROPERTY by dot-notation path
- `ue5_batch_spawn` — Spawn hundreds of actors in one call
- `ue5_select_actor` — Select in editor viewport

### Blueprint Creation (6 tools)
- `ue5_create_blueprint` — Create BP from parent class with components
- `ue5_add_component` — Add any component type
- `ue5_add_variable` — Add variables with types and defaults
- `ue5_compile_blueprint` — Compile and get errors
- `ue5_list_blueprints` — Browse all BPs
- `ue5_get_blueprint_info` — Inspect variables, components, functions

### Asset Import & Management (7 tools)
- `ue5_import_texture` — PNG/JPG/TGA with compression settings
- `ue5_import_mesh` — FBX/OBJ/glTF (static or skeletal)
- `ue5_create_material` — Materials with texture inputs and parameters
- `ue5_create_material_instance` — Material instances with overrides
- `ue5_batch_import` — Import entire directories (auto-categorizes)
- `ue5_list_assets` — Content browser listing
- `ue5_search_assets` — Full-text asset search

### Compilation & Building (4 tools)
- `ue5_compile_cpp` — Trigger C++ compilation (Ctrl+Alt+F11 equivalent)
- `ue5_hot_reload` — Hot reload modules without full recompile
- `ue5_get_build_errors` — Parse and return all build errors
- `ue5_build_lighting` — Build lighting (Preview/Medium/High/Production)

### Play-In-Editor (6 tools)
- `ue5_play` — Start PIE (PIE/SIE/Standalone modes)
- `ue5_stop` — Stop PIE
- `ue5_restart_pie` — Stop + Start for quick iteration
- `ue5_screenshot` — Capture viewport to PNG
- `ue5_get_game_log` — Read recent game output (for debugging)
- `ue5_execute_console_command` — Run any console command

### Editor Operations (8 tools)
- `ue5_get_editor_state` — Current level, selection, PIE state, build status
- `ue5_save_level` — Save current level
- `ue5_save_all` — Save all dirty assets
- `ue5_load_level` — Load a level by path
- `ue5_undo` — Undo last action
- `ue5_redo` — Redo last undone action
- `ue5_focus_viewport` — Move camera to location
- `ue5_notify` — Show toast notification in editor

### Landscape & Environment (5 tools)
- `ue5_create_landscape` — Create landscape actor with dimensions
- `ue5_sculpt_landscape` — Raise/lower terrain
- `ue5_paint_landscape_layer` — Weight-paint material layers
- `ue5_add_foliage` — Place foliage instances (grass, rocks, trees)
- `ue5_add_water_body` — Add ocean, lake, or river

### Widget / UMG (5 tools)
- `ue5_create_widget` — Create Widget Blueprint
- `ue5_add_widget_child` — Add child widgets (text, image, progress bar, button)
- `ue5_set_widget_property` — Set any widget property
- `ue5_set_widget_binding` — Bind property to Blueprint variable
- `ue5_list_widgets` — List all widget BPs

### Animation (4 tools)
- `ue5_create_anim_blueprint` — Create Animation Blueprint
- `ue5_create_montage` — Create animation montage
- `ue5_create_blend_space` — Create 1D/2D blend space
- `ue5_play_animation_preview` — Preview in editor

### Enhanced Input (4 tools)
- `ue5_create_input_action` — Create Input Action asset
- `ue5_create_mapping_context` — Create Input Mapping Context
- `ue5_add_key_mapping` — Add key binding to context
- `ue5_list_input_actions` — List all actions and contexts

### AI & Navigation (5 tools)
- `ue5_create_behavior_tree` — Create Behavior Tree asset
- `ue5_create_blackboard` — Create Blackboard Data asset
- `ue5_add_blackboard_key` — Add typed key (bool, float, vector, object)
- `ue5_build_navmesh` — Build navigation mesh
- `ue5_query_navmesh` — Test point navigability

### Niagara / VFX (4 tools)
- `ue5_create_niagara_system` — Create particle system
- `ue5_set_niagara_parameter` — Set system parameter
- `ue5_create_niagara_emitter` — Create emitter
- `ue5_list_niagara_systems` — List all systems

### Data Assets (4 tools)
- `ue5_create_datatable` — Create DataTable from struct
- `ue5_import_json_to_datatable` — Import JSON as rows
- `ue5_create_curve` — Create float/color curve
- `ue5_create_data_asset` — Create primary data asset

### Orchestration (3 tools)
- `ue5_build_test_fix` — Autonomous compile-test-fix loop
- `ue5_import_directory` — Batch import with auto-categorization
- `ue5_populate_zone` — Build zone from JSON game data

---

## MCP Resources (4)

| Resource URI | Description | Refresh |
|-------------|-------------|---------|
| `editor://state` | Level, actors, PIE status, build status, selection | 5s poll |
| `editor://build` | Last compile result, errors, warnings, duration | On compile |
| `editor://project` | Project name, modules, plugins, content folders | On demand |
| `editor://log` | Last 100 lines of UE5 output log | Real-time |

---

## UE5 C++ Plugin Features (35+ Commands)

### HTTP Server
- Embedded HTTP server on configurable port (default 8080)
- JSON request/response protocol
- ~10-50ms command latency
- API key authentication
- Game-thread dispatch for thread safety
- Execution timing on every response

### WebSocket Streams (5)
- `/ws/log` — Real-time UE5 output log
- `/ws/compile` — Live compilation output
- `/ws/pie` — PIE game log and events
- `/ws/editor` — Editor events (selection, save, level change)
- `/ws/progress` — Long-running operation progress

### Command Categories
- **Level** (7): spawn, delete, transform, list, query, set_property, select
- **Editor** (9): state, save, save_all, load, undo, redo, camera, screenshot, notify
- **Blueprint** (4): create, add_component, add_variable, compile
- **Asset** (5): import, create_material, create_material_instance, search, batch_import
- **Build** (3): compile, get_errors, build_lighting
- **PIE** (4): start, stop, get_log, execute_console

### UE5 API Integration
- Full UPROPERTY reflection for reading/writing any actor property
- Blueprint creation via FKismetEditorUtilities
- Asset import via UAssetImportTask
- Undo/redo transaction support
- Live Coding integration
- FEditorViewportClient camera control
- FScreenshotRequest for viewport capture

---

## Orchestration Engine Features

### Autonomous Build-Test-Fix Loop
1. Claude writes/modifies C++ code
2. Triggers compilation via MCP
3. Reads build errors from WebSocket
4. If errors → fixes code → recompiles (up to 10 iterations)
5. If clean → starts PIE
6. Reads game log for runtime errors
7. If crash → analyzes → fixes → recompiles
8. If clean → takes screenshot → reports success

**Safety:** Max 10 iterations, human can interrupt anytime

### Asset Pipeline
- Scan source directory for all importable files
- Auto-categorize: textures, meshes, audio, animations
- Auto-detect normal maps (filename pattern matching)
- Import in configurable batches (default 50)
- Create materials by grouping textures (diffuse + normal → material)
- Progress tracking with success/failure counts

### Zone Builder
- Read JSON zone definition files
- Spawn NPCs at defined positions
- Spawn enemies with levels and patrol routes
- Place gathering nodes with respawn timers
- Configure lighting (directional, point, spot)
- Add water bodies, foliage, ambient audio
- Full summary report of placed actors

---

## Integration Features

### Claude Code CLI
- Zero-config MCP registration
- All 73 tools available immediately
- Sub-agent support for parallel work
- Full project context (server + client + docs)

### Claude Desktop
- Same MCP server works with Desktop app
- Visual feedback via screenshots
- Project structure as browsable resource

### Multi-Agent Support
- Multiple Claude agents can control UE5 simultaneously
- Command queue prevents conflicts
- Asset locking for concurrent operations
- Progress tracking per agent

### Crash Resilience
- All context preserved in Claude Code (not UE5)
- Auto-reconnect on editor crash
- Command replay after reconnection
- No work lost on UE5 crash

---

## Supported Versions

| Engine | Status |
|--------|--------|
| UE5 5.7 | Fully tested |
| UE5 5.6 | Compatible |
| UE5 5.5 | Compatible |
| UE5 5.4 | Compatible |
| UE5 5.3 and below | Not supported |
| UE4 | Not supported |

---

## LLM Compatibility

| LLM | Status | Protocol |
|-----|--------|----------|
| **Claude** (Anthropic) | **Supported** | MCP (native) |
| GPT-4/o (OpenAI) | Planned | HTTP API |
| Gemini (Google) | Planned | HTTP API |
| Llama (Meta) | Planned | HTTP API |
| Mistral | Planned | HTTP API |

The HTTP API layer is LLM-agnostic. Any AI that makes HTTP calls can use UE Conduit.

---

## What's Included in $29.99

1. **UEConduit.uplugin** — Drop-in UE5 editor plugin
2. **Full C++ source** — 3,500+ lines, 19 files, modify as needed
3. **MCP server** — TypeScript, 73 tools, ready to run
4. **Orchestration engine** — Build-test-fix, asset pipeline, zone builder
5. **Documentation** — Full design spec, plugin spec, setup guide
6. **Setup script** — Auto-generates Claude Code/Desktop config
7. **Lifetime updates** — All future versions included
8. **Commercial license** — Use in shipped games
9. **Discord support** — Priority help channel

---

## What's Free (Open Source)

1. **MCP server TypeScript code** (MIT license)
2. **Tool definitions** (all 73)
3. **Documentation**
4. **Orchestration engine**

The MCP server works with any UE5 plugin that accepts HTTP JSON commands (Claudius, custom, etc.). The paid product is our UEConduit C++ plugin — the engine-side piece that actually executes commands.

---

*UE Conduit with Claude — The conduit between AI and engine.*
*Jag Journey, LLC — $29.99 at fab.com*
