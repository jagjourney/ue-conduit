/**
 * UE Conduit — Project Settings Tools
 *
 * MCP tools for reading/writing project settings, setting game mode,
 * default maps, and enabling/disabling plugins.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerProjectSettingsTools(server: any, ue5: UE5Client) {
  // --- Get Project Settings ---
  server.tool(
    "ue5_get_project_settings",
    "Read project settings by section and optional key. Reads from DefaultGame.ini, DefaultEngine.ini, etc.",
    {
      section: z
        .string()
        .describe("Config section (e.g., /Script/EngineSettings.GameMapsSettings, /Script/Engine.GarbageCollectionSettings)"),
      key: z.string().optional().describe("Specific key to read (omit to get all keys in section)"),
      config_file: z
        .enum(["Game", "Engine", "Input", "Editor"])
        .default("Game")
        .describe("Which config file to read from"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("project_settings", "get_project_settings", {
        section: params.section,
        key: params.key ?? "",
        config_file: params.config_file,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Set Project Settings ---
  server.tool(
    "ue5_set_project_settings",
    "Write a project setting. Changes are saved to the appropriate DefaultXxx.ini file.",
    {
      section: z.string().describe("Config section"),
      key: z.string().describe("Setting key"),
      value: z.string().describe("Setting value"),
      config_file: z
        .enum(["Game", "Engine", "Input", "Editor"])
        .default("Game")
        .describe("Which config file to write to"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("project_settings", "set_project_settings", {
        section: params.section,
        key: params.key,
        value: params.value,
        config_file: params.config_file,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Set Game Mode ---
  server.tool(
    "ue5_set_game_mode",
    "Set the project's default game mode class.",
    {
      game_mode: z
        .string()
        .describe("Game mode class path (e.g., /Script/MyGame.MyGameMode, or /Game/Blueprints/BP_GameMode.BP_GameMode_C)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("project_settings", "set_game_mode", {
        game_mode: params.game_mode,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Set Default Map ---
  server.tool(
    "ue5_set_default_map",
    "Set the default editor startup map, game start map, or server default map.",
    {
      map_path: z.string().describe("Map asset path (e.g., /Game/Maps/MainMenu)"),
      type: z
        .enum(["editor", "game", "server"])
        .default("game")
        .describe("Which default map to set"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("project_settings", "set_default_map", {
        map_path: params.map_path,
        type: params.type,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Enable Plugin ---
  server.tool(
    "ue5_enable_plugin",
    "Enable or disable a UE5 plugin in the .uproject file. Requires editor restart to take effect.",
    {
      plugin_name: z.string().describe("Plugin name (e.g., Water, Niagara, OnlineSubsystem)"),
      enabled: z.boolean().default(true).describe("Enable (true) or disable (false)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("project_settings", "enable_plugin", {
        plugin_name: params.plugin_name,
        enabled: params.enabled,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
