/**
 * UE Conduit — MetaHuman / Character Creation Tools
 *
 * MCP tools for listing, spawning, and customizing MetaHuman characters,
 * and creating character Blueprints from skeletal meshes.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

const Vector3 = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  z: z.number().default(0),
});

const Rotator = z.object({
  pitch: z.number().default(0),
  yaw: z.number().default(0),
  roll: z.number().default(0),
});

export function registerMetaHumanTools(server: any, ue5: UE5Client) {
  server.tool(
    "ue5_list_metahumans",
    "List all MetaHuman assets in the project.",
    {
      path: z.string().default("/Game/MetaHumans").describe("Content browser path to search"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("metahuman", "list_metahumans", {
        path: params.path,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_spawn_metahuman",
    "Spawn a MetaHuman actor in the level from a Blueprint.",
    {
      blueprint_path: z.string().describe("Path to MetaHuman Blueprint (e.g., /Game/MetaHumans/MH_Warrior/BP_MH_Warrior)"),
      location: Vector3.optional().describe("World location to spawn at"),
      rotation: Rotator.optional().describe("Initial rotation"),
      label: z.string().optional().describe("Actor label in the outliner"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("metahuman", "spawn_metahuman", {
        blueprint_path: params.blueprint_path,
        location: params.location ?? { x: 0, y: 0, z: 0 },
        rotation: params.rotation ?? { pitch: 0, yaw: 0, roll: 0 },
        label: params.label ?? "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_customize_metahuman",
    "Customize a MetaHuman actor's body type, face, hair, and clothing.",
    {
      label: z.string().describe("Actor label of the MetaHuman"),
      body_type: z.string().optional().describe("Body type preset"),
      face_preset: z.string().optional().describe("Face preset name"),
      hair_style: z.string().optional().describe("Hair style name"),
      clothing: z.string().optional().describe("Clothing preset name"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = { label: params.label };
      if (params.body_type) cmdParams.body_type = params.body_type;
      if (params.face_preset) cmdParams.face_preset = params.face_preset;
      if (params.hair_style) cmdParams.hair_style = params.hair_style;
      if (params.clothing) cmdParams.clothing = params.clothing;
      const result = await ue5.executeCommand("metahuman", "customize_metahuman", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_set_metahuman_animation",
    "Assign an Animation Blueprint to a MetaHuman or character actor.",
    {
      label: z.string().describe("Actor label"),
      anim_blueprint: z.string().describe("Path to Animation Blueprint asset"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("metahuman", "set_metahuman_animation", {
        label: params.label,
        anim_blueprint: params.anim_blueprint,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_character_from_mesh",
    "Create a Character Blueprint from any skeletal mesh. Sets up capsule, movement, and mesh components.",
    {
      skeletal_mesh: z.string().describe("Path to SkeletalMesh asset"),
      name: z.string().describe("Blueprint name (e.g., BP_EnemyWarrior)"),
      path: z.string().default("/Game/Blueprints/Characters").describe("Content browser path"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("metahuman", "create_character_from_mesh", {
        skeletal_mesh: params.skeletal_mesh,
        name: params.name,
        path: params.path,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_set_character_mesh",
    "Swap the skeletal mesh on an existing character actor in the level.",
    {
      label: z.string().describe("Actor label of the character"),
      skeletal_mesh: z.string().describe("Path to new SkeletalMesh asset"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("metahuman", "set_character_mesh", {
        label: params.label,
        skeletal_mesh: params.skeletal_mesh,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
