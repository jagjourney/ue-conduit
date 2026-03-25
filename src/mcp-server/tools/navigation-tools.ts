/**
 * UE Conduit — Navigation / AI Advanced Tools
 *
 * MCP tools for creating NavMesh bounds, rebuilding navigation, NavLinks,
 * NavModifiers, EQS queries, path testing, and random point generation.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

const Vector3 = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  z: z.number().default(0),
});

export function registerNavigationTools(server: any, ue5: UE5Client) {
  server.tool(
    "ue5_create_nav_mesh_bounds",
    "Create a NavMeshBoundsVolume to define the area where NavMesh is generated.",
    {
      location: Vector3.optional().describe("World location"),
      extent: Vector3.optional().describe("Volume extent (half-size in each axis)"),
      label: z.string().optional().describe("Actor label"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("navigation", "create_nav_mesh_bounds", {
        location: params.location ?? { x: 0, y: 0, z: 0 },
        extent: params.extent ?? { x: 5000, y: 5000, z: 1000 },
        label: params.label ?? "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_rebuild_navigation",
    "Rebuild all navigation data (NavMesh) for the current level.",
    {},
    async () => {
      const result = await ue5.executeCommand("navigation", "rebuild_navigation", {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_nav_link",
    "Create a NavLink proxy for AI jump/teleport connections between navmesh islands.",
    {
      location: Vector3.optional().describe("World location"),
      label: z.string().optional().describe("Actor label"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("navigation", "create_nav_link", {
        location: params.location ?? { x: 0, y: 0, z: 0 },
        label: params.label ?? "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_nav_modifier",
    "Create a NavModifier volume to mark areas as costly, forbidden, or preferred for AI pathfinding.",
    {
      location: Vector3.optional().describe("World location"),
      extent: Vector3.optional().describe("Volume extent"),
      label: z.string().optional().describe("Actor label"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("navigation", "create_nav_modifier", {
        location: params.location ?? { x: 0, y: 0, z: 0 },
        extent: params.extent ?? { x: 500, y: 500, z: 200 },
        label: params.label ?? "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_eqs_query",
    "Create an Environment Query System (EQS) query asset for AI decision-making.",
    {
      name: z.string().describe("EQS query name (e.g., EQS_FindCoverPoint)"),
      path: z.string().default("/Game/AI/EQS").describe("Content browser path"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("navigation", "create_eqs_query", {
        name: params.name,
        path: params.path,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_test_path",
    "Test if a navigation path exists between two points. Returns whether both points are on the NavMesh.",
    {
      start: Vector3.describe("Start location"),
      end: Vector3.describe("End location"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("navigation", "test_path", {
        start: params.start,
        end: params.end,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_get_random_reachable_point",
    "Get a random navigable point within a radius. Useful for AI spawning and patrol generation.",
    {
      origin: Vector3.optional().describe("Search origin point"),
      radius: z.number().default(5000).describe("Search radius in world units"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("navigation", "get_random_reachable_point", {
        origin: params.origin ?? { x: 0, y: 0, z: 0 },
        radius: params.radius,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
