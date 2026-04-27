/**
 * UE Conduit — Compile & Build Tools
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerCompileTools(server: any, ue5: UE5Client) {
  server.tool(
    "ue5_compile_cpp",
    "Trigger C++ compilation in UE5 (equivalent to pressing Ctrl+Alt+F11). Returns build result with any errors.",
    {
      clean: z.boolean().default(false).describe("Clean build (delete intermediates first)"),
    },
    async (params: any) => {
      const command = params.clean ? "full_rebuild" : "compile";
      const result = await ue5.executeCommand("build", command, {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_hot_reload",
    "Trigger hot reload of C++ modules without full recompile.",
    {},
    async () => {
      const result = await ue5.executeCommand("build", "hot_reload", {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_get_build_errors",
    "Get the latest compilation errors and warnings.",
    {},
    async () => {
      const result = await ue5.executeCommand("build", "get_errors", {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_build_lighting",
    "Build lighting for the current level.",
    {
      quality: z.enum(["Preview", "Medium", "High", "Production"]).default("Medium"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("build", "build_lighting", {
        quality: params.quality,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
