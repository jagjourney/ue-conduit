/**
 * UE Conduit — Dialogue / Story Tools
 *
 * MCP tools for creating dialogue waves, voices, subtitles,
 * and managing dialogue assets for narrative systems.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerDialogueTools(server: any, ue5: UE5Client) {
  server.tool(
    "ue5_create_dialogue_wave",
    "Create a DialogueWave asset containing spoken text and optional audio.",
    {
      name: z.string().describe("Dialogue wave name (e.g., DW_NPC_Greeting_01)"),
      path: z.string().default("/Game/Audio/Dialogue").describe("Content browser path"),
      spoken_text: z.string().optional().describe("The spoken dialogue text"),
      subtitle_override: z.string().optional().describe("Custom subtitle text (if different from spoken)"),
      mature: z.boolean().default(false).describe("Flag as mature content"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("dialogue", "create_dialogue_wave", {
        name: params.name,
        path: params.path,
        spoken_text: params.spoken_text ?? "",
        subtitle_override: params.subtitle_override ?? "",
        mature: params.mature,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_dialogue_voice",
    "Create a DialogueVoice asset representing a speaker identity (gender, plurality).",
    {
      name: z.string().describe("Voice name (e.g., DV_Warrior_Male)"),
      path: z.string().default("/Game/Audio/Dialogue/Voices").describe("Content browser path"),
      gender: z.enum(["male", "female", "neuter"]).default("male").describe("Grammatical gender"),
      plurality: z.enum(["singular", "plural"]).default("singular").describe("Grammatical number"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("dialogue", "create_dialogue_voice", {
        name: params.name,
        path: params.path,
        gender: params.gender,
        plurality: params.plurality,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_play_dialogue",
    "Play a DialogueWave in the editor for preview.",
    {
      dialogue_path: z.string().describe("Path to the DialogueWave asset"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("dialogue", "play_dialogue", {
        dialogue_path: params.dialogue_path,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_subtitle",
    "Set subtitle text on an existing DialogueWave.",
    {
      dialogue_path: z.string().describe("Path to the DialogueWave asset"),
      subtitle_text: z.string().describe("Subtitle text to display"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("dialogue", "create_subtitle", {
        dialogue_path: params.dialogue_path,
        subtitle_text: params.subtitle_text,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_list_dialogue_assets",
    "List all DialogueWave and DialogueVoice assets in the project.",
    {
      path: z.string().default("/Game").describe("Content browser path to search"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("dialogue", "list_dialogue_assets", {
        path: params.path,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
