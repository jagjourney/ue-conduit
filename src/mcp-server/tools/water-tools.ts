/**
 * UE Conduit — Water Body Tools
 *
 * MCP tools for creating and configuring water bodies (ocean, lake, river).
 * Requires the Water plugin to be enabled in the UE5 project.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

const Vector3 = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  z: z.number().default(0),
});

export function registerWaterTools(server: any, ue5: UE5Client) {
  // --- Create Water Body ---
  server.tool(
    "ue5_create_water_body",
    "Create an ocean, lake, or river water body actor in the level. Requires the Water plugin. For rivers, provide spline_points to define the path. For lakes, spline_points define the shore outline.",
    {
      type: z
        .enum(["ocean", "lake", "river"])
        .describe("Water body type"),
      location: Vector3.optional().describe("World location for the water body origin"),
      label: z.string().optional().describe("Actor label in the outliner"),
      spline_points: z
        .array(Vector3)
        .optional()
        .describe("Spline points defining the water body shape (river path or lake shore). At least 2 points for river."),
      width: z.number().optional().describe("River width in world units (default: 1000)"),
      wave_amplitude: z.number().optional().describe("Wave height amplitude"),
      wave_speed: z.number().optional().describe("Wave animation speed"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("water", "create_water_body", {
        type: params.type,
        location: params.location ?? { x: 0, y: 0, z: 0 },
        actor_label: params.label ?? "",
        spline_points: params.spline_points ?? [],
        width: params.width ?? 1000,
        wave_amplitude: params.wave_amplitude,
        wave_speed: params.wave_speed,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Set Water Properties ---
  server.tool(
    "ue5_set_water_properties",
    "Set visual properties on an existing water body actor. Modify wave height, transparency, color, and foam.",
    {
      label: z.string().describe("Actor label of the water body to modify"),
      wave_height: z.number().optional().describe("Maximum wave height offset"),
      transparency: z.number().optional().describe("Water transparency / wave mask depth"),
      color: z.object({
        r: z.number().min(0).max(1).default(0),
        g: z.number().min(0).max(1).default(0.3),
        b: z.number().min(0).max(1).default(0.5),
        a: z.number().min(0).max(1).default(1),
      }).optional().describe("Water color as RGBA (0-1 range)"),
      foam_amount: z.number().optional().describe("Amount of foam on the water surface"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = { label: params.label };
      if (params.wave_height !== undefined) cmdParams.wave_height = params.wave_height;
      if (params.transparency !== undefined) cmdParams.transparency = params.transparency;
      if (params.color !== undefined) cmdParams.color = params.color;
      if (params.foam_amount !== undefined) cmdParams.foam_amount = params.foam_amount;

      const result = await ue5.executeCommand("water", "set_water_properties", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- List Water Bodies ---
  server.tool(
    "ue5_list_water_bodies",
    "List all water body actors in the current level. Shows type, location, and bounds for each.",
    {},
    async () => {
      const result = await ue5.executeCommand("water", "list_water_bodies", {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
