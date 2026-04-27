# UE Conduit -- Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-03-24

### Added

- **Official v1.0.0 release** -- production-ready with 220+ tools across 30+ categories
- **In-editor panel** -- Window > Developer Tools > UE Conduit for direct LLM chat inside UE5
- **6 LLM provider integrations** -- Claude, OpenAI, xAI (Grok), Google Gemini, Ollama (local/free), Custom endpoint
- **Widget/UMG creation tools** -- create_widget, add_child, set_property, set_binding, list
- **Animation tools** -- create_anim_bp, create_montage, create_blend_space, preview
- **Enhanced Input tools** -- create_action, create_mapping_context, add_key_mapping, list
- **AI/Navigation tools** -- create_behavior_tree, create_blackboard, add_key, build_navmesh, query
- **Niagara/VFX tools** -- create_system, set_parameter, create_emitter, list
- **Data Asset tools** -- create_datatable, import_json, create_curve, create_data_asset
- **Complete documentation suite** -- 18 docs covering installation, tutorials, API, architecture, FAQ, and more
- **Multi-agent support** -- multiple Claude agents working on different parts of the editor simultaneously
- **Headless/CI mode** -- run UE5 automation without the editor GUI

### Changed

- Version bumped to 1.0.0 across all documentation, MCP server, and package config
- Tool count increased from 79 to **220+** (including C++ plugin commands)
- Default port standardized at **9377** across all documentation and config

---

## [0.2.0] - 2026-03-24

### Added

- **Landscape tools** -- Create landscapes, sculpt terrain, paint material weight layers, get landscape info, set landscape materials
- **Water body tools** -- Create ocean, lake, and river water bodies with spline points, configure wave and color properties, list water bodies
- **Foliage tools** -- Register foliage types, paint foliage in circular areas, scatter foliage across rectangular regions, remove foliage, list foliage types
- **Fab marketplace tools** -- List local Fab assets, import local files/directories, search content browser by keyword, list Epic Launcher vault cache
- **Screenshot and viewport tools** -- Enhanced screenshot capture with camera positioning and look-at targeting, set/get viewport camera with FOV control
- **6 new landscape commands** in the C++ plugin: create_landscape, sculpt, paint_layer, get_landscape_info, set_landscape_material, add_foliage
- **3 new water commands** in the C++ plugin: create_water_body, set_water_properties, list_water_bodies
- **5 new foliage commands** in the C++ plugin: add_foliage_type, paint_foliage, scatter_foliage, remove_foliage, list_foliage_types
- **4 new Fab commands** in the C++ plugin: list_local, import_local, search_content, list_vault
- Complete product documentation: INSTALLATION.md, COMMANDS.md, TUTORIALS.md, API.md, ARCHITECTURE.md, FAQ.md

### Changed

- Default HTTP port changed from 8080 to **9377** to avoid conflicts with common development servers
- Tool count increased from 73 to **79** (76 individual tools + 3 orchestration tools)
- README.md updated with new tool categories, command counts, and feature descriptions

### Fixed

- `FHttpPath` crash when malformed request paths were received by the C++ plugin
- Asset import threading issue -- all imports now execute synchronously on the game thread
- Duplicate actor name crash when spawning actors with labels that already exist in the level
- WebSocket reconnection would sometimes fail silently after editor restart

---

## [0.1.3] - 2026-03-20

### Fixed

- **Duplicate actor name crash** -- Spawning an actor with a label that already existed would crash the editor. Now auto-appends a numeric suffix (e.g., `Enemy_Crab_2`)
- Actor deletion now correctly handles actors in sublevels
- `list_actors` with `class_filter` parameter was case-sensitive; now case-insensitive

---

## [0.1.2] - 2026-03-18

### Fixed

- **Asset import threading** -- `import_texture` and `import_mesh` were executing on the HTTP thread instead of the game thread, causing intermittent crashes. All asset import operations now dispatch to the game thread synchronously
- `create_material` would fail silently if the destination folder did not exist; now auto-creates the folder
- `batch_import` progress tracking was not reporting individual file failures

### Changed

- All command handlers now use `AsyncTask(ENamedThreads::GameThread)` for game-thread dispatch
- Improved error messages for asset-related failures to include the exact asset path

---

## [0.1.1] - 2026-03-15

### Fixed

- **`FHttpPath` crash** -- The HTTP server would crash when receiving requests with malformed paths (e.g., double slashes, query strings). Request routing now normalizes paths before processing
- Port configuration via `-UEConduitPort=` command line argument was not being parsed correctly on some systems

### Changed

- Default port changed from 8080 to **9377** to avoid conflicts with common development tools (React dev server, Spring Boot, etc.)
- Health check endpoint moved from `GET /` to `GET /health` for clarity
- Improved startup log messages with boxed formatting for visibility

---

## [0.1.0] - 2026-03-10

### Added

Initial release of UE Conduit.

**MCP Server (TypeScript):**
- 73 MCP tools across 14 categories
- 4 MCP resources (editor state, build status, project structure, game log)
- 3 orchestration tools (build-test-fix, import-directory, populate-zone)
- UE5 HTTP client with retry logic and exponential backoff
- WebSocket client for real-time event streams with auto-reconnect
- Environment variable configuration with sensible defaults
- Automated Claude Code/Desktop config generation script
- Full Zod schema validation on all tool parameters

**UE5 C++ Plugin:**
- Embedded HTTP server using `FHttpServerModule`
- JSON request/response protocol
- 10 command handler categories: level, editor, blueprint, asset, build, PIE, landscape, water, foliage, fab
- Game-thread command dispatch for thread safety
- API key authentication support
- Configurable port via command line argument
- Undo/redo transaction support for applicable commands

**Tool Categories:**
- Actor management (8 tools): spawn, delete, move, list, query, set property, batch spawn, select
- Blueprint (6 tools): create, add component, add variable, compile, list, get info
- Asset import (7 tools): import texture, import mesh, create material, create material instance, batch import, list, search
- Compile/Build (4 tools): C++ compile, hot reload, get errors, build lighting
- PIE (6 tools): play, stop, restart, screenshot, get log, console command
- Editor (8 tools): get state, save, save all, load level, undo, redo, focus viewport, notify
- Widget/UMG (5 tools): create widget, add child, set property, set binding, list
- Animation (4 tools): create anim blueprint, create montage, create blend space, play preview
- Enhanced Input (4 tools): create action, create mapping context, add key mapping, list
- AI/Navigation (5 tools): create behavior tree, create blackboard, add key, build navmesh, query navmesh
- Niagara/VFX (4 tools): create system, set parameter, create emitter, list
- Data Assets (4 tools): create datatable, import JSON, create curve, create data asset

**Orchestration:**
- Autonomous build-test-fix loop with configurable max iterations
- Batch asset import pipeline with auto-categorization and normal map detection
- Zone population from JSON game data definitions

**Infrastructure:**
- npm package: `ue-conduit`
- TypeScript with strict compilation
- Vitest test framework
- ESLint configuration
- Hot-reload development mode via tsx

---

*UE Conduit -- The conduit between AI and engine.*
*Jag Journey, LLC*
