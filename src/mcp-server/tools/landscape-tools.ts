/**
 * UE Conduit — Landscape & Environment Tools
 *
 * MCP tools for creating landscapes, sculpting terrain, painting layers,
 * placing foliage, and adding water bodies.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

const Vector3 = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  z: z.number().default(0),
});

export function registerLandscapeTools(server: any, ue5: UE5Client) {
  // --- Create Landscape ---
  server.tool(
    "ue5_create_landscape",
    "Create a new landscape actor in the level. Specify size, section layout, and optional material.",
    {
      location: Vector3.optional().describe("World location for the landscape origin"),
      num_quads_x: z.number().default(63).describe("Number of quads per section on X axis (common: 63, 127, 255)"),
      num_quads_y: z.number().default(63).describe("Number of quads per section on Y axis"),
      sections_x: z.number().default(1).describe("Number of sections on X axis"),
      sections_y: z.number().default(1).describe("Number of sections on Y axis"),
      scale: Vector3.optional().describe("Landscape scale {x, y, z} — z controls height range"),
      material: z.string().optional().describe("Material path to assign (e.g., /Game/Materials/M_Landscape)"),
      label: z.string().optional().describe("Actor label in the outliner"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("landscape", "create_landscape", {
        location: params.location ?? { x: 0, y: 0, z: 0 },
        num_quads_x: params.num_quads_x,
        num_quads_y: params.num_quads_y,
        sections_x: params.sections_x,
        sections_y: params.sections_y,
        scale: params.scale ?? { x: 100, y: 100, z: 100 },
        material: params.material ?? "",
        actor_label: params.label ?? "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Sculpt Landscape ---
  server.tool(
    "ue5_sculpt_landscape",
    "Raise or lower terrain at a specific world location. Use positive strength to raise, negative to lower.",
    {
      location: Vector3.describe("World location to sculpt at {x, y, z}"),
      radius: z.number().default(2048).describe("Brush radius in world units"),
      strength: z.number().default(0.5).describe("Sculpt strength (-1 to 1). Positive raises, negative lowers."),
      falloff: z.number().default(0.5).describe("Brush falloff (0 = hard edge, 1 = smooth)"),
      tool_type: z
        .enum(["raise_lower", "flatten", "smooth", "erosion", "noise"])
        .default("raise_lower")
        .describe("Sculpt tool type"),
      target_height: z.number().optional().describe("Target height for flatten tool"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("landscape", "sculpt", {
        location: params.location,
        radius: params.radius,
        strength: params.strength,
        falloff: params.falloff,
        tool_type: params.tool_type,
        target_height: params.target_height,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Paint Landscape Layer ---
  server.tool(
    "ue5_paint_landscape_layer",
    "Paint a material weight layer on the landscape at a world location. The landscape material must have landscape layer blend nodes.",
    {
      location: Vector3.describe("World location to paint at {x, y, z}"),
      layer_name: z.string().describe("Layer name (must match a layer in the landscape material, e.g., Grass, Rock, Sand)"),
      radius: z.number().default(2048).describe("Brush radius in world units"),
      strength: z.number().default(1.0).describe("Paint strength (0 to 1)"),
      falloff: z.number().default(0.5).describe("Brush falloff (0 = hard edge, 1 = smooth)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("landscape", "paint_layer", {
        location: params.location,
        layer_name: params.layer_name,
        radius: params.radius,
        strength: params.strength,
        falloff: params.falloff,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Add Foliage ---
  server.tool(
    "ue5_add_foliage",
    "Place foliage instances (grass, rocks, trees) at specified locations or scattered within an area.",
    {
      mesh_path: z.string().describe("Static mesh path for the foliage (e.g., /Game/Meshes/SM_Tree_Oak)"),
      locations: z
        .array(Vector3)
        .optional()
        .describe("Explicit world locations to place foliage instances"),
      scatter_origin: Vector3.optional().describe("Center point for random scatter placement"),
      scatter_radius: z.number().optional().describe("Radius for random scatter (world units)"),
      scatter_count: z.number().optional().describe("Number of instances to scatter"),
      scale_min: z.number().default(0.8).describe("Minimum random scale"),
      scale_max: z.number().default(1.2).describe("Maximum random scale"),
      random_yaw: z.boolean().default(true).describe("Randomize yaw rotation"),
      align_to_surface: z.boolean().default(true).describe("Align foliage to landscape normal"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("landscape", "add_foliage", {
        mesh_path: params.mesh_path,
        locations: params.locations ?? [],
        scatter_origin: params.scatter_origin,
        scatter_radius: params.scatter_radius,
        scatter_count: params.scatter_count,
        scale_min: params.scale_min,
        scale_max: params.scale_max,
        random_yaw: params.random_yaw,
        align_to_surface: params.align_to_surface,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Get Landscape Info ---
  server.tool(
    "ue5_get_landscape_info",
    "Get detailed information about all landscapes in the level: bounds, size, layers, material, component count. Essential for understanding the terrain before painting or sculpting.",
    {},
    async () => {
      const result = await ue5.executeCommand("landscape", "get_landscape_info", {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Set Landscape Material ---
  server.tool(
    "ue5_set_landscape_material",
    "Set the material on a landscape actor. The material should contain Landscape Layer Blend nodes for multi-layer painting (grass, rock, sand, etc.).",
    {
      material_path: z.string().describe("Material asset path (e.g., /Game/Materials/M_Landscape)"),
      label: z.string().optional().describe("Specific landscape actor label (uses first landscape if omitted)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("landscape", "set_landscape_material", {
        material_path: params.material_path,
        label: params.label ?? "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
