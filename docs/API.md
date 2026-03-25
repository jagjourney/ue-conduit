# UE Conduit -- REST API Reference

**Version:** 1.0.0
**Author:** Jag Journey, LLC
**Base URL:** `http://localhost:9377`

---

## Table of Contents

1. [Overview](#overview)
2. [Health Check](#health-check)
3. [Command Endpoint](#command-endpoint)
4. [Request Format](#request-format)
5. [Response Format](#response-format)
6. [Authentication](#authentication)
7. [Error Codes](#error-codes)
8. [Command Categories](#command-categories)
9. [WebSocket Event Streams](#websocket-event-streams)
10. [Rate Limits and Performance](#rate-limits-and-performance)
11. [Examples](#examples)

---

## Overview

The UE Conduit plugin exposes a REST API from within the Unreal Engine 5 editor. Any HTTP client -- not just Claude -- can send JSON commands to control the editor programmatically.

All commands are synchronous: the HTTP response is not sent until the command has finished executing on the UE5 game thread. Typical latency is 10-50ms for simple commands and up to several seconds for compilation or asset import operations.

```
HTTP Client ----POST /api/command----> UE5 Plugin ----Game Thread----> Editor API
             <---JSON Response------                <---Result-------
```

---

## Health Check

Verify the plugin is running and responsive.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "engine_version": "5.7.0",
  "project_name": "MyProject",
  "uptime_seconds": 142
}
```

**Status Codes:**
- `200` -- Server is healthy
- No response -- Server is not running or port is blocked

---

## Command Endpoint

Execute any editor command.

**Endpoint:** `POST /api/command`

**Content-Type:** `application/json`

---

## Request Format

Every command request follows this JSON structure:

```json
{
  "command_id": "uec_1_1711234567890",
  "category": "level",
  "command": "spawn_actor",
  "params": {
    "class_path": "/Script/Engine.PointLight",
    "location": { "x": 0, "y": 0, "z": 200 },
    "rotation": { "pitch": 0, "yaw": 0, "roll": 0 },
    "scale": { "x": 1, "y": 1, "z": 1 },
    "actor_label": "MyLight",
    "properties": {}
  }
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `command_id` | string | Yes | Unique identifier for this request. Used to correlate responses. |
| `category` | string | Yes | Command category (e.g., `level`, `editor`, `blueprint`, `asset`, `build`, `pie`, `landscape`, `water`, `foliage`, `fab`, `viewport`, `console`, `widget`, `animation`, `input`, `ai`, `niagara`, `data`, `filesystem`). |
| `command` | string | Yes | Specific command within the category (e.g., `spawn_actor`, `get_state`, `compile`). |
| `params` | object | Yes | Command-specific parameters. Pass `{}` for commands with no parameters. |

---

## Response Format

Every response follows this JSON structure:

```json
{
  "command_id": "uec_1_1711234567890",
  "success": true,
  "message": "Actor spawned: PointLight_0",
  "execution_time_ms": 12.5,
  "timestamp": "2026-03-24T10:30:00.000Z",
  "output": {
    "actor_label": "PointLight_0",
    "actor_class": "PointLight",
    "location": { "x": 0, "y": 0, "z": 200 }
  },
  "warnings": []
}
```

### Fields

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `command_id` | string | Yes | Echoes back the request's `command_id`. |
| `success` | boolean | Yes | `true` if the command executed without errors. |
| `message` | string | Yes | Human-readable result message. |
| `execution_time_ms` | number | Yes | Time in milliseconds the command took to execute on the game thread. |
| `timestamp` | string | Yes | ISO 8601 timestamp of when the response was generated. |
| `output` | object | No | Command-specific output data. Present on success for most commands. |
| `warnings` | string[] | No | Non-fatal warnings generated during execution. |

---

## Authentication

Authentication is optional. When enabled, every request must include an `X-API-Key` header.

### Enable Authentication

Set the `UE5_API_KEY` environment variable in your MCP server configuration:

```json
{
  "env": {
    "UE5_API_KEY": "your-secret-key-here"
  }
}
```

### Request Header

```
X-API-Key: your-secret-key-here
```

### Unauthenticated Request (When Auth is Enabled)

```json
{
  "success": false,
  "message": "Authentication required. Provide X-API-Key header.",
  "command_id": ""
}
```

**HTTP Status:** `401 Unauthorized`

---

## Error Codes

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Command executed (check `success` field for result) |
| `400` | Malformed JSON or missing required fields |
| `401` | Authentication required or invalid API key |
| `404` | Unknown category or command |
| `408` | Command timed out on the game thread |
| `500` | Internal server error (crash in command handler) |
| `503` | Server is starting up or shutting down |

### Error Response Example

```json
{
  "command_id": "uec_5_1711234567890",
  "success": false,
  "message": "Unknown command category: 'foo'. Valid categories: level, editor, blueprint, asset, build, pie, landscape, water, foliage, fab.",
  "execution_time_ms": 0.1,
  "timestamp": "2026-03-24T10:30:00.000Z"
}
```

### Common Error Messages

| Error | Cause | Resolution |
|-------|-------|------------|
| `Actor not found: 'FooBar'` | No actor with that label exists | Use `list_actors` to see valid labels |
| `Asset not found at path` | Invalid content browser path | Use `search` to find the correct path |
| `Blueprint compilation failed` | Syntax or logic errors in BP | Check `output.errors` for details |
| `Cannot modify level during PIE` | Some commands are blocked during play | Stop PIE first with `stop_pie` |
| `Command timed out` | Operation took longer than timeout | Increase `UE5_TIMEOUT_MS` |

---

## Command Categories

The following categories are registered in the plugin. For detailed parameter documentation of every command, see [COMMANDS.md](COMMANDS.md).

| Category | Description | Key Commands |
|----------|-------------|--------------|
| `level` | Actor spawning, deletion, movement, queries | `spawn_actor`, `delete_actor`, `set_actor_transform`, `list_actors`, `query_actor`, `set_property` |
| `editor` | Editor state, save, load, camera, undo/redo | `get_state`, `save_current_level`, `save_all`, `load_level`, `undo`, `redo`, `notify`, `select_actor`, `set_camera`, `get_camera`, `take_screenshot` |
| `blueprint` | Blueprint creation and modification | `create_blueprint`, `add_component`, `add_variable`, `compile`, `get_info` |
| `asset` | Asset import, materials, content browser | `import`, `create_material`, `create_material_instance`, `search`, `batch_import` |
| `build` | C++ compilation, lighting, hot reload | `compile`, `full_rebuild`, `hot_reload`, `get_errors`, `build_lighting` |
| `console` | PIE control and console commands | `start_pie`, `stop_pie`, `get_log`, `execute` |
| `viewport` | Viewport capture and camera control | `screenshot`, `set_camera`, `get_camera` |
| `landscape` | Terrain creation, sculpting, painting | `create_landscape`, `sculpt`, `paint_layer`, `add_foliage`, `get_landscape_info`, `set_landscape_material` |
| `water` | Water body creation and configuration | `create_water_body`, `set_water_properties`, `list_water_bodies` |
| `foliage` | Instanced foliage painting and management | `add_foliage_type`, `paint_foliage`, `scatter_foliage`, `remove_foliage`, `list_foliage_types` |
| `fab` | Content browser search and local asset import | `list_local`, `import_local`, `search_content`, `list_vault` |
| `widget` | UMG widget blueprint creation | `create_widget`, `add_child`, `set_property`, `set_binding` |
| `animation` | Animation blueprints, montages, blend spaces | `create_anim_blueprint`, `create_montage`, `create_blend_space`, `play_preview` |
| `input` | Enhanced Input actions and mapping contexts | `create_input_action`, `create_mapping_context`, `add_key_mapping` |
| `ai` | Behavior trees, blackboards, navigation | `create_behavior_tree`, `create_blackboard`, `add_blackboard_key`, `build_navmesh`, `query_navmesh` |
| `niagara` | Particle systems and emitters | `create_system`, `set_parameter`, `create_emitter` |
| `data` | Data tables, curves, data assets | `create_datatable`, `import_json_to_datatable`, `create_curve`, `create_data_asset` |
| `filesystem` | File system operations | `read_file`, `scan_directory` |

---

## WebSocket Event Streams

The plugin provides real-time event streams via WebSocket on a separate port (default: 8081).

### Connection

```
ws://localhost:8081
```

### Subscribe to Streams

After connecting, send a subscribe message:

```json
{
  "type": "subscribe",
  "streams": ["log", "compile", "pie", "editor_events"]
}
```

### Stream Types

#### `/ws/log` -- Output Log

Real-time UE5 output log lines.

```json
{
  "stream": "log",
  "timestamp": "2026-03-24T10:30:00.000Z",
  "data": {
    "category": "LogTemp",
    "verbosity": "Log",
    "message": "Actor spawned successfully",
    "line": "[2026.03.24-10.30.00:000][  0]LogTemp: Actor spawned successfully"
  }
}
```

#### `/ws/compile` -- Build Output

Live compilation progress and results.

```json
{
  "stream": "compile",
  "timestamp": "2026-03-24T10:30:05.000Z",
  "data": {
    "complete": true,
    "error_count": 0,
    "warning_count": 2,
    "errors": [],
    "warnings": ["Warning: unused variable 'x'"],
    "duration_ms": 12500,
    "module": "MyProject"
  }
}
```

#### `/ws/pie` -- Play-In-Editor Events

PIE state changes and game log output.

```json
{
  "stream": "pie",
  "timestamp": "2026-03-24T10:30:10.000Z",
  "data": {
    "event": "started",
    "mode": "PIE"
  }
}
```

#### `/ws/editor_events` -- Editor Events

Selection changes, level loads, save events.

```json
{
  "stream": "editor_events",
  "timestamp": "2026-03-24T10:30:15.000Z",
  "data": {
    "event": "actor_selected",
    "actor_label": "PointLight_0",
    "actor_class": "PointLight"
  }
}
```

#### `/ws/progress` -- Long-Running Operations

Progress updates for asset imports, lighting builds, and other lengthy operations.

```json
{
  "stream": "progress",
  "timestamp": "2026-03-24T10:30:20.000Z",
  "data": {
    "operation": "build_lighting",
    "progress": 0.45,
    "message": "Building lighting: 45%"
  }
}
```

---

## Rate Limits and Performance

### Latency

| Operation Type | Typical Latency |
|---------------|-----------------|
| Simple queries (get_state, list_actors) | 5-20 ms |
| Actor spawn/delete | 10-30 ms |
| Asset import (single file) | 100-2000 ms |
| Blueprint compile | 50-500 ms |
| C++ compilation | 5-120 seconds |
| Lighting build | 10-600 seconds |
| Batch spawn (100 actors) | 500-3000 ms |

### Throughput

- The HTTP server processes requests sequentially on the game thread
- WebSocket streams are asynchronous and do not block command execution
- Batch operations (batch_spawn, batch_import) are more efficient than individual calls
- The MCP server applies automatic retry with exponential backoff (default: 3 retries)

### Timeouts

- Default command timeout: 30 seconds
- Configurable via `UE5_TIMEOUT_MS` environment variable
- Long-running operations (compilation, lighting) may need higher timeouts

### Concurrent Access

- Multiple MCP server instances can connect to the same plugin simultaneously
- Commands are queued and executed sequentially on the game thread
- No built-in locking -- concurrent writes to the same actor may conflict
- The MCP server handles reconnection automatically if the editor restarts

---

## Examples

### cURL: Get Editor State

```bash
curl -X POST http://localhost:9377/api/command \
  -H "Content-Type: application/json" \
  -d '{
    "command_id": "test_1",
    "category": "editor",
    "command": "get_state",
    "params": {}
  }'
```

### cURL: Spawn an Actor

```bash
curl -X POST http://localhost:9377/api/command \
  -H "Content-Type: application/json" \
  -d '{
    "command_id": "test_2",
    "category": "level",
    "command": "spawn_actor",
    "params": {
      "class_path": "/Script/Engine.PointLight",
      "location": {"x": 0, "y": 0, "z": 500},
      "rotation": {"pitch": 0, "yaw": 0, "roll": 0},
      "scale": {"x": 1, "y": 1, "z": 1},
      "actor_label": "TestLight",
      "properties": {"Intensity": 5000}
    }
  }'
```

### Python: Batch Spawn

```python
import requests
import json

url = "http://localhost:9377/api/command"

for i in range(10):
    payload = {
        "command_id": f"spawn_{i}",
        "category": "level",
        "command": "spawn_actor",
        "params": {
            "class_path": "/Game/Blueprints/BP_Enemy",
            "location": {"x": i * 500, "y": 0, "z": 0},
            "rotation": {"pitch": 0, "yaw": 0, "roll": 0},
            "scale": {"x": 1, "y": 1, "z": 1},
            "actor_label": f"Enemy_{i}",
            "properties": {}
        }
    }
    response = requests.post(url, json=payload)
    result = response.json()
    print(f"Enemy_{i}: {'OK' if result['success'] else result['message']}")
```

### JavaScript: Take Screenshot

```javascript
const response = await fetch("http://localhost:9377/api/command", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    command_id: "screenshot_1",
    category: "viewport",
    command: "screenshot",
    params: {
      filename: "my_screenshot.png"
    }
  })
});

const result = await response.json();
console.log(`Screenshot saved: ${result.output?.file_path}`);
```

---

*UE Conduit -- The conduit between AI and engine.*
*Jag Journey, LLC*
