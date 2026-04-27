/**
 * UE Conduit — Asset Tools
 *
 * MCP tools for importing assets, creating materials, and managing content.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerAssetTools(server: any, ue5: UE5Client) {
  // --- Import Texture ---
  server.tool(
    "ue5_import_texture",
    "Import an image file (PNG, JPG, TGA, BMP) as a UE5 texture asset.",
    {
      source_path: z.string().describe("Absolute path to image file on disk"),
      dest_path: z.string().describe("Content browser destination (e.g., /Game/Textures/Enemies/)"),
      name: z.string().optional().describe("Asset name (defaults to filename)"),
      compression: z
        .enum(["TC_Default", "TC_Normalmap", "TC_Masks", "TC_Grayscale", "TC_HDR", "TC_UserInterface2D"])
        .default("TC_Default")
        .describe("Texture compression setting"),
      srgb: z.boolean().default(true).describe("sRGB color space (true for diffuse, false for normal/mask)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("asset", "import", {
        source_path: params.source_path,
        destination: params.dest_path,
        asset_name: params.name ?? "",
        import_settings: {
          compression: params.compression,
          srgb: params.srgb,
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Import Mesh ---
  server.tool(
    "ue5_import_mesh",
    "Import a 3D model (FBX, OBJ, glTF) as a static or skeletal mesh.",
    {
      source_path: z.string().describe("Absolute path to mesh file"),
      dest_path: z.string().describe("Content browser destination"),
      name: z.string().optional().describe("Asset name"),
      skeletal: z.boolean().default(false).describe("Import as skeletal mesh (for characters)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("asset", "import", {
        source_path: params.source_path,
        destination: params.dest_path,
        asset_name: params.name ?? "",
        import_settings: {
          import_as_skeletal: params.skeletal,
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Create Material ---
  server.tool(
    "ue5_create_material",
    "Create a new material asset with texture inputs.",
    {
      name: z.string().describe("Material name (e.g., M_ShatteredCoast_Ground)"),
      path: z.string().default("/Game/Materials/").describe("Content browser path"),
      domain: z.enum(["Surface", "DeferredDecal", "LightFunction", "PostProcess", "UI"]).default("Surface"),
      blend_mode: z.enum(["Opaque", "Masked", "Translucent", "Additive", "Modulate"]).default("Opaque"),
      two_sided: z.boolean().default(false),
      base_color_texture: z.string().optional().describe("Texture path for base color"),
      normal_texture: z.string().optional().describe("Texture path for normal map"),
      roughness_value: z.number().optional().describe("Constant roughness (0-1)"),
      metallic_value: z.number().optional().describe("Constant metallic (0-1)"),
      emissive_texture: z.string().optional().describe("Texture path for emissive"),
      emissive_strength: z.number().optional().describe("Emissive multiplier"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("asset", "create_material", {
        name: params.name,
        path: params.path,
        domain: params.domain,
        blend_mode: params.blend_mode,
        two_sided: params.two_sided,
        textures: {
          base_color: params.base_color_texture,
          normal: params.normal_texture,
          emissive: params.emissive_texture,
        },
        scalar_params: {
          roughness: params.roughness_value,
          metallic: params.metallic_value,
          emissive_strength: params.emissive_strength,
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Create Material Instance ---
  server.tool(
    "ue5_create_material_instance",
    "Create a material instance from a parent material with parameter overrides.",
    {
      name: z.string().describe("Material instance name (e.g., MI_Sword_Iron)"),
      parent_material: z.string().describe("Parent material path (e.g., /Game/Materials/M_WeaponBase)"),
      path: z.string().default("/Game/Materials/Instances/").describe("Content browser path"),
      texture_params: z.record(z.string()).optional().describe("Texture parameter overrides {name: texture_path}"),
      scalar_params: z.record(z.number()).optional().describe("Scalar parameter overrides {name: value}"),
      vector_params: z.record(z.object({ r: z.number(), g: z.number(), b: z.number(), a: z.number().default(1) })).optional(),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("asset", "create_material_instance", {
        name: params.name,
        parent: params.parent_material,
        path: params.path,
        texture_params: params.texture_params ?? {},
        scalar_params: params.scalar_params ?? {},
        vector_params: params.vector_params ?? {},
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Batch Import ---
  server.tool(
    "ue5_batch_import",
    "Import all files from a directory into UE5. Automatically categorizes by file type.",
    {
      source_dir: z.string().describe("Absolute path to directory with files to import"),
      dest_path: z.string().describe("Content browser destination base path"),
      file_filter: z.string().optional().describe("File extension filter (e.g., *.png, *.fbx)"),
      recursive: z.boolean().default(true).describe("Include subdirectories"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("asset", "batch_import", {
        source_directory: params.source_dir,
        destination: params.dest_path,
        filter: params.file_filter ?? "*.*",
        recursive: params.recursive,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- List Assets ---
  server.tool(
    "ue5_list_assets",
    "List assets in a content browser path.",
    {
      path: z.string().default("/Game/").describe("Content browser path"),
      type_filter: z.string().optional().describe("Asset type filter (Texture2D, StaticMesh, Blueprint, etc.)"),
      recursive: z.boolean().default(false),
      limit: z.number().default(100),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("asset", "search", {
        path: params.path,
        type_filter: params.type_filter ?? "",
        recursive: params.recursive,
        limit: params.limit,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Search Assets ---
  server.tool(
    "ue5_search_assets",
    "Search for assets by name across the entire project.",
    {
      query: z.string().describe("Search query (asset name substring)"),
      type_filter: z.string().optional().describe("Asset type filter"),
      limit: z.number().default(50),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("asset", "search", {
        query: params.query,
        type_filter: params.type_filter ?? "",
        limit: params.limit,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
