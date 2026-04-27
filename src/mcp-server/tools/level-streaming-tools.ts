/**
 * UE Conduit — Level Streaming / Sub-Level Management Tools
 *
 * MCP tools for creating, loading, unloading, and managing streaming sublevels.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

const Vector3 = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  z: z.number().default(0),
});

const Rotator = z.object({
  pitch: z.number().default(0),
  yaw: z.number().default(0),
  roll: z.number().default(0),
});

export function registerLevelStreamingTools(server: any, ue5: UE5Client) {
  // --- Create Sublevel ---
  server.tool(
    "ue5_create_sublevel",
    "Create a new streaming sublevel in the current persistent level. Sublevels enable level streaming for large open worlds.",
    {
      name: z.string().describe("Sublevel name (e.g., Zone_ShatteredCoast, Interior_Tavern)"),
      always_loaded: z.boolean().default(false).describe("If true, the sublevel is always loaded (no streaming)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("level_streaming", "create_sublevel", {
        name: params.name,
        always_loaded: params.always_loaded,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Load Sublevel ---
  server.tool(
    "ue5_load_sublevel",
    "Load a streaming sublevel, making it visible in the editor.",
    {
      name: z.string().describe("Sublevel name to load"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("level_streaming", "load_sublevel", {
        name: params.name,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Unload Sublevel ---
  server.tool(
    "ue5_unload_sublevel",
    "Unload a streaming sublevel, removing it from the editor view.",
    {
      name: z.string().describe("Sublevel name to unload"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("level_streaming", "unload_sublevel", {
        name: params.name,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- List Sublevels ---
  server.tool(
    "ue5_list_sublevels",
    "List all streaming sublevels in the current persistent level with their load state, visibility, and transform.",
    {},
    async () => {
      const result = await ue5.executeCommand("level_streaming", "list_sublevels", {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Set Sublevel Transform ---
  server.tool(
    "ue5_set_sublevel_transform",
    "Move a sublevel's origin to a new location. Used for positioning streaming sublevels in world space.",
    {
      name: z.string().describe("Sublevel name"),
      location: Vector3.describe("New world location for the sublevel origin"),
      rotation: Rotator.optional().describe("Optional rotation offset"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = {
        name: params.name,
        location: params.location,
      };
      if (params.rotation) cmdParams.rotation = params.rotation;

      const result = await ue5.executeCommand("level_streaming", "set_sublevel_transform", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
