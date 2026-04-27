/**
 * UE Conduit — Animation Tools
 *
 * MCP tools for creating Animation Blueprints, montages, blend spaces,
 * and previewing animations in the editor.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerAnimationTools(server: any, ue5: UE5Client) {
  // --- Create Animation Blueprint ---
  server.tool(
    "ue5_create_anim_blueprint",
    "Create a new Animation Blueprint for a skeletal mesh. This drives the animation state machine for a character.",
    {
      name: z.string().describe("Anim Blueprint name (e.g., ABP_Player, ABP_Enemy_Crab)"),
      path: z.string().default("/Game/Animations/").describe("Content browser folder path"),
      skeleton: z.string().describe("Skeleton asset path (e.g., /Game/Characters/Mannequin/Skeleton)"),
      parent_class: z.string().default("AnimInstance").describe("Parent anim class (AnimInstance, LinkedAnimGraphBase, etc.)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("animation", "create_anim_blueprint", {
        name: params.name,
        path: params.path,
        skeleton: params.skeleton,
        parent_class: params.parent_class,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Create Montage ---
  server.tool(
    "ue5_create_montage",
    "Create an animation montage from one or more animation sequences. Montages are used for attacks, abilities, emotes.",
    {
      name: z.string().describe("Montage name (e.g., AM_Slash_01, AM_Dodge_Roll)"),
      path: z.string().default("/Game/Animations/Montages/").describe("Content browser folder path"),
      skeleton: z.string().describe("Skeleton asset path"),
      animations: z
        .array(z.string())
        .describe("Animation sequence paths to include as sections"),
      slot_name: z.string().default("DefaultSlot").describe("Montage slot name (e.g., DefaultSlot, UpperBody, FullBody)"),
      blend_in_time: z.number().default(0.25).describe("Blend in duration in seconds"),
      blend_out_time: z.number().default(0.25).describe("Blend out duration in seconds"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("animation", "create_montage", {
        name: params.name,
        path: params.path,
        skeleton: params.skeleton,
        animations: params.animations,
        slot_name: params.slot_name,
        blend_in_time: params.blend_in_time,
        blend_out_time: params.blend_out_time,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Create Blend Space ---
  server.tool(
    "ue5_create_blend_space",
    "Create a 1D or 2D blend space for blending between animations (e.g., idle/walk/run based on speed).",
    {
      name: z.string().describe("Blend space name (e.g., BS_Locomotion, BS1D_AimOffset)"),
      path: z.string().default("/Game/Animations/BlendSpaces/").describe("Content browser folder path"),
      skeleton: z.string().describe("Skeleton asset path"),
      dimensions: z.enum(["1D", "2D"]).default("2D").describe("1D or 2D blend space"),
      axis_x_name: z.string().default("Speed").describe("Horizontal axis parameter name"),
      axis_x_min: z.number().default(0).describe("Horizontal axis minimum value"),
      axis_x_max: z.number().default(600).describe("Horizontal axis maximum value"),
      axis_y_name: z.string().optional().describe("Vertical axis parameter name (2D only)"),
      axis_y_min: z.number().optional().describe("Vertical axis minimum value (2D only)"),
      axis_y_max: z.number().optional().describe("Vertical axis maximum value (2D only)"),
      samples: z
        .array(
          z.object({
            animation: z.string().describe("Animation sequence path"),
            x: z.number().describe("X axis value for this sample"),
            y: z.number().optional().describe("Y axis value for this sample (2D only)"),
          })
        )
        .optional()
        .describe("Animation samples to place in the blend space"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("animation", "create_blend_space", {
        name: params.name,
        path: params.path,
        skeleton: params.skeleton,
        dimensions: params.dimensions,
        axis_x: {
          name: params.axis_x_name,
          min: params.axis_x_min,
          max: params.axis_x_max,
        },
        axis_y: params.dimensions === "2D"
          ? {
              name: params.axis_y_name ?? "Direction",
              min: params.axis_y_min ?? -180,
              max: params.axis_y_max ?? 180,
            }
          : undefined,
        samples: params.samples ?? [],
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Play Animation Preview ---
  server.tool(
    "ue5_play_animation_preview",
    "Preview an animation sequence or montage on a skeletal mesh in the editor viewport.",
    {
      animation: z.string().describe("Animation sequence or montage asset path"),
      actor_label: z.string().optional().describe("Skeletal mesh actor to preview on (uses selected actor if not specified)"),
      playback_rate: z.number().default(1.0).describe("Playback speed multiplier"),
      looping: z.boolean().default(false).describe("Loop the animation"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("animation", "play_preview", {
        animation: params.animation,
        actor_label: params.actor_label ?? "",
        playback_rate: params.playback_rate,
        looping: params.looping,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
