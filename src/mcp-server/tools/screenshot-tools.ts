/**
 * UE Conduit — Screenshot & Viewport Tools
 *
 * Enhanced screenshot and viewport camera control tools.
 * Enables Claude to SEE the world by capturing viewport images
 * and controlling the camera programmatically.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

const Vector3 = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  z: z.number().default(0),
});

const Rotator = z.object({
  pitch: z.number().default(0),
  yaw: z.number().default(0),
  roll: z.number().default(0),
});

export function registerScreenshotTools(server: any, ue5: UE5Client) {
  // --- Take Screenshot ---
  server.tool(
    "ue5_take_screenshot",
    "Capture a screenshot of the editor viewport. Optionally move/orient the camera first. Returns the absolute file path to the saved PNG. Use this to visually inspect the world.",
    {
      filename: z.string().optional().describe("Output filename (auto-generated with timestamp if omitted)"),
      resolution_x: z.number().optional().default(1920).describe("Screenshot width in pixels"),
      resolution_y: z.number().optional().default(1080).describe("Screenshot height in pixels"),
      camera_location: Vector3.optional().describe("Move camera to this location before capturing"),
      camera_rotation: Rotator.optional().describe("Set camera rotation before capturing"),
      look_at: Vector3.optional().describe("Point the camera at this world location before capturing"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = {
        filename: params.filename ?? "",
        resolution_x: params.resolution_x ?? 1920,
        resolution_y: params.resolution_y ?? 1080,
      };

      if (params.camera_location) cmdParams.camera_location = params.camera_location;
      if (params.camera_rotation) cmdParams.camera_rotation = params.camera_rotation;
      if (params.look_at) cmdParams.look_at = params.look_at;

      const result = await ue5.executeCommand("editor", "take_screenshot", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Set Camera with Look-At ---
  server.tool(
    "ue5_set_viewport_camera",
    "Move the editor viewport camera to a location and optionally point it at a target. More powerful than ue5_focus_viewport — supports look_at targeting.",
    {
      location: Vector3.optional().describe("Camera world position"),
      rotation: Rotator.optional().describe("Camera rotation (ignored if look_at is provided)"),
      look_at: Vector3.optional().describe("Point the camera at this world location"),
      fov: z.number().optional().describe("Field of view in degrees"),
      speed: z.number().optional().describe("Camera movement speed setting"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = {};
      if (params.location) cmdParams.location = params.location;
      if (params.rotation) cmdParams.rotation = params.rotation;
      if (params.look_at) cmdParams.look_at = params.look_at;
      if (params.fov !== undefined) cmdParams.fov = params.fov;
      if (params.speed !== undefined) cmdParams.speed = params.speed;

      const result = await ue5.executeCommand("editor", "set_camera", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Get Camera ---
  server.tool(
    "ue5_get_viewport_camera",
    "Get the current editor viewport camera position, rotation, and field of view.",
    {},
    async () => {
      const result = await ue5.executeCommand("editor", "get_camera", {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
