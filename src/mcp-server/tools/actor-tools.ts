/**
 * UE Conduit — Actor Tools
 *
 * MCP tools for spawning, moving, deleting, and querying actors in UE5.
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

export function registerActorTools(server: any, ue5: UE5Client) {
  // --- Spawn Actor ---
  server.tool(
    "ue5_spawn_actor",
    "Spawn an actor in the UE5 editor level. Use a Blueprint path (e.g., /Game/Blueprints/BP_Enemy) or a C++ class path (e.g., /Script/Engine.PointLight).",
    {
      class_path: z.string().describe("Blueprint or C++ class path to spawn"),
      location: Vector3.optional().describe("World location {x, y, z}"),
      rotation: Rotator.optional().describe("Rotation {pitch, yaw, roll}"),
      scale: Vector3.optional().describe("Scale {x, y, z}, defaults to 1,1,1"),
      label: z.string().optional().describe("Actor label in the outliner"),
      properties: z.record(z.unknown()).optional().describe("Properties to set after spawning"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("level", "spawn_actor", {
        class_path: params.class_path,
        location: params.location ?? { x: 0, y: 0, z: 0 },
        rotation: params.rotation ?? { pitch: 0, yaw: 0, roll: 0 },
        scale: params.scale ?? { x: 1, y: 1, z: 1 },
        actor_label: params.label ?? "",
        properties: params.properties ?? {},
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Delete Actor ---
  server.tool(
    "ue5_delete_actor",
    "Delete an actor from the level by its label or path.",
    {
      actor_label: z.string().describe("The actor label or path to delete"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("level", "delete_actor", {
        actor_label: params.actor_label,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Move Actor ---
  server.tool(
    "ue5_move_actor",
    "Set an actor's transform (location, rotation, scale).",
    {
      actor_label: z.string().describe("The actor to move"),
      location: Vector3.optional().describe("New world location"),
      rotation: Rotator.optional().describe("New rotation"),
      scale: Vector3.optional().describe("New scale"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = { actor_label: params.actor_label };
      if (params.location) cmdParams.location = params.location;
      if (params.rotation) cmdParams.rotation = params.rotation;
      if (params.scale) cmdParams.scale = params.scale;

      const result = await ue5.executeCommand("level", "set_actor_transform", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- List Actors ---
  server.tool(
    "ue5_list_actors",
    "List all actors in the current level. Optionally filter by class, tag, or name pattern.",
    {
      class_filter: z.string().optional().describe("Filter by class name (e.g., StaticMeshActor)"),
      tag_filter: z.string().optional().describe("Filter by actor tag"),
      name_filter: z.string().optional().describe("Filter by name substring"),
      limit: z.number().optional().default(100).describe("Max results to return"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("level", "list_actors", {
        class_filter: params.class_filter ?? "",
        tag_filter: params.tag_filter ?? "",
        name_filter: params.name_filter ?? "",
        limit: params.limit ?? 100,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Query Actor ---
  server.tool(
    "ue5_query_actor",
    "Get detailed information about a specific actor (all properties, components, transform).",
    {
      actor_label: z.string().describe("The actor label to query"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("level", "query_actor", {
        actor_label: params.actor_label,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Set Actor Property ---
  server.tool(
    "ue5_set_actor_property",
    "Set any property on an actor. Use dot notation for nested properties (e.g., LightComponent.Intensity).",
    {
      actor_label: z.string().describe("The actor to modify"),
      property_path: z.string().describe("Property path (e.g., MaxHealth, LightComponent.Intensity)"),
      value: z.unknown().describe("The value to set"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("level", "set_property", {
        actor_label: params.actor_label,
        property_path: params.property_path,
        value: params.value,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Batch Spawn ---
  server.tool(
    "ue5_batch_spawn",
    "Spawn multiple actors in one call. Much faster than individual spawns for placing many actors.",
    {
      actors: z
        .array(
          z.object({
            class_path: z.string(),
            location: Vector3.optional(),
            rotation: Rotator.optional(),
            scale: Vector3.optional(),
            label: z.string().optional(),
            properties: z.record(z.unknown()).optional(),
          })
        )
        .describe("Array of actors to spawn"),
    },
    async (params: any) => {
      const results = [];
      for (const actor of params.actors) {
        const result = await ue5.executeCommand("level", "spawn_actor", {
          class_path: actor.class_path,
          location: actor.location ?? { x: 0, y: 0, z: 0 },
          rotation: actor.rotation ?? { pitch: 0, yaw: 0, roll: 0 },
          scale: actor.scale ?? { x: 1, y: 1, z: 1 },
          actor_label: actor.label ?? "",
          properties: actor.properties ?? {},
        });
        results.push(result);
      }
      const succeeded = results.filter((r) => r.success).length;
      return {
        content: [
          {
            type: "text",
            text: `Spawned ${succeeded}/${results.length} actors successfully.\n${JSON.stringify(results, null, 2)}`,
          },
        ],
      };
    }
  );

  // --- Select Actor ---
  server.tool(
    "ue5_select_actor",
    "Select an actor in the editor (highlights it in viewport and outliner).",
    {
      actor_label: z.string().describe("The actor to select"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("editor", "select_actor", {
        actor_label: params.actor_label,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
