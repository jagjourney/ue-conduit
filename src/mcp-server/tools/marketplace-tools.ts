/**
 * UE Conduit — Marketplace / Distribution Tools
 *
 * MCP tools for exporting plugins, creating feature packs,
 * validating marketplace guidelines, and generating thumbnails.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerMarketplaceTools(server: any, ue5: UE5Client) {
  server.tool(
    "ue5_export_plugin",
    "Export a plugin as a distributable package for sharing or Marketplace submission.",
    {
      plugin_name: z.string().describe("Name of the plugin to export"),
      output_directory: z.string().optional().describe("Output directory for the exported plugin"),
      target_platform: z.string().default("Win64").describe("Target platform (Win64, Linux, etc.)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("marketplace", "export_plugin", {
        plugin_name: params.plugin_name,
        output_directory: params.output_directory ?? "",
        target_platform: params.target_platform,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_feature_pack",
    "Create a feature/content pack (.pak) for distributing game content.",
    {
      name: z.string().describe("Feature pack name"),
      content_path: z.string().default("/Game").describe("Content path to include"),
      output_directory: z.string().optional().describe("Output directory"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("marketplace", "create_feature_pack", {
        name: params.name,
        content_path: params.content_path,
        output_directory: params.output_directory ?? "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_validate_marketplace",
    "Validate project assets against Fab/Epic Marketplace submission guidelines. Checks naming, paths, and required files.",
    {
      content_path: z.string().default("/Game").describe("Content path to validate"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("marketplace", "validate_marketplace", {
        content_path: params.content_path,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_generate_thumbnails",
    "Auto-generate asset thumbnails for all assets in a path.",
    {
      content_path: z.string().default("/Game").describe("Content browser path"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("marketplace", "generate_thumbnails", {
        content_path: params.content_path,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
