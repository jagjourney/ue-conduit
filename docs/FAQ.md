# UE Conduit -- Frequently Asked Questions

---

## Table of Contents

1. [General](#general)
2. [Compatibility](#compatibility)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Performance](#performance)
6. [Security](#security)
7. [Pricing and Licensing](#pricing-and-licensing)
8. [Troubleshooting](#troubleshooting)
9. [Comparison](#comparison)
10. [Development](#development)

---

## General

### What is UE Conduit?

UE Conduit is a two-part system that gives AI assistants like Claude direct programmatic control over the Unreal Engine 5 editor. It consists of a C++ editor plugin (runs inside UE5) and a TypeScript MCP server (bridges AI to the plugin via HTTP). You talk to Claude in natural language; Claude calls tools that execute instantly in UE5.

### Who is UE Conduit for?

- **Solo developers** who want to accelerate level design, asset management, and iteration
- **Small teams** who want an AI co-pilot for UE5 world building
- **Technical artists** who want to script editor operations via natural language
- **Anyone** who is tired of copy-pasting between AI chat windows and UE5

### Do I need to know C++ to use UE Conduit?

No. The plugin is a drop-in install -- copy the folder and open your project. All commands work through Claude's natural language interface. However, if you want to extend the plugin with custom commands, C++ knowledge is needed for the plugin side.

### Does UE Conduit modify my project files?

The plugin only adds files to your `Plugins/` directory. It does not modify your `.uproject` file, `Config/` files, or any existing source code. Commands that modify your level (spawning actors, etc.) are normal editor operations that integrate with UE5's undo/redo system.

---

## Compatibility

### Which Unreal Engine versions are supported?

| Version | Status |
|---------|--------|
| UE5 5.7 | Fully tested and supported |
| UE5 5.6 | Compatible |
| UE5 5.5 | Compatible |
| UE5 5.4 | Compatible |
| UE5 5.3 and earlier | Not supported |
| UE4 | Not supported |

### Which operating systems are supported?

- **Windows 10/11** -- Fully tested
- **macOS 13+** -- Compatible
- **Linux (Ubuntu 22.04+)** -- Compatible

### Does it work with Claude Code and Claude Desktop?

Yes, both. The MCP server uses stdio transport, which is supported by both Claude Code (CLI) and Claude Desktop (GUI app). The configuration is nearly identical -- just different config file locations.

### Can I use UE Conduit with GPT, Gemini, or other AI models?

The HTTP API is LLM-agnostic. Any AI model, script, or application that can make HTTP POST requests can control UE5 through the plugin. The MCP server is Claude-specific (it uses the MCP protocol), but the underlying HTTP API works with anything.

### Does it work with Blueprints-only projects?

Yes. UE Conduit does not require your project to have C++ source code. The plugin itself is C++, but it compiles independently. All Blueprint-related tools (create, modify, compile Blueprints) work in Blueprint-only projects.

### Does it work with the Water plugin, Foliage system, and Niagara?

Yes. Water body tools require the Water plugin to be enabled in your project. Foliage tools use UE5's instanced static mesh foliage system. Niagara tools require the Niagara plugin (enabled by default in most templates).

---

## Installation

### How do I install the UE5 plugin?

Copy the `UEConduit` folder into your project's `Plugins/` directory and restart the editor. See [INSTALLATION.md](INSTALLATION.md) for detailed steps.

### How do I install the MCP server?

Run `npm install -g ue-conduit` or use `npx ue-conduit` directly in your MCP configuration. See [INSTALLATION.md](INSTALLATION.md) for Claude Code and Claude Desktop configuration.

### The plugin won't compile. What do I do?

1. Ensure you are on UE5 5.4 or later
2. Build from the command line to see detailed error output (see [INSTALLATION.md](INSTALLATION.md#step-4-if-compilation-fails))
3. On Windows, ensure Visual Studio 2022 with the "Game Development with C++" workload is installed
4. Delete `Intermediate/` and `Binaries/` in both your project and the plugin folder, then rebuild

### Can I change the default port?

Yes. The default port is 9377. Change it with the `-UEConduitPort=XXXX` command line argument when launching UE5. Update your MCP server configuration to match.

### How do I know if the plugin is working?

Open a web browser and navigate to `http://localhost:9377/health`. If you see a JSON response, the plugin is running. In Claude Code, ask "What's open in the editor?" to verify the full pipeline.

---

## Usage

### What commands are available?

There are 79 MCP tools across 18 categories, covering actors, blueprints, assets, materials, compilation, play testing, landscape, water, foliage, Fab marketplace, screenshots, widgets, animation, input, AI, Niagara, data tables, and high-level orchestration. See [COMMANDS.md](COMMANDS.md) for the complete reference.

### Can Claude see what's in the viewport?

Yes. Use the `ue5_take_screenshot` tool to capture the viewport. Claude can analyze the screenshot and make decisions based on what it sees. You can also position the camera before capturing with `ue5_set_viewport_camera`.

### Can Claude compile my C++ code and fix errors?

Yes. The `ue5_build_test_fix` orchestration tool runs an autonomous loop: compile C++, check for errors, return them to Claude for fixing, then recompile. It also starts PIE, checks for runtime errors, and takes a screenshot on success.

### Can multiple Claude agents work simultaneously?

Yes. Multiple MCP server instances can connect to the same UE5 plugin. Commands are queued and executed sequentially on the game thread. There is no built-in asset locking, so take care with concurrent writes to the same actors.

### Does undo/redo work with UE Conduit commands?

Most level-modification commands (spawn, delete, move, set property) are wrapped in `FScopedTransaction`, which integrates with UE5's standard undo/redo system. You can use `ue5_undo` and `ue5_redo` tools, or Ctrl+Z in the editor.

### Can I use UE Conduit with source control?

Yes. UE Conduit makes standard editor modifications. Your source control workflow (Perforce, Git, PlasticSCM) is unaffected. The plugin itself can be checked into your repository's `Plugins/` directory.

---

## Performance

### How fast are commands?

| Operation | Typical Latency |
|-----------|----------------|
| Simple queries (get_state, list) | 5-20 ms |
| Actor spawn/delete | 10-30 ms |
| Blueprint compile | 50-500 ms |
| Asset import (single file) | 100-2000 ms |
| C++ compilation | 5-120 seconds |
| Lighting build | 10-600 seconds |

### Is there a performance impact on the editor?

Minimal. The HTTP server runs on a background thread. Commands execute on the game thread and typically complete in under 50ms. The editor remains responsive between commands. WebSocket event streams are asynchronous and have negligible overhead.

### Can I import thousands of assets at once?

Yes. The `ue5_import_directory` orchestration tool processes files in configurable batches (default 50). It handles auto-categorization, normal map detection, and progress tracking. Importing 1,000+ files is routine.

### Are there rate limits?

There are no artificial rate limits. Commands are processed as fast as the game thread can handle them. In practice, you are limited by the sequential nature of game-thread execution. Batch operations (`ue5_batch_spawn`, `ue5_import_directory`) are the most efficient way to make many changes.

---

## Security

### Is UE Conduit safe to use?

UE Conduit binds to `localhost` only. It cannot be accessed from other machines on your network unless you explicitly change the host binding. Optional API key authentication adds another layer of protection.

### Can someone on my network access UE Conduit?

Not by default. The HTTP server listens on `localhost` (127.0.0.1), which is only accessible from your own machine. If you change the host binding to `0.0.0.0`, it would be accessible on your local network -- do not do this without also enabling API key authentication.

### Should I expose UE Conduit to the internet?

Absolutely not. UE Conduit has full editor access and is designed for local development only. Never expose the HTTP port to the public internet.

### What can a malicious command do?

UE Conduit commands have the same access level as the UE5 editor itself. A command could delete all actors, modify assets, or execute console commands. This is by design -- it is a development tool, not a production server. Use the API key feature if multiple users share the same machine.

---

## Pricing and Licensing

### How much does UE Conduit cost?

**$29.99** one-time purchase. Lifetime updates included. Commercial license for shipped games.

### What is included in the purchase?

1. UEConduit C++ plugin with full source code
2. MCP server (TypeScript) with full source code
3. 79 MCP tools across 18 categories
4. 3 orchestration engines (build-test-fix, asset pipeline, zone builder)
5. Complete documentation
6. Lifetime updates
7. Commercial license
8. Priority Discord support

### Is the MCP server open source?

Yes. The MCP server TypeScript code is MIT licensed. You can use it, modify it, and redistribute it freely. The paid product is the UEConduit C++ plugin -- the engine-side piece that actually executes commands.

### Can I use UE Conduit in a shipped game?

Yes. The commercial license permits use in shipped games. The plugin is editor-only and does not ship with your game build.

### Is there a free trial?

The MCP server is open source and free. It works with any UE5 plugin that accepts HTTP JSON commands. If you already have a compatible plugin (such as Claudius), you can use the MCP server without purchasing UEConduit.

### Are there per-seat fees?

No. One purchase covers your entire team. There are no per-seat, per-machine, or subscription fees.

---

## Troubleshooting

### Claude says "UE5 editor not available"

1. Ensure UE5 is running and the plugin is loaded (check the Output Log for `[UEConduit]` messages)
2. Verify the port matches: check your MCP config's `UE5_PORT` against the plugin's port (default 9377)
3. Test manually: `curl http://localhost:9377/health`
4. Restart Claude Code after making config changes

### Commands succeed but nothing happens in the editor

1. The editor may be busy (compiling, loading). Commands queue and execute when the game thread is free.
2. Check the Output Log for warnings from `[UEConduit]`
3. Some commands require a valid level to be open (e.g., spawn_actor)
4. Viewport changes may not be visible if another editor window has focus

### The editor crashes when I use certain commands

1. Check which command caused the crash in the Output Log
2. If it is an asset import, ensure the file exists and the destination path is valid
3. If it is a Blueprint operation, ensure the Blueprint path is correct
4. Report the crash with reproduction steps -- this is a bug we want to fix

### WebSocket connection keeps disconnecting

The MCP server will auto-reconnect up to 20 times with exponential backoff. If disconnections are frequent:
1. Check if the editor is crashing (WebSocket closes when UE5 closes)
2. Ensure no firewall is blocking the WebSocket port (default 8081)
3. Increase the health check interval: `UE5_HEALTH_CHECK_MS=10000`

### "Command timed out" errors

Some operations take longer than the default 30-second timeout:
1. C++ compilation can take 1-2 minutes on large projects
2. Lighting builds can take several minutes
3. Increase the timeout: `UE5_TIMEOUT_MS=120000` (2 minutes)

---

## Comparison

### How does UE Conduit compare to Claudius Code?

| Feature | UE Conduit ($29.99) | Claudius ($59.99/seat) |
|---------|---------------------|------------------------|
| Total MCP tools | 79 | ~50 |
| C++ plugin commands | 35+ | 130+ |
| MCP Protocol (native) | Yes | No |
| Claude Code integration | Zero-config | Manual |
| Claude Desktop integration | Yes | No |
| WebSocket event streams | 5 streams | No |
| Autonomous build-test-fix | Yes | No |
| Asset pipeline automation | Yes | No |
| Zone builder from JSON | Yes | No |
| Landscape/Water/Foliage | Yes | Limited |
| Widget/UMG creation | Full | Limited |
| Enhanced Input system | Yes | No |
| Niagara/VFX control | Yes | No |
| Multi-agent support | Yes | No |
| Headless/CI mode | Yes | No |
| Source code included | Full (C++ & TypeScript) | C++ only |
| Price | $29.99 one-time | $59.99/seat |

### Why not just use cURL / a Python script?

You absolutely can. The HTTP API is designed to work with any client. UE Conduit's MCP server adds:
- **AI understanding** -- Claude knows what each tool does and when to use it
- **Parameter validation** -- Zod schemas catch errors before they reach UE5
- **Retry logic** -- Automatic retries with exponential backoff
- **Real-time streams** -- WebSocket events for build output and logs
- **Orchestration** -- High-level automation that chains multiple commands intelligently

---

## Development

### Can I add my own commands?

Yes. See the "Adding Custom Commands" section in [ARCHITECTURE.md](ARCHITECTURE.md#adding-custom-commands). You need to create a C++ command handler in the plugin and a TypeScript tool definition in the MCP server.

### Can I contribute to UE Conduit?

The MCP server is open source (MIT). Pull requests are welcome. The C++ plugin is commercially licensed -- contact us for contributor access.

### Where do I report bugs?

Open an issue on the GitHub repository or message in the Discord support channel. Include:
1. UE5 version
2. UE Conduit version
3. The command that triggered the issue
4. Output Log contents
5. Steps to reproduce

### How do I build the MCP server from source?

```bash
git clone https://github.com/jagjourney/ue-conduit.git
cd ue-conduit
npm install
npm run build
npm test
```

### How do I run in development mode?

```bash
npm run dev
```

This uses `tsx` for hot reload -- TypeScript changes take effect immediately without rebuilding.

---

*UE Conduit -- The conduit between AI and engine.*
*Jag Journey, LLC*
