# CLAUDE.md — UE Conduit with Claude

## What This Is

An MCP server that gives Claude Code direct control over Unreal Engine 5's editor. Instead of copy-pasting prompts, Claude Code calls tools like `ue5_spawn_actor`, `ue5_compile_cpp`, `ue5_play` that execute immediately in UE5.

## Project Structure

```
ue-conduit/
  package.json              # Node.js project (TypeScript)
  tsconfig.json             # TypeScript config
  src/
    mcp-server/
      index.ts              # MCP server entrypoint (stdio transport)
      config.ts             # Environment variable configuration
      connection/
        ue5-client.ts       # HTTP client to UE5 plugin (retries, health check)
      tools/
        actor-tools.ts      # 8 tools: spawn, delete, move, list, query, set_property, batch, select
        blueprint-tools.ts  # 6 tools: create, add_component, add_variable, compile, list, get_info
        asset-tools.ts      # 7 tools: import_texture, import_mesh, create_material, create_mi, batch, list, search
        compile-tools.ts    # 4 tools: compile_cpp, hot_reload, get_errors, build_lighting
        pie-tools.ts        # 6 tools: play, stop, restart, screenshot, get_log, console_command
        editor-tools.ts     # 8 tools: get_state, save, load, undo, redo, focus_viewport, notify, save_all
      resources/            # MCP resources (editor state, build status)
      orchestration/        # High-level orchestration (build-test-fix loops)
      utils/
        logger.ts           # Structured logging
    ue5-plugin/             # Future: our own UE5 C++ plugin
  docs/
    DESIGN.md               # Full product specification
    UE5_PLUGIN_SPEC.md      # UE5 plugin specification (160+ commands)
  tests/                    # Test suite
  scripts/                  # Setup and utility scripts
  examples/                 # Example configurations
```

## How To Use

1. Install: `npm install`
2. Configure Claude Code MCP: Add to `~/.claude/settings.json`
3. Open UE5 with a compatible plugin (Claudius or UEConduit)
4. Talk to Claude Code — it now has UE5 tools available

## Build Commands

```bash
npm install        # Install dependencies
npm run build      # Compile TypeScript
npm run dev        # Development mode with hot reload
npm test           # Run tests
```

## Architecture

Claude Code → MCP Protocol (stdio) → This Server → HTTP POST → UE5 Plugin → Editor APIs

## Key Design Decision

The MCP server is engine-plugin-agnostic. It sends JSON commands over HTTP. Any UE5 plugin that accepts JSON commands on an HTTP port will work (Claudius format is the default).
