/**
 * UE Conduit — Data Asset Tools
 *
 * MCP tools for creating DataTables, importing data, creating curves,
 * and managing primary data assets.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerDataTools(server: any, ue5: UE5Client) {
  // --- Create DataTable ---
  server.tool(
    "ue5_create_datatable",
    "Create a DataTable asset from a row struct. DataTables hold tabular game data (items, abilities, loot tables, enemy stats).",
    {
      name: z.string().describe("DataTable name (e.g., DT_ItemDatabase, DT_EnemyStats, DT_LootTable)"),
      path: z.string().default("/Game/Data/").describe("Content browser folder path"),
      row_struct: z.string().describe("Row struct name or path (e.g., FItemData, /Script/MyGame.FAbilityRow)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("data", "create_datatable", {
        name: params.name,
        path: params.path,
        row_struct: params.row_struct,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Import JSON to DataTable ---
  server.tool(
    "ue5_import_json_to_datatable",
    "Import a JSON file as rows into an existing DataTable. The JSON should be an array of objects matching the row struct.",
    {
      datatable: z.string().describe("DataTable asset path (e.g., /Game/Data/DT_ItemDatabase)"),
      json_path: z.string().describe("Absolute path to JSON file on disk"),
      overwrite: z.boolean().default(false).describe("Overwrite existing rows (true) or append (false)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("data", "import_json_to_datatable", {
        datatable: params.datatable,
        json_path: params.json_path,
        overwrite: params.overwrite,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Create Curve ---
  server.tool(
    "ue5_create_curve",
    "Create a float curve or color curve asset. Curves are used for damage falloff, animation easing, stat scaling, etc.",
    {
      name: z.string().describe("Curve name (e.g., C_DamageFalloff, C_XPPerLevel, C_HealOverTime)"),
      path: z.string().default("/Game/Data/Curves/").describe("Content browser folder path"),
      curve_type: z
        .enum(["Float", "LinearColor", "Vector"])
        .default("Float")
        .describe("Curve value type"),
      keys: z
        .array(
          z.object({
            time: z.number().describe("Key time/input value"),
            value: z.unknown().describe("Key output value (number for Float, {r,g,b,a} for Color, {x,y,z} for Vector)"),
            interp: z
              .enum(["Linear", "Cubic", "Constant", "Auto"])
              .default("Auto")
              .describe("Interpolation mode between keys"),
          })
        )
        .optional()
        .describe("Initial curve keys"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("data", "create_curve", {
        name: params.name,
        path: params.path,
        curve_type: params.curve_type,
        keys: params.keys ?? [],
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Create Data Asset ---
  server.tool(
    "ue5_create_data_asset",
    "Create a Primary Data Asset instance. Data Assets are singleton config objects used for game settings, class defaults, ability definitions.",
    {
      name: z.string().describe("Data asset name (e.g., DA_GameConfig, DA_AbilityFireball)"),
      path: z.string().default("/Game/Data/").describe("Content browser folder path"),
      data_class: z.string().describe("Data asset class path (e.g., /Script/MyGame.UAbilityDataAsset, PrimaryDataAsset)"),
      properties: z.record(z.unknown()).optional().describe("Properties to set on the data asset"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("data", "create_data_asset", {
        name: params.name,
        path: params.path,
        data_class: params.data_class,
        properties: params.properties ?? {},
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Load JSON Config ---
  server.tool(
    "ue5_load_json_config",
    "Load a JSON file from disk and make its data available. Returns the parsed JSON content for use in other commands.",
    {
      json_path: z.string().describe("Absolute path to JSON file on disk"),
      config_name: z.string().optional().describe("Name for this config (default: filename without extension)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("data", "load_json_config", {
        json_path: params.json_path,
        config_name: params.config_name ?? "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Create Enum ---
  server.tool(
    "ue5_create_enum",
    "Create a Blueprint Enum (UserDefinedEnum) asset. Enums define a fixed set of named values (item rarity, damage types, faction IDs).",
    {
      name: z.string().describe("Enum name (e.g., E_ItemRarity, E_DamageType, E_Faction)"),
      path: z.string().default("/Game/Data/Enums/").describe("Content browser folder path"),
      values: z
        .array(z.string())
        .describe("List of enum entry names (e.g., ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'])"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("data", "create_enum", {
        name: params.name,
        path: params.path,
        values: params.values,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Create Struct ---
  server.tool(
    "ue5_create_struct",
    "Create a Blueprint Struct (UserDefinedStruct) asset. Structs define reusable data shapes (item data, ability stats, quest info).",
    {
      name: z.string().describe("Struct name (e.g., S_ItemData, S_AbilityStats, S_QuestInfo)"),
      path: z.string().default("/Game/Data/Structs/").describe("Content browser folder path"),
      fields: z
        .array(
          z.object({
            name: z.string().describe("Field name (e.g., ItemName, Damage, IsStackable)"),
            type: z
              .enum(["bool", "int", "float", "double", "string", "name", "text"])
              .describe("Field type"),
          })
        )
        .describe("List of struct fields"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("data", "create_struct", {
        name: params.name,
        path: params.path,
        fields: params.fields,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
