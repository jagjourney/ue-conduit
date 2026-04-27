/**
 * UE Conduit — Collision / Physics Tools
 *
 * MCP tools for setting collision presets, adding collision volumes,
 * enabling physics simulation, and performing raycasts.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

const Vector3 = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  z: z.number().default(0),
});

export function registerPhysicsTools(server: any, ue5: UE5Client) {
  // --- Set Collision ---
  server.tool(
    "ue5_set_collision",
    "Set the collision preset on an actor's component. Controls what the actor collides with.",
    {
      label: z.string().describe("Actor label"),
      preset: z
        .string()
        .describe("Collision preset name (BlockAll, OverlapAll, NoCollision, BlockAllDynamic, OverlapAllDynamic, PhysicsActor, Pawn, Vehicle, Trigger)"),
      component: z.string().optional().describe("Specific component name (defaults to root)"),
      enabled: z.boolean().optional().describe("Enable/disable collision entirely"),
      generate_overlap_events: z.boolean().optional().describe("Generate overlap events"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = {
        label: params.label,
        preset: params.preset,
      };
      if (params.component) cmdParams.component = params.component;
      if (params.enabled !== undefined) cmdParams.enabled = params.enabled;
      if (params.generate_overlap_events !== undefined) cmdParams.generate_overlap_events = params.generate_overlap_events;

      const result = await ue5.executeCommand("physics", "set_collision", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Add Collision Box ---
  server.tool(
    "ue5_add_collision_box",
    "Add a box collision component to an actor. Useful for custom collision shapes on meshes.",
    {
      label: z.string().describe("Actor label"),
      extent: Vector3.optional().describe("Box half-extents {x, y, z} in cm (default 50x50x50)"),
      offset: Vector3.optional().describe("Offset relative to the actor origin"),
      component_name: z.string().optional().describe("Name for the new collision component"),
      preset: z.string().optional().describe("Collision preset (default BlockAll)"),
      generate_overlap_events: z.boolean().default(false).describe("Generate overlap events"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("physics", "add_collision_box", {
        label: params.label,
        extent: params.extent,
        offset: params.offset,
        component_name: params.component_name ?? "",
        preset: params.preset ?? "",
        generate_overlap_events: params.generate_overlap_events,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Set Physics Simulation ---
  server.tool(
    "ue5_set_physics_simulation",
    "Enable or disable physics simulation on an actor. When enabled, the actor responds to gravity and collisions.",
    {
      label: z.string().describe("Actor label"),
      enabled: z.boolean().default(true).describe("Enable (true) or disable (false) physics simulation"),
      component: z.string().optional().describe("Specific component name (defaults to root)"),
      mass: z.number().optional().describe("Mass override in kg"),
      enable_gravity: z.boolean().optional().describe("Enable/disable gravity"),
      linear_damping: z.number().optional().describe("Linear damping (air resistance)"),
      angular_damping: z.number().optional().describe("Angular damping (rotation resistance)"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = {
        label: params.label,
        enabled: params.enabled,
      };
      if (params.component) cmdParams.component = params.component;
      if (params.mass !== undefined) cmdParams.mass = params.mass;
      if (params.enable_gravity !== undefined) cmdParams.enable_gravity = params.enable_gravity;
      if (params.linear_damping !== undefined) cmdParams.linear_damping = params.linear_damping;
      if (params.angular_damping !== undefined) cmdParams.angular_damping = params.angular_damping;

      const result = await ue5.executeCommand("physics", "set_physics_simulation", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Raycast ---
  server.tool(
    "ue5_raycast",
    "Cast a ray in the world and return what it hits. Use this for AI to 'see' the world, check line of sight, find ground height, etc.",
    {
      start: Vector3.describe("Ray start point {x, y, z}"),
      end: Vector3.optional().describe("Ray end point {x, y, z} — use this OR direction+distance"),
      direction: Vector3.optional().describe("Ray direction {x, y, z} — normalized automatically"),
      distance: z.number().default(10000).describe("Ray distance in cm (used with direction)"),
      multi: z.boolean().default(false).describe("Return all hits (true) or just the first (false)"),
      complex: z.boolean().default(false).describe("Use complex collision (per-poly, slower but more accurate)"),
      ignore_label: z.string().optional().describe("Actor label to ignore in the raycast"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = {
        start: params.start,
        multi: params.multi,
        complex: params.complex,
      };
      if (params.end) cmdParams.end = params.end;
      if (params.direction) {
        cmdParams.direction = params.direction;
        cmdParams.distance = params.distance;
      }
      if (params.ignore_label) cmdParams.ignore_label = params.ignore_label;

      const result = await ue5.executeCommand("physics", "raycast", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
