/**
 * UE Conduit — Batch Operations / Scripting Tools
 *
 * MCP tools for executing command scripts (macros) and Python scripts
 * inside the UE5 editor.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerScriptingTools(server: any, ue5: UE5Client) {
  // --- Execute Script (Command Macro) ---
  server.tool(
    "ue5_execute_script",
    "Execute a list of UE Conduit commands in sequence, like a macro. Returns results for each step. Use this for complex multi-step operations (e.g., spawn 5 actors and configure each one).",
    {
      commands: z
        .array(
          z.object({
            category: z.string().describe("Command category (e.g., level, editor, postprocess)"),
            command: z.string().describe("Command name (e.g., spawn_actor, set_post_process_settings)"),
            params: z.record(z.unknown()).optional().describe("Command parameters"),
          })
        )
        .describe("Array of commands to execute in order"),
      stop_on_error: z.boolean().default(true).describe("Stop execution if a command fails"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("scripting", "execute_script", {
        commands: params.commands,
        stop_on_error: params.stop_on_error,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Execute Python ---
  server.tool(
    "ue5_execute_python",
    "Execute a Python script in UE5's built-in Python environment. Requires 'Python Editor Script Plugin' to be enabled. Gives full access to UE5 Python API (unreal module).",
    {
      script: z.string().optional().describe("Inline Python code to execute"),
      script_path: z.string().optional().describe("Absolute path to a .py file to execute"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = {};
      if (params.script) cmdParams.script = params.script;
      if (params.script_path) cmdParams.script_path = params.script_path;

      const result = await ue5.executeCommand("scripting", "execute_python", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
