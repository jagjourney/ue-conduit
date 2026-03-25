/**
 * UE Conduit — Save Game / Persistence Tools
 *
 * MCP tools for creating SaveGame Blueprints, saving/loading game state,
 * managing save slots, and cleaning up saved data.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerSaveGameTools(server: any, ue5: UE5Client) {
  server.tool(
    "ue5_create_save_game_bp",
    "Create a SaveGame Blueprint for storing persistent game data (inventory, progress, settings).",
    {
      name: z.string().default("BP_SaveGame").describe("Blueprint name"),
      path: z.string().default("/Game/Blueprints/SaveGame").describe("Content browser path"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("savegame", "create_save_game_bp", {
        name: params.name,
        path: params.path,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_save_game",
    "Save the current game state to a named slot.",
    {
      slot_name: z.string().default("SaveSlot_0").describe("Save slot name"),
      user_index: z.number().default(0).describe("User/controller index"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("savegame", "save_game", {
        slot_name: params.slot_name,
        user_index: params.user_index,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_load_game",
    "Load game state from a named save slot.",
    {
      slot_name: z.string().describe("Save slot name to load"),
      user_index: z.number().default(0).describe("User/controller index"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("savegame", "load_game", {
        slot_name: params.slot_name,
        user_index: params.user_index,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_delete_save",
    "Delete a save slot.",
    {
      slot_name: z.string().describe("Save slot name to delete"),
      user_index: z.number().default(0).describe("User/controller index"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("savegame", "delete_save", {
        slot_name: params.slot_name,
        user_index: params.user_index,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_list_save_slots",
    "List all available save slots with file sizes and modification dates.",
    {},
    async () => {
      const result = await ue5.executeCommand("savegame", "list_save_slots", {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
