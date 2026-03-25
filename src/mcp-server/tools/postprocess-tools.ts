/**
 * UE Conduit — Post-Process Volume & Color Grading Tools
 *
 * MCP tools for creating and configuring post-process volumes,
 * bloom, exposure, ambient occlusion, depth of field, and color grading.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

const Vector3 = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  z: z.number().default(0),
});

const ColorTint = z.object({
  r: z.number().min(0).max(2).default(1).describe("Red channel (0-2)"),
  g: z.number().min(0).max(2).default(1).describe("Green channel (0-2)"),
  b: z.number().min(0).max(2).default(1).describe("Blue channel (0-2)"),
  a: z.number().min(0).max(2).default(1).optional().describe("Alpha channel"),
});

export function registerPostProcessTools(server: any, ue5: UE5Client) {
  // --- Create Post Process Volume ---
  server.tool(
    "ue5_create_post_process_volume",
    "Spawn a PostProcessVolume actor in the level. Use infinite extent for global effects or bounded for zone-specific effects.",
    {
      label: z.string().optional().describe("Actor label in the outliner"),
      location: Vector3.optional().describe("World location"),
      extent: Vector3.optional().describe("Volume extent/size (default 1000x1000x1000)"),
      infinite: z.boolean().default(false).describe("If true, affects the entire level (unbound)"),
      priority: z.number().default(0).describe("Volume priority (higher = overrides lower)"),
      blend_radius: z.number().default(100).describe("Blend radius at volume edges"),
      blend_weight: z.number().default(1).describe("Blend weight (0-1)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("postprocess", "create_post_process_volume", {
        label: params.label ?? "",
        location: params.location,
        extent: params.extent,
        infinite: params.infinite,
        priority: params.priority,
        blend_radius: params.blend_radius,
        blend_weight: params.blend_weight,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Set Post Process Settings ---
  server.tool(
    "ue5_set_post_process_settings",
    "Configure post-process settings on an existing PostProcessVolume. Set bloom, exposure, AO, vignette, and depth of field.",
    {
      label: z.string().describe("PostProcessVolume actor label"),
      bloom_intensity: z.number().optional().describe("Bloom intensity (0=off, 1=default, higher=more bloom)"),
      bloom_threshold: z.number().optional().describe("Bloom threshold (pixels brighter than this bloom)"),
      auto_exposure_min: z.number().optional().describe("Auto exposure minimum brightness"),
      auto_exposure_max: z.number().optional().describe("Auto exposure maximum brightness"),
      exposure_compensation: z.number().optional().describe("Exposure bias/compensation (EV)"),
      ao_intensity: z.number().optional().describe("Ambient occlusion intensity (0-1)"),
      ao_radius: z.number().optional().describe("Ambient occlusion radius in world units"),
      vignette_intensity: z.number().optional().describe("Vignette intensity (0=off, 1=max)"),
      dof_focal_distance: z.number().optional().describe("Depth of field focal distance (cm)"),
      dof_depth_blur_radius: z.number().optional().describe("DOF blur radius"),
      dof_depth_blur_amount: z.number().optional().describe("DOF blur amount"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = { label: params.label };
      for (const key of Object.keys(params)) {
        if (key !== "label" && params[key] !== undefined) {
          cmdParams[key] = params[key];
        }
      }
      const result = await ue5.executeCommand("postprocess", "set_post_process_settings", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Create Post Process Material ---
  server.tool(
    "ue5_create_post_process_material",
    "Apply a post-process material to a PostProcessVolume. Used for custom screen-space effects (outlines, pixelation, color filters).",
    {
      label: z.string().describe("PostProcessVolume actor label"),
      material_path: z.string().describe("Material asset path (must be a post-process domain material)"),
      weight: z.number().default(1).describe("Blendable weight (0-1)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("postprocess", "create_post_process_material", {
        label: params.label,
        material_path: params.material_path,
        weight: params.weight,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Set Color Grading ---
  server.tool(
    "ue5_set_color_grading",
    "Set color grading on a PostProcessVolume: LUT, shadows/midtones/highlights tint, saturation, contrast, white balance.",
    {
      label: z.string().describe("PostProcessVolume actor label"),
      saturation: z.number().optional().describe("Global saturation (1=normal, 0=grayscale, >1=oversaturated)"),
      contrast: z.number().optional().describe("Global contrast (1=normal)"),
      gamma: z.number().optional().describe("Global gamma (1=normal)"),
      gain: z.number().optional().describe("Global gain (1=normal)"),
      shadows_tint: ColorTint.optional().describe("Shadows color tint {r,g,b}"),
      midtones_tint: ColorTint.optional().describe("Midtones color tint {r,g,b}"),
      highlights_tint: ColorTint.optional().describe("Highlights color tint {r,g,b}"),
      lut_path: z.string().optional().describe("Color LUT texture asset path"),
      temperature: z.number().optional().describe("White balance temperature (6500=daylight, lower=warm, higher=cool)"),
      tint: z.number().optional().describe("White balance tint (0=neutral)"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = { label: params.label };
      for (const key of Object.keys(params)) {
        if (key !== "label" && params[key] !== undefined) {
          cmdParams[key] = params[key];
        }
      }
      const result = await ue5.executeCommand("postprocess", "set_color_grading", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
