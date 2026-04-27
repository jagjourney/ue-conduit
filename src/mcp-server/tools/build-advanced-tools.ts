/**
 * UE Conduit — Build / Cook / Package Tools
 *
 * MCP tools for cooking content, packaging the game, checking build status,
 * validating assets, and cleaning project directories.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerBuildAdvancedTools(server: any, ue5: UE5Client) {
  server.tool(
    "ue5_cook_project",
    "Cook project content for a target platform (Windows, Linux, Android, iOS).",
    {
      platform: z.enum(["Windows", "Linux", "Android", "IOS", "Mac"]).default("Windows").describe("Target platform"),
      configuration: z.enum(["Development", "Shipping", "DebugGame"]).default("Development").describe("Build configuration"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("build_advanced", "cook_project", {
        platform: params.platform,
        configuration: params.configuration,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_package_project",
    "Package the game as a standalone executable for distribution.",
    {
      platform: z.enum(["Windows", "Linux", "Android", "IOS", "Mac"]).default("Windows").describe("Target platform"),
      configuration: z.enum(["Development", "Shipping", "DebugGame"]).default("Shipping").describe("Build configuration"),
      output_directory: z.string().optional().describe("Output directory for the packaged build"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("build_advanced", "package_project", {
        platform: params.platform,
        configuration: params.configuration,
        output_directory: params.output_directory ?? "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_get_package_status",
    "Check the status of a cooking/packaging operation.",
    {},
    async () => {
      const result = await ue5.executeCommand("build_advanced", "get_package_status", {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_validate_assets",
    "Run asset validation checks for naming conventions, references, and common issues.",
    {
      path: z.string().default("/Game").describe("Content browser path to validate"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("build_advanced", "validate_assets", {
        path: params.path,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_clean_project",
    "Clean intermediate build files, derived data cache, and saved files.",
    {
      clean_intermediate: z.boolean().default(true).describe("Clean Intermediate/ folder"),
      clean_saved: z.boolean().default(false).describe("Clean Saved/ folder"),
      clean_derived_data: z.boolean().default(false).describe("Clean DerivedDataCache/"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("build_advanced", "clean_project", {
        clean_intermediate: params.clean_intermediate,
        clean_saved: params.clean_saved,
        clean_derived_data: params.clean_derived_data,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
