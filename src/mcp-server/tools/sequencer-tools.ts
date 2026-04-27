/**
 * UE Conduit — Sequencer / Cinematics Tools
 *
 * MCP tools for creating and controlling Level Sequences, tracks, keyframes,
 * camera cuts, and rendering to video via Movie Render Queue.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

const Vector3 = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  z: z.number().default(0),
});

export function registerSequencerTools(server: any, ue5: UE5Client) {
  server.tool(
    "ue5_create_level_sequence",
    "Create a new LevelSequence asset for cinematics, cutscenes, or scripted events.",
    {
      name: z.string().describe("Sequence name (e.g., LS_Intro_Cutscene)"),
      path: z.string().default("/Game/Cinematics").describe("Content browser path"),
      frame_rate: z.number().default(30).describe("Display frame rate (24, 30, 60)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("sequencer", "create_level_sequence", {
        name: params.name,
        path: params.path,
        frame_rate: params.frame_rate,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_add_track",
    "Add a track to a LevelSequence (transform, animation, audio, camera, event).",
    {
      sequence_path: z.string().describe("Path to the LevelSequence asset"),
      track_type: z.enum(["transform", "animation", "audio", "camera_cut", "event"]).describe("Type of track to add"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("sequencer", "add_track", {
        sequence_path: params.sequence_path,
        track_type: params.track_type,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_add_keyframe",
    "Add a keyframe at a specific frame number in a sequence track.",
    {
      sequence_path: z.string().describe("Path to the LevelSequence asset"),
      frame: z.number().describe("Frame number for the keyframe"),
      track_index: z.number().default(0).describe("Track index"),
      value: z.number().default(0).describe("Value at this keyframe"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("sequencer", "add_keyframe", {
        sequence_path: params.sequence_path,
        frame: params.frame,
        track_index: params.track_index,
        value: params.value,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_set_sequence_length",
    "Set the playback range (duration) of a LevelSequence.",
    {
      sequence_path: z.string().describe("Path to the LevelSequence asset"),
      start_frame: z.number().default(0).describe("Start frame"),
      end_frame: z.number().describe("End frame"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("sequencer", "set_sequence_length", {
        sequence_path: params.sequence_path,
        start_frame: params.start_frame,
        end_frame: params.end_frame,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_play_sequence",
    "Play a LevelSequence in the editor viewport.",
    {
      sequence_path: z.string().describe("Path to the LevelSequence asset"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("sequencer", "play_sequence", {
        sequence_path: params.sequence_path,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_stop_sequence",
    "Stop all playing sequences in the editor.",
    {},
    async () => {
      const result = await ue5.executeCommand("sequencer", "stop_sequence", {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_render_sequence",
    "Render a LevelSequence to video using Movie Render Queue.",
    {
      sequence_path: z.string().describe("Path to the LevelSequence asset"),
      output_directory: z.string().optional().describe("Output directory for rendered video"),
      output_format: z.enum(["avi", "mp4", "png_sequence"]).default("avi").describe("Output format"),
      resolution_x: z.number().default(1920).describe("Horizontal resolution"),
      resolution_y: z.number().default(1080).describe("Vertical resolution"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("sequencer", "render_sequence", {
        sequence_path: params.sequence_path,
        output_directory: params.output_directory ?? "",
        output_format: params.output_format,
        resolution_x: params.resolution_x,
        resolution_y: params.resolution_y,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_add_camera_cut",
    "Add a camera cut track entry to switch between cameras during a sequence.",
    {
      sequence_path: z.string().describe("Path to the LevelSequence asset"),
      camera_label: z.string().describe("Actor label of the camera to cut to"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("sequencer", "add_camera_cut", {
        sequence_path: params.sequence_path,
        camera_label: params.camera_label,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
