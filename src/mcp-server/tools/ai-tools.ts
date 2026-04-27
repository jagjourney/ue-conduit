/**
 * UE Conduit — AI Tools
 *
 * MCP tools for creating Behavior Trees, Blackboards, and working with
 * the navigation mesh for AI-driven characters.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

const Vector3 = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  z: z.number().default(0),
});

export function registerAITools(server: any, ue5: UE5Client) {
  // --- Create Behavior Tree ---
  server.tool(
    "ue5_create_behavior_tree",
    "Create a Behavior Tree asset for AI decision-making. Behavior Trees drive NPC logic via composites (Selector, Sequence) and tasks.",
    {
      name: z.string().describe("Behavior Tree name (e.g., BT_Enemy_Melee, BT_NPC_Patrol)"),
      path: z.string().default("/Game/AI/BehaviorTrees/").describe("Content browser folder path"),
      blackboard: z.string().optional().describe("Blackboard asset path to associate (e.g., /Game/AI/BB_Enemy)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("ai", "create_behavior_tree", {
        name: params.name,
        path: params.path,
        blackboard: params.blackboard ?? "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Create Blackboard ---
  server.tool(
    "ue5_create_blackboard",
    "Create a Blackboard Data asset. Blackboards store shared data for Behavior Trees (target actor, patrol point, health, etc.).",
    {
      name: z.string().describe("Blackboard name (e.g., BB_Enemy, BB_NPC_Villager)"),
      path: z.string().default("/Game/AI/Blackboards/").describe("Content browser folder path"),
      parent_blackboard: z.string().optional().describe("Parent blackboard to inherit keys from"),
      keys: z
        .array(
          z.object({
            name: z.string().describe("Key name (e.g., TargetActor, PatrolLocation)"),
            type: z
              .enum(["Bool", "Int", "Float", "String", "Name", "Vector", "Rotator", "Object", "Class", "Enum"])
              .describe("Key value type"),
            instance_synced: z.boolean().default(false).describe("Sync across all behavior tree instances"),
          })
        )
        .optional()
        .describe("Initial keys to add to the blackboard"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("ai", "create_blackboard", {
        name: params.name,
        path: params.path,
        parent_blackboard: params.parent_blackboard ?? "",
        keys: params.keys ?? [],
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Add Blackboard Key ---
  server.tool(
    "ue5_add_blackboard_key",
    "Add a key to an existing Blackboard Data asset.",
    {
      blackboard: z.string().describe("Blackboard asset path (e.g., /Game/AI/BB_Enemy)"),
      name: z.string().describe("Key name (e.g., TargetActor, IsAlert, PatrolIndex)"),
      type: z
        .enum(["Bool", "Int", "Float", "String", "Name", "Vector", "Rotator", "Object", "Class", "Enum"])
        .describe("Key value type"),
      base_class: z.string().optional().describe("Base class filter for Object/Class key types (e.g., Actor, Pawn)"),
      enum_name: z.string().optional().describe("Enum type name for Enum key type"),
      instance_synced: z.boolean().default(false).describe("Sync across all behavior tree instances"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("ai", "add_blackboard_key", {
        blackboard: params.blackboard,
        name: params.name,
        type: params.type,
        base_class: params.base_class ?? "",
        enum_name: params.enum_name ?? "",
        instance_synced: params.instance_synced,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Build NavMesh ---
  server.tool(
    "ue5_build_navmesh",
    "Build or rebuild the navigation mesh for the current level. Required for AI pathfinding.",
    {
      agent_radius: z.number().optional().describe("Navigation agent radius (default from project settings)"),
      agent_height: z.number().optional().describe("Navigation agent height"),
      cell_size: z.number().optional().describe("NavMesh cell size (smaller = more precise, slower)"),
      cell_height: z.number().optional().describe("NavMesh cell height"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = {};
      if (params.agent_radius != null) cmdParams.agent_radius = params.agent_radius;
      if (params.agent_height != null) cmdParams.agent_height = params.agent_height;
      if (params.cell_size != null) cmdParams.cell_size = params.cell_size;
      if (params.cell_height != null) cmdParams.cell_height = params.cell_height;

      const result = await ue5.executeCommand("ai", "build_navmesh", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Query NavMesh ---
  server.tool(
    "ue5_query_navmesh",
    "Test if a world location is navigable (on the NavMesh). Useful for validating spawn points and patrol routes.",
    {
      location: Vector3.describe("World location to test {x, y, z}"),
      query_radius: z.number().default(100).describe("Search radius around the point"),
      find_nearest: z.boolean().default(true).describe("If point is off-mesh, find nearest navigable point"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("ai", "query_navmesh", {
        location: params.location,
        query_radius: params.query_radius,
        find_nearest: params.find_nearest,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
