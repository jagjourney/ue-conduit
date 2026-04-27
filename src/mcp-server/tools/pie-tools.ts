/**
 * UE Conduit — Play-In-Editor (PIE) Tools
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerPIETools(server: any, ue5: UE5Client) {
  server.tool(
    "ue5_play",
    "Start Play-In-Editor (press the Play button). Returns immediately.",
    {
      mode: z.enum(["PIE", "SIE", "standalone"]).default("PIE").describe("Play mode"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("console", "start_pie", {
        mode: params.mode,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_stop",
    "Stop Play-In-Editor.",
    {},
    async () => {
      const result = await ue5.executeCommand("console", "stop_pie", {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_restart_pie",
    "Stop and immediately restart PIE. Useful after code changes.",
    {},
    async () => {
      await ue5.executeCommand("console", "stop_pie", {});
      await new Promise((r) => setTimeout(r, 500));
      const result = await ue5.executeCommand("console", "start_pie", { mode: "PIE" });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_screenshot",
    "Take a screenshot of the current viewport and save to disk.",
    {
      filename: z.string().optional().describe("Output filename (saved to project Screenshots folder)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("viewport", "screenshot", {
        filename: params.filename ?? `screenshot_${Date.now()}.png`,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_get_game_log",
    "Get recent game output log lines from PIE. Useful for debugging runtime issues.",
    {
      last_n_lines: z.number().default(50).describe("Number of recent log lines to return"),
      filter: z.string().optional().describe("Filter log by category or keyword"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("console", "get_log", {
        lines: params.last_n_lines,
        filter: params.filter ?? "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_execute_console_command",
    "Execute a console command in the UE5 editor or PIE session.",
    {
      command: z.string().describe("Console command (e.g., 'stat fps', 'show collision')"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("console", "execute", {
        command: params.command,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
