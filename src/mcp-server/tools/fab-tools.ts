/**
 * UE Conduit — Fab Marketplace Tools
 *
 * MCP tools for working with Fab (Epic's asset marketplace) content.
 * Provides local asset discovery, import, and content search capabilities.
 *
 * Note: Direct Fab API search requires EOS authentication which is complex.
 * These tools focus on working with locally downloaded/available Fab assets.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerFabTools(server: any, ue5: UE5Client) {
  // --- List Local Fab Assets ---
  server.tool(
    "ue5_fab_list_local",
    "List assets in the UE5 project content browser. Search by path, class type, and name. Use this to find Fab-imported meshes, textures, and materials already in the project.",
    {
      path: z.string().optional().default("/Game").describe("Content browser path to search (e.g., /Game/Fab, /Game/Marketplace)"),
      class_filter: z
        .enum(["StaticMesh", "Material", "Texture", ""])
        .optional()
        .describe("Filter by asset class type"),
      name_filter: z.string().optional().describe("Filter by name substring"),
      max_results: z.number().optional().default(100).describe("Maximum results to return"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("fab", "list_local", {
        path: params.path ?? "/Game",
        class_filter: params.class_filter ?? "",
        name_filter: params.name_filter ?? "",
        max_results: params.max_results ?? 100,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Import Local Fab Asset ---
  server.tool(
    "ue5_fab_import_local",
    "Import a file or directory of assets into the UE5 project. Supports FBX, OBJ, glTF, PNG, JPG, TGA, WAV, and more. Use this to import Fab downloads or any external assets.",
    {
      source_path: z.string().describe("Absolute path to the file or directory to import"),
      dest_path: z.string().optional().default("/Game/Fab/Imported").describe("Content browser destination path"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("fab", "import_local", {
        source_path: params.source_path,
        dest_path: params.dest_path ?? "/Game/Fab/Imported",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Search Content Browser ---
  server.tool(
    "ue5_fab_search_content",
    "Search the project's content browser by keyword. Finds all assets matching the search terms. Useful for finding grass textures, rock meshes, landscape materials, etc.",
    {
      query: z.string().describe("Search query (e.g., 'grass', 'rock mesh', 'landscape material')"),
      class_filter: z
        .enum(["StaticMesh", "Material", "Texture", ""])
        .optional()
        .describe("Filter results by asset class"),
      max_results: z.number().optional().default(50).describe("Maximum results to return"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("fab", "search_content", {
        query: params.query,
        class_filter: params.class_filter ?? "",
        max_results: params.max_results ?? 50,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- List Vault Cache ---
  server.tool(
    "ue5_fab_list_vault",
    "List assets in the Epic Games Launcher vault cache (downloaded from Fab/Marketplace). These are locally cached assets that can be imported into the project.",
    {
      vault_path: z.string().optional().describe("Custom vault cache path (auto-detected if not provided)"),
      max_results: z.number().optional().default(100).describe("Maximum results to return"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("fab", "list_vault", {
        vault_path: params.vault_path ?? "",
        max_results: params.max_results ?? 100,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
