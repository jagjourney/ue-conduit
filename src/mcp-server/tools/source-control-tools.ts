/**
 * UE Conduit — Source Control Integration Tools
 *
 * MCP tools for saving, checking out, submitting, and querying
 * source-controlled files in the UE5 project.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerSourceControlTools(server: any, ue5: UE5Client) {
  // --- Save and Checkout ---
  server.tool(
    "ue5_save_and_checkout",
    "Save all dirty packages and check out files from source control. If source control is not enabled, just saves.",
    {
      files: z
        .array(z.string())
        .optional()
        .describe("Specific files to check out (default: current level file)"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = {};
      if (params.files) cmdParams.files = params.files;

      const result = await ue5.executeCommand("source_control", "save_and_checkout", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Submit Changes ---
  server.tool(
    "ue5_submit_changes",
    "Submit (check in) changed files to source control with a description.",
    {
      files: z
        .array(z.string())
        .describe("Files to submit to source control"),
      description: z.string().default("Submitted from UE Conduit").describe("Submit description/changelist message"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("source_control", "submit_changes", {
        files: params.files,
        description: params.description,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Get Modified Files ---
  server.tool(
    "ue5_get_modified_files",
    "List all files that have been modified, checked out, or added since the last submit.",
    {},
    async () => {
      const result = await ue5.executeCommand("source_control", "get_modified_files", {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
