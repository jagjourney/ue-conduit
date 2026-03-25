/**
 * UE Conduit — Multiplayer / Replication Tools
 *
 * MCP tools for configuring replication, network roles, game sessions,
 * and launching multiplayer PIE tests.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerMultiplayerTools(server: any, ue5: UE5Client) {
  server.tool(
    "ue5_set_replication",
    "Set replication settings on an actor (replicate, replicate movement).",
    {
      label: z.string().describe("Actor label"),
      replicate: z.boolean().default(true).describe("Enable replication"),
      replicate_movement: z.boolean().optional().describe("Replicate movement to clients"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = {
        label: params.label,
        replicate: params.replicate,
      };
      if (params.replicate_movement !== undefined) {
        cmdParams.replicate_movement = params.replicate_movement;
      }
      const result = await ue5.executeCommand("multiplayer", "set_replication", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_set_net_role",
    "Get/set the network authority role of an actor.",
    {
      label: z.string().describe("Actor label"),
      role: z.enum(["Authority", "AutonomousProxy", "SimulatedProxy"]).optional().describe("Desired network role"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("multiplayer", "set_net_role", {
        label: params.label,
        role: params.role ?? "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_game_session",
    "Create a game session configuration for multiplayer.",
    {
      session_name: z.string().default("DefaultSession").describe("Session name"),
      max_players: z.number().default(16).describe("Maximum player count"),
      is_lan: z.boolean().default(false).describe("LAN-only session"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("multiplayer", "create_game_session", {
        session_name: params.session_name,
        max_players: params.max_players,
        is_lan: params.is_lan,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_set_max_players",
    "Set the maximum player count for the current session.",
    {
      max_players: z.number().describe("Maximum number of players"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("multiplayer", "set_max_players", {
        max_players: params.max_players,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_test_multiplayer",
    "Launch a multiplayer PIE test with multiple players.",
    {
      num_players: z.number().default(2).describe("Number of players to simulate"),
      dedicated_server: z.boolean().default(false).describe("Use a dedicated server instance"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("multiplayer", "test_multiplayer", {
        num_players: params.num_players,
        dedicated_server: params.dedicated_server,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
