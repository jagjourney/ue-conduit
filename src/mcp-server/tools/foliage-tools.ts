/**
 * UE Conduit — Foliage Tools
 *
 * MCP tools for painting instanced foliage (grass, bushes, rocks, trees).
 * Uses UE5's instanced static mesh foliage system for efficient rendering.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

const Vector3 = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  z: z.number().default(0),
});

export function registerFoliageTools(server: any, ue5: UE5Client) {
  // --- Add Foliage Type ---
  server.tool(
    "ue5_add_foliage_type",
    "Register a static mesh as a foliage type. This must be done before painting foliage with that mesh. Configures density, scale range, and alignment.",
    {
      mesh_path: z.string().describe("Static mesh asset path (e.g., /Game/Meshes/SM_Grass_Clump)"),
      density: z.number().optional().default(100).describe("Foliage density (instances per 1000x1000 area)"),
      scale_min: z.number().optional().default(0.8).describe("Minimum random scale"),
      scale_max: z.number().optional().default(1.2).describe("Maximum random scale"),
      align_to_normal: z.boolean().optional().default(true).describe("Align instances to surface normal"),
      random_yaw: z.boolean().optional().default(true).describe("Randomize yaw rotation"),
      ground_slope_angle: z.number().optional().describe("Maximum ground slope angle in degrees for placement"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("foliage", "add_foliage_type", {
        mesh_path: params.mesh_path,
        density: params.density ?? 100,
        scale_min: params.scale_min ?? 0.8,
        scale_max: params.scale_max ?? 1.2,
        align_to_normal: params.align_to_normal ?? true,
        random_yaw: params.random_yaw ?? true,
        ground_slope_angle: params.ground_slope_angle,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Paint Foliage ---
  server.tool(
    "ue5_paint_foliage",
    "Paint foliage instances (grass, bushes, rocks) in a circular area around a center point. Instances are placed on the ground surface via ray tracing. Very efficient — uses instanced rendering.",
    {
      mesh_path: z.string().describe("Static mesh path for the foliage (e.g., /Game/Meshes/SM_Grass)"),
      center: Vector3.describe("Center point for foliage placement"),
      radius: z.number().default(1000).describe("Radius of the paint area in world units"),
      count: z.number().default(50).describe("Number of foliage instances to place"),
      scale_min: z.number().optional().default(0.8).describe("Minimum random scale"),
      scale_max: z.number().optional().default(1.2).describe("Maximum random scale"),
      random_scale: z.boolean().optional().default(true).describe("Apply random scale variation"),
      random_yaw: z.boolean().optional().default(true).describe("Randomize yaw rotation"),
      align_to_surface: z.boolean().optional().default(true).describe("Align instances to ground surface via raycasting"),
      seed: z.number().optional().describe("Random seed for reproducible placement"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("foliage", "paint_foliage", {
        mesh_path: params.mesh_path,
        center: params.center,
        radius: params.radius ?? 1000,
        count: params.count ?? 50,
        scale_min: params.scale_min ?? 0.8,
        scale_max: params.scale_max ?? 1.2,
        random_scale: params.random_scale ?? true,
        random_yaw: params.random_yaw ?? true,
        align_to_surface: params.align_to_surface ?? true,
        seed: params.seed,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Scatter Foliage ---
  server.tool(
    "ue5_scatter_foliage",
    "Scatter foliage instances across a rectangular region. Procedurally places instances based on density. Great for covering large areas with grass, rocks, or debris.",
    {
      mesh_path: z.string().describe("Static mesh path for the foliage"),
      min_x: z.number().describe("Minimum X bound of scatter region"),
      min_y: z.number().describe("Minimum Y bound of scatter region"),
      max_x: z.number().describe("Maximum X bound of scatter region"),
      max_y: z.number().describe("Maximum Y bound of scatter region"),
      base_z: z.number().optional().default(0).describe("Base Z height for ray tracing"),
      density: z.number().optional().default(0.001).describe("Instances per square unit (0.001 = 1 per 1000 sq units)"),
      scale_min: z.number().optional().default(0.8).describe("Minimum random scale"),
      scale_max: z.number().optional().default(1.2).describe("Maximum random scale"),
      align_to_surface: z.boolean().optional().default(true).describe("Align to ground surface"),
      random_yaw: z.boolean().optional().default(true).describe("Randomize yaw rotation"),
      seed: z.number().optional().describe("Random seed for reproducible placement"),
      max_instances: z.number().optional().default(10000).describe("Maximum number of instances to place (safety cap)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("foliage", "scatter_foliage", {
        mesh_path: params.mesh_path,
        min_x: params.min_x,
        min_y: params.min_y,
        max_x: params.max_x,
        max_y: params.max_y,
        base_z: params.base_z ?? 0,
        density: params.density ?? 0.001,
        scale_min: params.scale_min ?? 0.8,
        scale_max: params.scale_max ?? 1.2,
        align_to_surface: params.align_to_surface ?? true,
        random_yaw: params.random_yaw ?? true,
        seed: params.seed,
        max_instances: params.max_instances ?? 10000,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Remove Foliage ---
  server.tool(
    "ue5_remove_foliage",
    "Remove foliage instances within a circular area. Optionally filter by mesh type.",
    {
      center: Vector3.describe("Center point for foliage removal"),
      radius: z.number().default(1000).describe("Radius of the removal area"),
      mesh_path: z.string().optional().describe("Only remove instances of this specific mesh (optional)"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = {
        center: params.center,
        radius: params.radius ?? 1000,
      };
      if (params.mesh_path) cmdParams.mesh_path = params.mesh_path;

      const result = await ue5.executeCommand("foliage", "remove_foliage", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- List Foliage Types ---
  server.tool(
    "ue5_list_foliage_types",
    "List all registered foliage types in the current level. Shows mesh paths, instance counts, density, and scale settings.",
    {},
    async () => {
      const result = await ue5.executeCommand("foliage", "list_foliage_types", {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
