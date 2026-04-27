# UE Conduit -- Complete Setup Guide

**Version:** 1.0.0
**Author:** Jag Journey, LLC

This guide covers every supported setup configuration: Claude Code, Claude Desktop, OpenAI/xAI/Gemini, and Ollama (free/local).

---

## Table of Contents

1. [For Game Developers (Plugin Users)](#1-for-game-developers-plugin-users)
2. [For Claude Code Users](#2-for-claude-code-users)
3. [For Claude Desktop Users](#3-for-claude-desktop-users)
4. [For OpenAI / xAI / Gemini Users](#4-for-openai--xai--gemini-users)
5. [For Ollama (Free/Local) Users](#5-for-ollama-freelocal-users)
6. [Environment Variables Reference](#6-environment-variables-reference)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. For Game Developers (Plugin Users)

This section covers the complete end-to-end setup from purchase to first command.

### Step 1: Download UE Conduit from Fab ($29.99)

1. Navigate to the UE Conduit listing on [fab.com](https://fab.com)
2. Purchase the plugin ($29.99, one-time)
3. Download the .zip for your Unreal Engine version (5.4, 5.5, 5.6, or 5.7)

### Step 2: Extract the Plugin

Extract the `UEConduit` folder into your UE5 project's `Plugins/` directory:

```
YourProject/
  Content/
  Source/               (may not exist for Blueprint-only projects)
  Plugins/
    UEConduit/          <-- Extract here
      UEConduit.uplugin
      Source/
        UEConduit/
          UEConduit.Build.cs
          Public/
            Commands/
          Private/
            Commands/
  YourProject.uproject
```

If your project does not have a `Plugins/` folder, create one at the project root.

### Step 3: Open Your Project in UE5

Open your `.uproject` file. The editor will detect the new plugin and compile it automatically.

Look for these lines in the **Output Log** (Window > Developer Tools > Output Log):

```
[UEConduit] HTTP server started on port 9377
[UEConduit] Ready to receive AI automation commands
```

If you see errors instead, see the [Troubleshooting](#7-troubleshooting) section.

### Step 4: Verify the Plugin is Loaded

1. Go to **Edit > Plugins**
2. Search for "UE Conduit"
3. Confirm it shows as **Enabled** with a green checkmark
4. Open a web browser and visit: `http://localhost:9377/health`
5. You should see a JSON response like:

```json
{
  "status": "ok",
  "engine_version": "5.7.0",
  "project_name": "YourProject",
  "uptime_seconds": 42
}
```

### Step 5: Install the MCP Server

The MCP server is the TypeScript bridge that translates AI commands into HTTP calls to the UE5 plugin.

```bash
npm install -g ue-conduit
```

Verify the installation:

```bash
ue-conduit --version
```

If you prefer not to install globally, you can use `npx ue-conduit` instead -- it downloads and caches the server automatically.

### Step 6: Configure Your AI Tool

Choose your AI tool and follow the corresponding section below:

- [Claude Code](#2-for-claude-code-users) (recommended)
- [Claude Desktop](#3-for-claude-desktop-users)
- [OpenAI/xAI/Gemini](#4-for-openai--xai--gemini-users) (HTTP API only, no MCP)
- [Ollama (free/local)](#5-for-ollama-freelocal-users)

### Step 7: Test the Connection

With UE5 running and your AI tool configured, try:

```
"What's open in the editor?"
```

Claude should respond with something like:

```
L_MainMenu is open with 45 actors. Build is clean. PIE is stopped.
Engine: UE 5.7.0. Project: YourProject.
```

### Step 8: Start Building

Try these commands to get a feel for UE Conduit:

```
"Spawn a point light at 0, 0, 200"
"List all actors in the level"
"Create a Blueprint called BP_TestActor with a StaticMeshComponent"
"Take a screenshot of the viewport"
"Compile the C++ code"
```

See [docs/TOOL_REFERENCE.md](TOOL_REFERENCE.md) for the complete list of 217 tools.

---

## 2. For Claude Code Users

Claude Code is the recommended way to use UE Conduit. It provides the richest integration via the Model Context Protocol (MCP).

### Step 1: Locate Settings File

The Claude Code settings file is at:

- **Windows:** `%USERPROFILE%\.claude\settings.json`
- **macOS/Linux:** `~/.claude/settings.json`

Create the file if it does not exist.

### Step 2: Add MCP Server Configuration

Add the UE Conduit MCP server to `settings.json`:

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

**Alternative: Global install (faster startup):**

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

**Alternative: From source (for developers):**

```json
{
  "mcpServers": {
    "ue-conduit": {
      "command": "node",
      "args": ["D:/Dev/ue-conduit/dist/index.js"],
      "env": {
        "UE5_PORT": "9377"
      }
    }
  }
}
```

### Step 3: Optional LLM Configuration

If you want to use the built-in LLM tools (ue5_llm_chat, ue5_llm_generate_code), add API keys:

```json
{
  "mcpServers": {
    "ue-conduit": {
      "command": "npx",
      "args": ["ue-conduit"],
      "env": {
        "UE5_PORT": "9377",
        "LLM_PROVIDER": "claude",
        "LLM_API_KEY": "sk-ant-...",
        "LLM_MODEL": "claude-sonnet-4-6"
      }
    }
  }
}
```

### Step 4: Restart Claude Code

Close and reopen Claude Code. The MCP server starts automatically when Claude Code launches.

### Step 5: Verify

Open Claude Code in your project directory and type:

```
What tools do you have for Unreal Engine?
```

Claude should list the UE Conduit tools. Then try:

```
What's open in the editor?
```

### First Commands to Try

```
"What's open in the editor?"                    -- Check connection
"List all actors in the level"                   -- See what's in the world
"Spawn a cube at 0, 0, 100"                     -- Place something
"Take a screenshot"                              -- See the viewport
"Create a Blueprint called BP_Test"              -- Create an asset
"Compile the project"                            -- Trigger C++ build
"Play the game"                                  -- Start PIE
"Stop playing"                                   -- Stop PIE
```

### Automated Setup Script

You can also run the included setup script:

```bash
cd /path/to/ue-conduit
npm run setup
```

This auto-generates the correct `settings.json` entry for your system.

---

## 3. For Claude Desktop Users

Claude Desktop uses the same MCP server but reads configuration from a different file.

### Step 1: Locate Configuration File

- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Create the file and any parent directories if they do not exist.

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

Fully close and reopen Claude Desktop. The UE Conduit tools will appear in the tools list (the hammer icon).

### Differences from Claude Code CLI

| Feature | Claude Code (CLI) | Claude Desktop |
|---------|-------------------|----------------|
| Config file | `~/.claude/settings.json` | `%APPDATA%/Claude/claude_desktop_config.json` |
| Tool visibility | Automatic (tools appear in context) | Click the hammer icon to see tools |
| Multi-agent | Yes (multiple terminal sessions) | No (single conversation) |
| File system access | Full | Sandboxed |
| Best for | Development workflows | Casual exploration, learning |

### Tips for Claude Desktop

- Claude Desktop will ask for confirmation before running tools. You can approve individually or "allow all" for a tool category.
- The tool list in the sidebar shows all 217 tools organized alphabetically.
- Type natural language commands -- Claude Desktop will select the right tools automatically.

---

## 4. For OpenAI / xAI / Gemini Users

OpenAI, xAI (Grok), and Google Gemini do not natively support the MCP protocol. UE Conduit supports these providers through its built-in LLM tools, which use the UE5 plugin's HTTP API directly.

### How It Works

Instead of MCP, these providers interact with UE5 through a two-step process:

1. **The MCP server still runs** (via Claude Code or standalone)
2. **The LLM tools route prompts** to your chosen provider
3. **Results come back** through the same MCP channel

This means you still need Claude Code or Claude Desktop as the MCP host, but the actual AI reasoning can come from GPT-4o, Grok, or Gemini.

### Step 1: Configure API Keys

Add your provider's API key to the MCP server configuration:

**For OpenAI (GPT-4o):**

```json
{
  "mcpServers": {
    "ue-conduit": {
      "command": "npx",
      "args": ["ue-conduit"],
      "env": {
        "UE5_PORT": "9377",
        "LLM_PROVIDER": "openai",
        "LLM_API_KEY": "sk-...",
        "LLM_MODEL": "gpt-4o"
      }
    }
  }
}
```

**For xAI (Grok):**

```json
{
  "mcpServers": {
    "ue-conduit": {
      "command": "npx",
      "args": ["ue-conduit"],
      "env": {
        "UE5_PORT": "9377",
        "LLM_PROVIDER": "xai",
        "LLM_API_KEY": "xai-...",
        "LLM_MODEL": "grok-3"
      }
    }
  }
}
```

**For Google Gemini:**

```json
{
  "mcpServers": {
    "ue-conduit": {
      "command": "npx",
      "args": ["ue-conduit"],
      "env": {
        "UE5_PORT": "9377",
        "LLM_PROVIDER": "gemini",
        "LLM_API_KEY": "AIza...",
        "LLM_MODEL": "gemini-2.5-pro"
      }
    }
  }
}
```

### Step 2: Use LLM Tools

With an alternative provider configured, you can use the LLM-specific tools:

```
"Use the LLM to generate C++ code for a health component"
"Ask the LLM to analyze this screenshot"
"Switch the LLM provider to OpenAI"
```

### Model Selection Guide

| Provider | Model | Vision | Context | Best For |
|----------|-------|--------|---------|----------|
| Claude | claude-sonnet-4-6 | Yes | 200K | Best overall, native MCP |
| OpenAI | gpt-4o | Yes | 128K | Strong coding, fast |
| xAI | grok-3 | Yes | 128K | Latest reasoning |
| Gemini | gemini-2.5-pro | Yes | 1M | Largest context window |

### Limitations vs. Claude (Native MCP)

- **No native tool calling** -- the provider does not directly invoke MCP tools; Claude Code invokes them, and the provider is consulted via ue5_llm_chat
- **No streaming** -- responses are complete, not streamed
- **Higher latency** -- two API calls (Claude for MCP + your provider for reasoning)
- **Vision limitations** -- screenshot analysis depends on provider's vision support

---

## 5. For Ollama (Free/Local) Users

Ollama lets you run AI models locally with zero cost and full privacy. UE Conduit works with any Ollama model.

### Step 1: Install Ollama

**Windows:**

Download from [ollama.com](https://ollama.com) and run the installer.

**macOS:**

```bash
brew install ollama
```

**Linux:**

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Step 2: Download a Model

```bash
# Recommended for UE5 work (good at coding, 8B params)
ollama pull llama3.1

# Larger model for better quality (needs 16GB+ RAM)
ollama pull llama3.1:70b

# Code-focused model
ollama pull codellama

# Small/fast model for testing
ollama pull phi3
```

### Step 3: Start Ollama

Ollama typically runs as a background service after installation. Verify it is running:

```bash
ollama list
```

If not running, start it:

```bash
ollama serve
```

Ollama listens on `http://localhost:11434` by default.

### Step 4: Configure UE Conduit

```json
{
  "mcpServers": {
    "ue-conduit": {
      "command": "npx",
      "args": ["ue-conduit"],
      "env": {
        "UE5_PORT": "9377",
        "LLM_PROVIDER": "ollama",
        "LLM_MODEL": "llama3.1",
        "LLM_BASE_URL": "http://localhost:11434"
      }
    }
  }
}
```

Note: No API key is needed for Ollama.

### Step 5: Test

```
"List all available LLM models"
"Use the LLM to generate C++ code for a damage system"
```

### Performance Expectations

| Model | RAM Required | Speed | Quality |
|-------|-------------|-------|---------|
| phi3 (3B) | 4 GB | Fast | Basic -- good for simple queries |
| llama3.1 (8B) | 8 GB | Medium | Good -- handles most UE5 tasks |
| llama3.1:70b | 48 GB | Slow | Excellent -- comparable to cloud models |
| codellama (7B) | 8 GB | Medium | Good for code generation |

Tips for local models:
- Code generation quality scales with model size
- 8B models handle most UE5 tasks adequately
- For complex Blueprint logic or C++ generation, use 70B+ or a cloud provider
- GPU acceleration significantly improves speed (NVIDIA recommended)

### Switching Providers at Runtime

You can switch between providers without restarting:

```
"Switch the LLM to Ollama with llama3.1"
"Switch the LLM to Claude with claude-sonnet-4-6"
```

This uses the `ue5_llm_set_provider` tool.

---

## 6. Environment Variables Reference

### UE5 Connection

| Variable | Default | Description |
|----------|---------|-------------|
| `UE5_HOST` | `localhost` | UE5 plugin hostname or IP address |
| `UE5_PORT` | `8080` | UE5 plugin HTTP port (the plugin default is 9377) |
| `UE5_WS_PORT` | `8081` | WebSocket event stream port |
| `UE5_API_KEY` | _(none)_ | API key for authenticated access (optional) |
| `UE5_PROJECT_PATH` | _(none)_ | Path to .uproject file (for context) |
| `UE5_LOG_LEVEL` | `info` | Log verbosity: debug, info, warn, error |
| `UE5_MAX_RETRIES` | `3` | Retry count per failed command |
| `UE5_TIMEOUT_MS` | `30000` | Command timeout in milliseconds |
| `UE5_BATCH_SIZE` | `50` | Default batch size for bulk operations |
| `UE5_HEALTH_CHECK_MS` | `5000` | Health check polling interval in milliseconds |

### LLM Provider

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_PROVIDER` | `claude` | AI provider: claude, openai, xai, gemini, ollama, custom |
| `LLM_API_KEY` | _(none)_ | API key (falls back to ANTHROPIC_API_KEY) |
| `LLM_MODEL` | `claude-sonnet-4-6` | Model identifier |
| `LLM_BASE_URL` | _(none)_ | Custom endpoint URL (required for "custom" provider) |
| `LLM_TEMPERATURE` | `0.7` | Sampling temperature (0.0 = deterministic, 1.0 = creative) |
| `LLM_MAX_TOKENS` | `4096` | Maximum response tokens |

---

## 7. Troubleshooting

### Plugin Does Not Load

**Symptom:** No `[UEConduit]` messages in the Output Log.

1. Verify folder structure: `YourProject/Plugins/UEConduit/UEConduit.uplugin`
2. Check Edit > Plugins -- ensure UE Conduit is enabled
3. Ensure your engine version is 5.4 or later
4. Delete `Intermediate/` and `Binaries/` in both the project and plugin, then rebuild
5. On Windows, ensure Visual Studio 2022 with "Game Development with C++" workload is installed

### Plugin Compile Errors

**Symptom:** Red errors when opening UE5.

Common causes:
- Missing Visual Studio workload (install "Game Development with C++")
- Engine version mismatch (ensure plugin .zip matches your UE version)
- Stale intermediate files (delete `Intermediate/` and `Binaries/` folders)

Build from command line for detailed errors:

```cmd
"C:\Program Files\Epic Games\UE_5.7\Engine\Build\BatchFiles\Build.bat" ^
  YourProjectEditor Win64 Development ^
  -Project="D:\Projects\YourProject\YourProject.uproject"
```

### Port Conflict

**Symptom:** `[UEConduit] Failed to start HTTP server on port 9377`

1. Check what is using the port:
   - Windows: `netstat -ano | findstr :9377`
   - macOS/Linux: `lsof -i :9377`
2. Change the port: launch UE5 with `-UEConduitPort=8080`
3. Update your MCP config: `"UE5_PORT": "8080"`

### Claude Code Cannot Connect

**Symptom:** "UE5 editor not available" or timeout errors.

1. Ensure UE5 is running and the plugin is loaded
2. Visit `http://localhost:9377/health` in a browser to confirm the plugin is responding
3. Verify port numbers match between plugin (9377) and MCP config (`UE5_PORT`)
4. Check no firewall is blocking localhost connections
5. Restart Claude Code after config changes

### MCP Server Not Found

**Symptom:** "Failed to start MCP server" in Claude Code.

1. Verify Node.js 20+: `node --version`
2. If using npx, ensure npm is in PATH: `npm --version`
3. If installed globally, verify: `which ue-conduit` (macOS/Linux) or `where ue-conduit` (Windows)
4. Try explicit install: `npm install -g ue-conduit`

### Commands Succeed but Nothing Happens

**Symptom:** Tools return success but no visible changes in UE5.

1. UE5 executes commands on the game thread. If the editor is busy (compiling, loading), commands queue.
2. Check the Output Log for warnings from `[UEConduit]`.
3. Some commands require a level to be open (actors, landscape, etc.).
4. Viewport changes may not be visible if another editor window has focus -- click the viewport to focus it.

### Ollama Not Connecting

**Symptom:** "Connection refused" when using Ollama provider.

1. Verify Ollama is running: `ollama list`
2. Start Ollama if needed: `ollama serve`
3. Verify the model is downloaded: `ollama pull llama3.1`
4. Check the URL in config matches Ollama's address (default: `http://localhost:11434`)

### WebSocket Streams Not Working

**Symptom:** No real-time log or compile updates.

1. WebSocket port defaults to 8081. Ensure it is not blocked.
2. WebSocket streams are optional -- all tools work without them via HTTP polling.
3. Check `UE5_WS_PORT` matches the plugin's WebSocket port.

---

*UE Conduit -- The conduit between AI and engine.*
*Jag Journey, LLC*
