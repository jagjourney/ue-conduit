/**
 * UE Conduit — Gameplay Framework Tools
 *
 * MCP tools for creating game mode, player controller, game state Blueprints,
 * spawning player starts, trigger volumes, and configuring world settings.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

const Vector3 = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  z: z.number().default(0),
});

export function registerGameplayTools(server: any, ue5: UE5Client) {
  server.tool(
    "ue5_create_game_mode",
    "Create a GameMode Blueprint for controlling match rules, spawning, and game flow.",
    {
      name: z.string().default("BP_GameMode").describe("Blueprint name"),
      path: z.string().default("/Game/Blueprints/Framework").describe("Content browser path"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("gameplay", "create_game_mode", {
        name: params.name,
        path: params.path,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_player_controller",
    "Create a PlayerController Blueprint for handling player input and camera.",
    {
      name: z.string().default("BP_PlayerController").describe("Blueprint name"),
      path: z.string().default("/Game/Blueprints/Framework").describe("Content browser path"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("gameplay", "create_player_controller", {
        name: params.name,
        path: params.path,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_game_state",
    "Create a GameState Blueprint for tracking shared match state (scores, phase, etc.).",
    {
      name: z.string().default("BP_GameState").describe("Blueprint name"),
      path: z.string().default("/Game/Blueprints/Framework").describe("Content browser path"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("gameplay", "create_game_state", {
        name: params.name,
        path: params.path,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_set_world_settings",
    "Set world settings: game mode, kill Z, gravity, and more.",
    {
      game_mode: z.string().optional().describe("GameMode class path to set as default"),
      kill_z: z.number().optional().describe("Kill Z height (actors below this are destroyed)"),
      gravity_z: z.number().optional().describe("World gravity Z component (default: -980)"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = {};
      if (params.game_mode) cmdParams.game_mode = params.game_mode;
      if (params.kill_z !== undefined) cmdParams.kill_z = params.kill_z;
      if (params.gravity_z !== undefined) cmdParams.gravity_z = params.gravity_z;
      const result = await ue5.executeCommand("gameplay", "set_world_settings", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_player_start",
    "Spawn a PlayerStart actor to define where players spawn.",
    {
      location: Vector3.optional().describe("World location"),
      rotation: z.object({ yaw: z.number().default(0) }).optional().describe("Facing direction"),
      label: z.string().optional().describe("Actor label"),
      player_start_tag: z.string().optional().describe("Tag for team/role-specific spawns"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("gameplay", "create_player_start", {
        location: params.location ?? { x: 0, y: 0, z: 100 },
        rotation: params.rotation ?? { yaw: 0 },
        label: params.label ?? "",
        player_start_tag: params.player_start_tag ?? "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_trigger_volume",
    "Create a trigger volume (box or sphere) for gameplay events.",
    {
      location: Vector3.optional().describe("World location"),
      shape: z.enum(["box", "sphere"]).default("box").describe("Trigger shape"),
      extent: Vector3.optional().describe("Volume extent/size in each axis"),
      label: z.string().optional().describe("Actor label"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("gameplay", "create_trigger_volume", {
        location: params.location ?? { x: 0, y: 0, z: 0 },
        shape: params.shape,
        extent: params.extent ?? { x: 200, y: 200, z: 200 },
        label: params.label ?? "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_blocking_volume",
    "Create an invisible blocking wall to restrict player movement.",
    {
      location: Vector3.optional().describe("World location"),
      extent: Vector3.optional().describe("Volume extent/size"),
      label: z.string().optional().describe("Actor label"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("gameplay", "create_blocking_volume", {
        location: params.location ?? { x: 0, y: 0, z: 0 },
        extent: params.extent ?? { x: 500, y: 500, z: 500 },
        label: params.label ?? "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_set_level_bounds",
    "Configure level streaming distances and bounds.",
    {
      streaming_distance: z.number().optional().describe("Streaming distance in world units"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = {};
      if (params.streaming_distance !== undefined) cmdParams.streaming_distance = params.streaming_distance;
      const result = await ue5.executeCommand("gameplay", "set_level_bounds", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
