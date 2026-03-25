/**
 * UE Conduit — Texture / Material Advanced Tools
 *
 * MCP tools for creating render targets, procedural textures, decals,
 * landscape layer info, and managing material parameters.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

const Vector3 = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  z: z.number().default(0),
});

const Color = z.object({
  r: z.number().min(0).max(1).default(1),
  g: z.number().min(0).max(1).default(1),
  b: z.number().min(0).max(1).default(1),
  a: z.number().min(0).max(1).default(1),
});

export function registerTextureTools(server: any, ue5: UE5Client) {
  server.tool(
    "ue5_create_render_target",
    "Create a render target texture asset for dynamic rendering, mirrors, or security cameras.",
    {
      name: z.string().describe("Render target name (e.g., RT_SecurityCamera_01)"),
      path: z.string().default("/Game/Textures/RenderTargets").describe("Content browser path"),
      width: z.number().default(1024).describe("Texture width"),
      height: z.number().default(1024).describe("Texture height"),
      format: z.enum(["RGBA8", "HDR"]).default("RGBA8").describe("Texture format"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("texture", "create_render_target", {
        name: params.name,
        path: params.path,
        width: params.width,
        height: params.height,
        format: params.format,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_texture_from_color",
    "Generate a solid color texture asset.",
    {
      name: z.string().describe("Texture name"),
      path: z.string().default("/Game/Textures").describe("Content browser path"),
      width: z.number().default(64).describe("Texture width"),
      height: z.number().default(64).describe("Texture height"),
      color: Color.optional().describe("Fill color (RGBA 0-1)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("texture", "create_texture_from_color", {
        name: params.name,
        path: params.path,
        width: params.width,
        height: params.height,
        color: params.color ?? { r: 1, g: 1, b: 1, a: 1 },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_texture_from_noise",
    "Generate a procedural noise texture (Perlin, Worley, etc.).",
    {
      name: z.string().describe("Texture name"),
      path: z.string().default("/Game/Textures").describe("Content browser path"),
      width: z.number().default(256).describe("Texture width"),
      height: z.number().default(256).describe("Texture height"),
      noise_type: z.enum(["perlin", "worley", "simplex", "value"]).default("perlin").describe("Noise algorithm"),
      scale: z.number().default(1.0).describe("Noise scale"),
      seed: z.number().default(0).describe("Random seed"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("texture", "create_texture_from_noise", {
        name: params.name,
        path: params.path,
        width: params.width,
        height: params.height,
        noise_type: params.noise_type,
        scale: params.scale,
        seed: params.seed,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_apply_material_to_actors",
    "Batch apply a material to multiple actors by label.",
    {
      material_path: z.string().describe("Path to the material asset"),
      actor_labels: z.array(z.string()).describe("Array of actor labels to apply the material to"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("texture", "apply_material_to_actors", {
        material_path: params.material_path,
        actor_labels: params.actor_labels,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_decal",
    "Spawn a decal actor with a material at a location (blood splatter, cracks, signs).",
    {
      material_path: z.string().describe("Path to decal material"),
      location: Vector3.optional().describe("World location"),
      label: z.string().optional().describe("Actor label"),
      size_x: z.number().default(128).describe("Decal width"),
      size_y: z.number().default(128).describe("Decal height"),
      size_z: z.number().default(256).describe("Decal projection depth"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("texture", "create_decal", {
        material_path: params.material_path,
        location: params.location ?? { x: 0, y: 0, z: 0 },
        label: params.label ?? "",
        size_x: params.size_x,
        size_y: params.size_y,
        size_z: params.size_z,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_landscape_layer_info",
    "Create a landscape layer info asset for landscape painting.",
    {
      name: z.string().describe("Layer info asset name"),
      path: z.string().default("/Game/Landscape/LayerInfo").describe("Content browser path"),
      layer_name: z.string().describe("Landscape layer name (e.g., Grass, Rock, Sand)"),
      weight_blended: z.boolean().default(true).describe("Use weight-blended layer"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("texture", "create_landscape_layer_info", {
        name: params.name,
        path: params.path,
        layer_name: params.layer_name,
        weight_blended: params.weight_blended,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_get_material_parameters",
    "List all scalar, vector, and texture parameters of a material.",
    {
      material_path: z.string().describe("Path to the material or material instance"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("texture", "get_material_parameters", {
        material_path: params.material_path,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_set_material_parameter",
    "Set a scalar, vector, or texture parameter on a MaterialInstanceConstant.",
    {
      material_path: z.string().describe("Path to the MaterialInstanceConstant"),
      parameter_name: z.string().describe("Parameter name"),
      parameter_type: z.enum(["scalar", "vector", "texture"]).describe("Parameter type"),
      value: z.unknown().optional().describe("Scalar number or vector {r,g,b,a}"),
      texture_path: z.string().optional().describe("Texture path (for texture parameters)"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = {
        material_path: params.material_path,
        parameter_name: params.parameter_name,
        parameter_type: params.parameter_type,
      };
      if (params.value !== undefined) cmdParams.value = params.value;
      if (params.texture_path) cmdParams.texture_path = params.texture_path;
      const result = await ue5.executeCommand("texture", "set_material_parameter", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
