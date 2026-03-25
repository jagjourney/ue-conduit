/**
 * UE Conduit — PCG (Procedural Content Generation) Tools
 *
 * MCP tools for creating PCG graphs, spawning PCG volumes,
 * executing generation, and managing PCG parameters.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

const Vector3 = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  z: z.number().default(0),
});

export function registerPCGTools(server: any, ue5: UE5Client) {
  server.tool(
    "ue5_create_pcg_graph",
    "Create a new PCG graph asset for procedural content generation.",
    {
      name: z.string().describe("PCG graph name (e.g., PCG_ForestScatter)"),
      path: z.string().default("/Game/PCG").describe("Content browser path"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("pcg", "create_pcg_graph", {
        name: params.name,
        path: params.path,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_spawn_pcg_actor",
    "Spawn a PCG volume actor in the level and optionally assign a PCG graph.",
    {
      location: Vector3.optional().describe("World location"),
      label: z.string().optional().describe("Actor label"),
      graph_path: z.string().optional().describe("Path to PCG graph to assign"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("pcg", "spawn_pcg_actor", {
        location: params.location ?? { x: 0, y: 0, z: 0 },
        label: params.label ?? "",
        graph_path: params.graph_path ?? "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_execute_pcg_graph",
    "Execute a PCG graph on a PCG actor to generate content (meshes, foliage, etc.).",
    {
      label: z.string().describe("Actor label of the PCG volume"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("pcg", "execute_pcg_graph", {
        label: params.label,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_set_pcg_parameter",
    "Set a parameter value on a PCG actor's graph.",
    {
      label: z.string().describe("Actor label of the PCG volume"),
      parameter_name: z.string().describe("Parameter name"),
      value: z.number().describe("Parameter value"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("pcg", "set_pcg_parameter", {
        label: params.label,
        parameter_name: params.parameter_name,
        value: params.value,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_list_pcg_graphs",
    "List all PCG graph assets in the project.",
    {
      path: z.string().default("/Game").describe("Content browser path to search"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("pcg", "list_pcg_graphs", {
        path: params.path,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_clear_pcg_output",
    "Clear all generated content from a PCG actor.",
    {
      label: z.string().describe("Actor label of the PCG volume"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("pcg", "clear_pcg_output", {
        label: params.label,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
