/**
 * UE Conduit — Editor Tools
 *
 * General editor operations: state, viewport, undo/redo, save, screenshots.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerEditorTools(server: any, ue5: UE5Client) {
  server.tool(
    "ue5_get_editor_state",
    "Get the current state of the UE5 editor: open level, selected actors, build status, PIE state, engine version.",
    {},
    async () => {
      const state = await ue5.getEditorState();
      return { content: [{ type: "text", text: JSON.stringify(state, null, 2) }] };
    }
  );

  server.tool(
    "ue5_save_level",
    "Save the currently open level.",
    {},
    async () => {
      const result = await ue5.executeCommand("editor", "save_current_level", {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_save_all",
    "Save all unsaved assets and levels.",
    {},
    async () => {
      const result = await ue5.executeCommand("editor", "save_all", {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_load_level",
    "Load a level by its content browser path.",
    {
      level_path: z.string().describe("Level path (e.g., /Game/Maps/L_ShatteredCoast)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("editor", "load_level", {
        level_path: params.level_path,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_undo",
    "Undo the last editor action.",
    {},
    async () => {
      const result = await ue5.executeCommand("editor", "undo", {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_redo",
    "Redo the last undone editor action.",
    {},
    async () => {
      const result = await ue5.executeCommand("editor", "redo", {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_focus_viewport",
    "Move the editor viewport camera to a specific location.",
    {
      location: z.object({ x: z.number(), y: z.number(), z: z.number() }).describe("Camera position"),
      rotation: z.object({ pitch: z.number(), yaw: z.number(), roll: z.number() }).optional(),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("viewport", "set_camera", {
        location: params.location,
        rotation: params.rotation ?? { pitch: -30, yaw: 0, roll: 0 },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_notify",
    "Show a toast notification in the UE5 editor.",
    {
      message: z.string().describe("Notification message"),
      type: z.enum(["info", "success", "warning", "error"]).default("info"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("editor", "notify", {
        message: params.message,
        type: params.type,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
