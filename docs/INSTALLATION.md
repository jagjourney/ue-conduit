# UE Conduit -- Installation Guide

**Version:** 1.0.0
**Author:** Jag Journey, LLC
**License:** MIT (MCP Server) + Commercial (UE5 Plugin)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Install the UE5 Plugin](#install-the-ue5-plugin)
3. [Install the MCP Server](#install-the-mcp-server)
4. [Configure Claude Code](#configure-claude-code)
5. [Configure Claude Desktop](#configure-claude-desktop)
6. [Verify Installation](#verify-installation)
7. [Troubleshooting](#troubleshooting)
8. [Uninstallation](#uninstallation)

---

## Prerequisites

### For the UE5 Plugin

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Unreal Engine | 5.4 | 5.7 |
| Operating System | Windows 10, macOS 13, Ubuntu 22.04 | Windows 11 |
| Visual Studio (Windows) | 2022 | 2022 17.8+ |
| Xcode (macOS) | 15.0 | 15.2+ |
| Disk Space | 50 MB | 100 MB |

### For the MCP Server

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | 20.0 | 22.x LTS |
| npm | 10.0 | 10.x |

### For AI Integration

- **Claude Code** (Anthropic CLI) -- or --
- **Claude Desktop** (Anthropic desktop app)

---

## Install the UE5 Plugin

### Step 1: Copy the Plugin

Copy the `UEConduit` folder into your UE5 project's `Plugins/` directory:

```
YourProject/
  Content/
  Source/
  Plugins/
    UEConduit/            <-- Copy here
      UEConduit.uplugin
      Source/
        UEConduit/
          UEConduit.Build.cs
          Public/
          Private/
  YourProject.uproject
```

If your project does not have a `Plugins/` folder, create one at the root of your project directory.

### Step 2: Open Your Project

Open your `.uproject` file in Unreal Engine. The plugin will auto-detect and compile.

You should see this in the Output Log:

```
[UEConduit] HTTP server started on port 9377
[UEConduit] Ready to receive AI automation commands
[UEConduit] POST http://localhost:9377/ to send commands
```

### Step 3: Verify the Plugin is Loaded

1. In the UE5 editor, go to **Edit > Plugins**
2. Search for "UE Conduit"
3. Confirm it shows as **Enabled**
4. Open a web browser and navigate to: `http://localhost:9377/health`
5. You should receive a JSON response confirming the server is running

### Step 4: If Compilation Fails

If the editor fails to open or shows compile errors, build from the command line first:

**Windows:**
```cmd
"C:\Program Files\Epic Games\UE_5.7\Engine\Build\BatchFiles\Build.bat" ^
  YourProjectEditor Win64 Development ^
  -Project="D:\Projects\YourProject\YourProject.uproject"
```

**macOS:**
```bash
/Users/Shared/Epic\ Games/UE_5.7/Engine/Build/BatchFiles/Mac/Build.sh \
  YourProjectEditor Mac Development \
  -Project="/Users/you/Projects/YourProject/YourProject.uproject"
```

**Linux:**
```bash
~/UnrealEngine/Engine/Build/BatchFiles/Linux/Build.sh \
  YourProjectEditor Linux Development \
  -Project="/home/you/Projects/YourProject/YourProject.uproject"
```

### Changing the Default Port

The plugin listens on port **9377** by default. To change it:

**Option A: Command line argument**

Add `-UEConduitPort=8080` to your editor launch arguments.

**Option B: Shortcut (Windows)**

Right-click your UE5 shortcut > Properties > add to the Target field:
```
-UEConduitPort=8080
```

---

## Install the MCP Server

The MCP server is the TypeScript bridge between Claude and the UE5 plugin.

### Option A: Install from npm (Recommended)

```bash
npm install -g ue-conduit
```

### Option B: Clone the Repository

```bash
git clone https://github.com/jagjourney/ue-conduit.git
cd ue-conduit
npm install
npm run build
```

### Option C: Use npx (No Install)

You can skip installation entirely and use `npx` in the MCP configuration. The server will be downloaded and cached automatically on first use.

---

## Configure Claude Code

Add the UE Conduit MCP server to your Claude Code settings.

### Step 1: Open Settings

The settings file is located at:

- **Windows:** `%USERPROFILE%\.claude\settings.json`
- **macOS/Linux:** `~/.claude/settings.json`

### Step 2: Add the MCP Server Configuration

Add the following to your `settings.json` file (create it if it does not exist):

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

If you installed globally, you can use the direct command instead:

```json
{
  "mcpServers": {
    "ue-conduit": {
      "command": "ue-conduit",
      "env": {
        "UE5_PORT": "9377"
      }
    }
  }
}
```

### Step 3: Restart Claude Code

Close and reopen Claude Code. The MCP server tools will be available immediately.

### Step 4: Verify

Type in Claude Code:

```
What's open in the editor?
```

Claude should respond with the current level name, actor count, PIE state, and build status.

### Automated Setup

You can also run the included setup script:

```bash
npm run setup
```

This generates the correct `settings.json` entry for your system.

---

## Configure Claude Desktop

Claude Desktop uses the same MCP server but with a different config file.

### Step 1: Open Configuration

The config file is located at:

- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

### Step 2: Add MCP Server

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

### Step 3: Restart Claude Desktop

Close and reopen Claude Desktop. The UE Conduit tools will appear in the tools list.

---

## Verify Installation

### Quick Health Check

With UE5 running and the plugin loaded, open a browser and visit:

```
http://localhost:9377/health
```

You should see a JSON response like:

```json
{
  "status": "ok",
  "engine_version": "5.7.0",
  "project_name": "YourProject",
  "uptime_seconds": 42
}
```

### Full Verification

In Claude Code or Claude Desktop, try these commands in sequence:

1. **Check connection:** "What's open in the editor?"
2. **Spawn an actor:** "Spawn a point light at the origin"
3. **Query the level:** "List all actors in the level"
4. **Take a screenshot:** "Take a screenshot of the viewport"

If all four succeed, your installation is complete and working.

---

## Troubleshooting

### Plugin Does Not Load

**Symptom:** No `[UEConduit]` messages in the Output Log.

**Solutions:**
1. Verify the folder structure matches exactly: `Plugins/UEConduit/UEConduit.uplugin`
2. Check Edit > Plugins and ensure UE Conduit is enabled
3. Rebuild from the command line (see Step 4 above)
4. Check that your engine version is 5.4 or later

### Port Conflict

**Symptom:** `[UEConduit] Failed to start HTTP server on port 9377`

**Solutions:**
1. Another application is using port 9377. Change the port with `-UEConduitPort=8080`
2. Update your MCP config to match the new port: `"UE5_PORT": "8080"`
3. On Windows, check what is using the port: `netstat -ano | findstr :9377`
4. On macOS/Linux: `lsof -i :9377`

### Claude Code Cannot Connect

**Symptom:** "UE5 editor not available" or connection timeout errors.

**Solutions:**
1. Ensure UE5 is running and the plugin is loaded (check Output Log)
2. Verify the port matches between the plugin and your MCP config
3. Check that no firewall is blocking localhost connections
4. Try accessing `http://localhost:9377/health` in a browser manually
5. Restart Claude Code after making config changes

### Compile Errors on Plugin Build

**Symptom:** Red errors when opening UE5 with the plugin installed.

**Solutions:**
1. Ensure you are on UE5 5.4 or later (UE4 is not supported)
2. Build from command line to see detailed error output
3. On Windows, ensure Visual Studio 2022 with "Game Development with C++" workload is installed
4. On macOS, ensure Xcode Command Line Tools are installed: `xcode-select --install`
5. Delete `Intermediate/` and `Binaries/` folders in both your project and the plugin, then rebuild

### MCP Server Not Found

**Symptom:** Claude Code shows "Failed to start MCP server" or similar.

**Solutions:**
1. Verify Node.js 20+ is installed: `node --version`
2. If using npx, ensure npm is installed and in your PATH
3. If installed globally, verify: `which ue-conduit` or `where ue-conduit`
4. Try installing explicitly: `npm install -g ue-conduit`

### Commands Execute but Nothing Happens in UE5

**Symptom:** Commands return success but no visible changes in the editor.

**Solutions:**
1. UE5 executes commands on the game thread. If the editor is busy (compiling, loading), commands queue
2. Check the Output Log for warnings from `[UEConduit]`
3. Some commands (like `spawn_actor`) require a valid level to be open
4. Viewport changes may not be visible if another editor window has focus

---

## Uninstallation

### Remove the UE5 Plugin

1. Close Unreal Engine
2. Delete the `Plugins/UEConduit/` folder from your project
3. Delete `Intermediate/` and `Binaries/` folders to force a clean rebuild
4. Reopen your project

### Remove the MCP Server

```bash
npm uninstall -g ue-conduit
```

### Remove Claude Code Configuration

Edit `~/.claude/settings.json` and remove the `"ue-conduit"` entry from `mcpServers`.

---

## Environment Variables Reference

All MCP server environment variables and their defaults:

| Variable | Default | Description |
|----------|---------|-------------|
| `UE5_HOST` | `localhost` | UE5 plugin hostname or IP |
| `UE5_PORT` | `9377` | UE5 plugin HTTP port |
| `UE5_WS_PORT` | `8081` | WebSocket event stream port |
| `UE5_API_KEY` | _(none)_ | API key for authenticated access |
| `UE5_PROJECT_PATH` | _(none)_ | Path to .uproject (for context) |
| `UE5_LOG_LEVEL` | `info` | Log verbosity: debug, info, warn, error |
| `UE5_MAX_RETRIES` | `3` | Retry count per failed command |
| `UE5_TIMEOUT_MS` | `30000` | Command timeout in milliseconds |
| `UE5_BATCH_SIZE` | `50` | Default batch size for bulk operations |
| `UE5_HEALTH_CHECK_MS` | `5000` | Health check polling interval |

---

*UE Conduit -- The conduit between AI and engine.*
*Jag Journey, LLC*
