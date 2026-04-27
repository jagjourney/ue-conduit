/**
 * UE Conduit — Audio / Sound Tools
 *
 * MCP tools for spawning ambient sounds, configuring audio properties,
 * creating reverb volumes, and searching sound assets.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

const Vector3 = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  z: z.number().default(0),
});

export function registerAudioTools(server: any, ue5: UE5Client) {
  // --- Spawn Ambient Sound ---
  server.tool(
    "ue5_spawn_ambient_sound",
    "Spawn an AmbientSound actor in the world with a SoundCue or SoundWave. Use for environmental audio (wind, water, birds, fire crackling).",
    {
      sound_path: z.string().describe("Asset path to SoundCue or SoundWave (e.g., /Game/Audio/Ambient/SC_ForestWind)"),
      location: Vector3.optional().describe("World location {x, y, z}"),
      label: z.string().optional().describe("Actor label in the outliner"),
      volume: z.number().default(1).describe("Volume multiplier (0-2, default 1)"),
      pitch: z.number().default(1).describe("Pitch multiplier (0.5-2, default 1)"),
      auto_activate: z.boolean().default(true).describe("Auto-play when level loads"),
      attenuation_path: z.string().optional().describe("Sound attenuation settings asset path"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("audio", "spawn_ambient_sound", {
        sound_path: params.sound_path,
        location: params.location ?? { x: 0, y: 0, z: 0 },
        label: params.label ?? "",
        volume: params.volume,
        pitch: params.pitch,
        auto_activate: params.auto_activate,
        attenuation_path: params.attenuation_path ?? "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Set Sound Properties ---
  server.tool(
    "ue5_set_sound_properties",
    "Set audio properties on an actor with an AudioComponent (volume, pitch, attenuation, spatialization).",
    {
      label: z.string().describe("Actor label with AudioComponent"),
      volume: z.number().optional().describe("Volume multiplier"),
      pitch: z.number().optional().describe("Pitch multiplier"),
      auto_activate: z.boolean().optional().describe("Auto-play when level loads"),
      sound_path: z.string().optional().describe("New sound asset path"),
      attenuation_path: z.string().optional().describe("Sound attenuation settings asset path"),
      inner_radius: z.number().optional().describe("Inner radius for attenuation (cm)"),
      outer_radius: z.number().optional().describe("Outer radius for attenuation (cm)"),
      is_ui_sound: z.boolean().optional().describe("If true, plays without spatialization"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = { label: params.label };
      for (const key of Object.keys(params)) {
        if (key !== "label" && params[key] !== undefined) {
          cmdParams[key] = params[key];
        }
      }
      const result = await ue5.executeCommand("audio", "set_sound_properties", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Spawn Audio Volume ---
  server.tool(
    "ue5_spawn_audio_volume",
    "Create an AudioVolume actor for reverb effects and audio zone control.",
    {
      label: z.string().optional().describe("Actor label"),
      location: Vector3.optional().describe("World location"),
      extent: Vector3.optional().describe("Volume extent (default 500x500x500)"),
      priority: z.number().default(0).describe("Volume priority"),
      reverb_path: z.string().optional().describe("ReverbEffect asset path"),
      reverb_volume: z.number().default(1).describe("Reverb volume (0-1)"),
      reverb_fade_time: z.number().default(0.5).describe("Fade time when entering/exiting volume"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("audio", "spawn_audio_volume", {
        label: params.label ?? "",
        location: params.location ?? { x: 0, y: 0, z: 0 },
        extent: params.extent,
        priority: params.priority,
        reverb_path: params.reverb_path ?? "",
        reverb_volume: params.reverb_volume,
        reverb_fade_time: params.reverb_fade_time,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- List Sound Assets ---
  server.tool(
    "ue5_list_sound_assets",
    "List available SoundCue and SoundWave assets in the project.",
    {
      path: z.string().default("/Game/").describe("Content browser path to search"),
      type: z.enum(["all", "cue", "wave"]).default("all").describe("Filter by sound type"),
      max_results: z.number().default(200).describe("Maximum results to return"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("audio", "list_sound_assets", {
        path: params.path,
        type: params.type === "all" ? "" : params.type,
        max_results: params.max_results,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
