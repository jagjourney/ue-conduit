# UE Conduit — Wiki

Welcome to UE Conduit, the AI-powered bridge between Claude (or any LLM) and Unreal Engine 5.

## Quick Links

- [Installation Guide](Installation)
- [Getting Started](Getting-Started)
- [Tool Reference (217 tools)](Tool-Reference)
- [Claude Code Setup](Claude-Code-Setup)
- [Claude Desktop Setup](Claude-Desktop-Setup)
- [LLM Provider Configuration](LLM-Providers)
- [Tutorials](Tutorials)
- [API Reference](API-Reference)
- [FAQ](FAQ)
- [Troubleshooting](Troubleshooting)

---

## What is UE Conduit?

UE Conduit has two parts:

1. **UE5 Plugin** ($29.99 on Fab) — A C++ plugin that runs inside Unreal Engine 5 and exposes an HTTP API on port 9377. This lets any AI, script, or tool control the editor programmatically.

2. **MCP Server** (FREE on npm/GitHub) — A TypeScript server that connects Claude Code or Claude Desktop to the UE5 plugin via the Model Context Protocol. This gives Claude 217 tools to control every aspect of UE5.

```
You talk to Claude → Claude uses MCP tools → MCP Server sends HTTP → UE5 Plugin executes → Things happen in the editor
```

## How to Get Started

### Option A: I use Claude Code (CLI)
1. Buy the UE5 plugin from Fab ($29.99)
2. Copy `UEConduit/` to your project's `Plugins/` folder
3. Install MCP server: `npm install -g ue-conduit`
4. Add to `.mcp.json` in your project:
```json
{
  "mcpServers": {
    "ue-conduit": {
      "command": "npx",
      "args": ["ue-conduit"],
      "env": { "UE5_PORT": "9377" }
    }
  }
}
```
5. Open UE5, start Claude Code — you now have 217 UE5 tools

### Option B: I use Claude Desktop (GUI)
1. Buy the UE5 plugin from Fab ($29.99)
2. Copy `UEConduit/` to your project's `Plugins/` folder
3. Install MCP server: `npm install -g ue-conduit`
4. Add to `~/.claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "ue-conduit": {
      "command": "npx",
      "args": ["ue-conduit"],
      "env": { "UE5_PORT": "9377" }
    }
  }
}
```
5. Open UE5, restart Claude Desktop — UE5 tools appear

### Option C: I just want the plugin (no Claude)
1. Buy the UE5 plugin from Fab ($29.99)
2. Copy `UEConduit/` to your project's `Plugins/` folder
3. Open UE5 — plugin loads on port 9377
4. Use the in-editor panel (Window > Developer Tools > UE Conduit)
5. Send HTTP commands from any tool: `curl -X POST http://localhost:9377/api/command`

### Option D: I already have Claudius and want the MCP server
1. Install: `npm install -g ue-conduit`
2. Configure MCP (same as Option A or B, but set `UE5_PORT` to `8080` for Claudius)
3. Works with any UE5 plugin that accepts JSON commands on HTTP

## No API Keys Needed

If you use Claude Code or Claude Desktop, your existing Claude subscription covers the AI. UE Conduit is just the bridge — no extra API keys required.

API keys are only needed if you want to use the in-editor panel to chat with an LLM directly (OpenAI, xAI, Gemini, Ollama).

## Support

- GitHub Issues: https://github.com/jagjourney/ue-conduit/issues
- Documentation: https://github.com/jagjourney/ue-conduit/wiki
