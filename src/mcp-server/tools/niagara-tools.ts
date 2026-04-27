/**
 * UE Conduit — Niagara Particle System Tools
 *
 * MCP tools for creating and configuring Niagara particle systems,
 * emitters, and their parameters.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerNiagaraTools(server: any, ue5: UE5Client) {
  // --- Create Niagara System ---
  server.tool(
    "ue5_create_niagara_system",
    "Create a Niagara particle system asset. Niagara systems can contain multiple emitters for complex effects (fire, magic, weather).",
    {
      name: z.string().describe("System name (e.g., NS_FireBall, NS_HealingAura, NS_Rain)"),
      path: z.string().default("/Game/Effects/").describe("Content browser folder path"),
      template: z
        .enum(["Empty", "Fountain", "Sprite", "Mesh", "Ribbon", "Audio", "Component"])
        .default("Empty")
        .describe("Starter template for the system"),
      auto_activate: z.boolean().default(true).describe("Auto-activate when spawned"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("niagara", "create_system", {
        name: params.name,
        path: params.path,
        template: params.template,
        auto_activate: params.auto_activate,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Set Niagara Parameter ---
  server.tool(
    "ue5_set_niagara_parameter",
    "Set a parameter on a Niagara system or emitter. Parameters control spawn rate, lifetime, color, size, velocity, etc.",
    {
      system: z.string().describe("Niagara system asset path (e.g., /Game/Effects/NS_FireBall)"),
      emitter_name: z.string().optional().describe("Emitter name within the system (omit for system-level parameter)"),
      module_name: z.string().describe("Module name (e.g., SpawnRate, InitializeParticle, SpriteSize, Color)"),
      parameter_name: z.string().describe("Parameter name within the module (e.g., SpawnRate, LifetimeMin, StartColor)"),
      value: z.unknown().describe("Parameter value (number, vector, color, etc.)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("niagara", "set_parameter", {
        system: params.system,
        emitter_name: params.emitter_name ?? "",
        module_name: params.module_name,
        parameter_name: params.parameter_name,
        value: params.value,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Create Niagara Emitter ---
  server.tool(
    "ue5_create_niagara_emitter",
    "Create a standalone Niagara emitter asset that can be added to multiple systems.",
    {
      name: z.string().describe("Emitter name (e.g., NE_Sparks, NE_Smoke_Trail)"),
      path: z.string().default("/Game/Effects/Emitters/").describe("Content browser folder path"),
      sim_target: z
        .enum(["CPUSim", "GPUComputeSim"])
        .default("CPUSim")
        .describe("Simulation target (CPU for small counts, GPU for thousands of particles)"),
      renderer: z
        .enum(["Sprite", "Mesh", "Ribbon", "Light", "Component"])
        .default("Sprite")
        .describe("Particle renderer type"),
      spawn_rate: z.number().optional().describe("Particles spawned per second"),
      lifetime_min: z.number().optional().describe("Minimum particle lifetime in seconds"),
      lifetime_max: z.number().optional().describe("Maximum particle lifetime in seconds"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("niagara", "create_emitter", {
        name: params.name,
        path: params.path,
        sim_target: params.sim_target,
        renderer: params.renderer,
        spawn_rate: params.spawn_rate,
        lifetime_min: params.lifetime_min,
        lifetime_max: params.lifetime_max,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Spawn Niagara Actor ---
  server.tool(
    "ue5_spawn_niagara_actor",
    "Spawn a Niagara system as an actor in the world. Use this to place particle effects (fire, smoke, magic auras, weather) at specific locations in the level.",
    {
      system_path: z.string().describe("Niagara system asset path (e.g., /Game/Effects/NS_FireBall)"),
      location: z.object({
        x: z.number().default(0),
        y: z.number().default(0),
        z: z.number().default(0),
      }).optional().describe("World location {x, y, z}"),
      rotation: z.object({
        pitch: z.number().default(0),
        yaw: z.number().default(0),
        roll: z.number().default(0),
      }).optional().describe("Rotation {pitch, yaw, roll}"),
      scale: z.object({
        x: z.number().default(1),
        y: z.number().default(1),
        z: z.number().default(1),
      }).optional().describe("Scale {x, y, z}"),
      label: z.string().optional().describe("Actor label in the outliner"),
      auto_activate: z.boolean().default(true).describe("Auto-activate the particle system"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("niagara", "spawn_niagara_actor", {
        system_path: params.system_path,
        location: params.location ?? { x: 0, y: 0, z: 0 },
        rotation: params.rotation ?? { pitch: 0, yaw: 0, roll: 0 },
        scale: params.scale ?? { x: 1, y: 1, z: 1 },
        label: params.label ?? "",
        auto_activate: params.auto_activate,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Set Niagara Variable ---
  server.tool(
    "ue5_set_niagara_variable",
    "Set a user variable on a Niagara component at runtime. Variables control particle behavior dynamically (color, size, speed, spawn rate).",
    {
      label: z.string().describe("Actor label of the Niagara actor"),
      variable_name: z.string().describe("Variable name (e.g., User.Color, User.SpawnRate, User.Size)"),
      type: z
        .enum(["float", "int", "bool", "vector", "color", "vec2", "vec4"])
        .default("float")
        .describe("Variable type"),
      value: z.unknown().describe("Variable value (number for float/int, {x,y,z} for vector, {r,g,b,a} for color)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("niagara", "set_niagara_variable", {
        label: params.label,
        variable_name: params.variable_name,
        type: params.type,
        value: params.value,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- List Niagara Systems ---
  server.tool(
    "ue5_list_niagara_systems",
    "List all Niagara system and emitter assets in the project.",
    {
      path: z.string().default("/Game/").describe("Content browser path to search"),
      recursive: z.boolean().default(true).describe("Include subdirectories"),
      type: z
        .enum(["all", "systems", "emitters"])
        .default("all")
        .describe("Filter by Niagara asset type"),
      limit: z.number().default(100).describe("Max results to return"),
    },
    async (params: any) => {
      const typeFilter =
        params.type === "systems"
          ? "NiagaraSystem"
          : params.type === "emitters"
          ? "NiagaraEmitter"
          : "Niagara";
      const result = await ue5.executeCommand("asset", "search", {
        path: params.path,
        type_filter: typeFilter,
        recursive: params.recursive,
        limit: params.limit,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
