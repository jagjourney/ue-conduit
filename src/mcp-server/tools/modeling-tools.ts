/**
 * UE Conduit — Geometry Script / Modeling Tools
 *
 * MCP tools for creating procedural meshes (box, cylinder, sphere, plane),
 * performing boolean operations, and converting to static mesh assets.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

const Vector3 = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  z: z.number().default(0),
});

export function registerModelingTools(server: any, ue5: UE5Client) {
  server.tool(
    "ue5_create_box_mesh",
    "Create a procedural box mesh actor in the level.",
    {
      location: Vector3.optional().describe("World location"),
      label: z.string().optional().describe("Actor label"),
      dimensions: z.object({
        width: z.number().default(100),
        height: z.number().default(100),
        depth: z.number().default(100),
      }).optional().describe("Box dimensions in world units"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("modeling", "create_box_mesh", {
        location: params.location ?? { x: 0, y: 0, z: 0 },
        label: params.label ?? "",
        dimensions: params.dimensions ?? { width: 100, height: 100, depth: 100 },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_cylinder_mesh",
    "Create a procedural cylinder mesh actor in the level.",
    {
      location: Vector3.optional().describe("World location"),
      label: z.string().optional().describe("Actor label"),
      radius: z.number().default(50).describe("Cylinder radius"),
      height: z.number().default(100).describe("Cylinder height"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("modeling", "create_cylinder_mesh", {
        location: params.location ?? { x: 0, y: 0, z: 0 },
        label: params.label ?? "",
        radius: params.radius,
        height: params.height,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_sphere_mesh",
    "Create a procedural sphere mesh actor in the level.",
    {
      location: Vector3.optional().describe("World location"),
      label: z.string().optional().describe("Actor label"),
      radius: z.number().default(50).describe("Sphere radius"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("modeling", "create_sphere_mesh", {
        location: params.location ?? { x: 0, y: 0, z: 0 },
        label: params.label ?? "",
        radius: params.radius,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_plane_mesh",
    "Create a procedural plane mesh actor in the level.",
    {
      location: Vector3.optional().describe("World location"),
      label: z.string().optional().describe("Actor label"),
      size_x: z.number().default(100).describe("Plane width"),
      size_y: z.number().default(100).describe("Plane height"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("modeling", "create_plane_mesh", {
        location: params.location ?? { x: 0, y: 0, z: 0 },
        label: params.label ?? "",
        size_x: params.size_x,
        size_y: params.size_y,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_boolean_union",
    "Boolean union (combine) two mesh actors into one.",
    {
      actor_a: z.string().describe("Label of the first actor"),
      actor_b: z.string().describe("Label of the second actor"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("modeling", "boolean_union", {
        actor_a: params.actor_a,
        actor_b: params.actor_b,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_boolean_subtract",
    "Boolean subtraction: subtract actor_b from actor_a.",
    {
      actor_a: z.string().describe("Label of the base actor"),
      actor_b: z.string().describe("Label of the actor to subtract"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("modeling", "boolean_subtract", {
        actor_a: params.actor_a,
        actor_b: params.actor_b,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_convert_to_static_mesh",
    "Convert a dynamic/procedural mesh actor to a saved StaticMesh asset.",
    {
      label: z.string().describe("Actor label of the mesh to convert"),
      asset_name: z.string().optional().describe("Name for the new StaticMesh asset"),
      path: z.string().default("/Game/Meshes").describe("Content browser path"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("modeling", "convert_to_static_mesh", {
        label: params.label,
        asset_name: params.asset_name ?? "",
        path: params.path,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
