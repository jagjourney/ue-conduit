/**
 * UE Conduit — World Partition Tools
 *
 * MCP tools for managing World Partition regions, data layers,
 * and streaming configuration in large open-world levels.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

const Vector3 = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  z: z.number().default(0),
});

export function registerWorldPartitionTools(server: any, ue5: UE5Client) {
  server.tool(
    "ue5_get_world_partition_info",
    "Get World Partition grid info and streaming status for the current level.",
    {},
    async () => {
      const result = await ue5.executeCommand("world_partition", "get_world_partition_info", {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_load_region",
    "Load a World Partition region by bounding box coordinates.",
    {
      min: Vector3.describe("Minimum corner of the region box"),
      max: Vector3.describe("Maximum corner of the region box"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("world_partition", "load_region", {
        min: params.min,
        max: params.max,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_unload_region",
    "Unload a World Partition region to free memory.",
    {
      min: Vector3.optional().describe("Minimum corner of the region box"),
      max: Vector3.optional().describe("Maximum corner of the region box"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("world_partition", "unload_region", {
        min: params.min ?? { x: 0, y: 0, z: 0 },
        max: params.max ?? { x: 0, y: 0, z: 0 },
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_data_layer",
    "Create a new data layer for organizing actors in World Partition.",
    {
      name: z.string().describe("Data layer name (e.g., Gameplay, Audio, Debug)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("world_partition", "create_data_layer", {
        name: params.name,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_set_actor_data_layer",
    "Assign an actor to a specific data layer.",
    {
      label: z.string().describe("Actor label"),
      data_layer: z.string().describe("Data layer name to assign the actor to"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("world_partition", "set_actor_data_layer", {
        label: params.label,
        data_layer: params.data_layer,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
