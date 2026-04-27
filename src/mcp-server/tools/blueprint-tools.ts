/**
 * UE Conduit — Blueprint Tools
 *
 * MCP tools for creating and modifying Blueprints in UE5.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerBlueprintTools(server: any, ue5: UE5Client) {
  // --- Create Blueprint ---
  server.tool(
    "ue5_create_blueprint",
    "Create a new Blueprint class in UE5. Specify parent class and optional components.",
    {
      name: z.string().describe("Blueprint name (e.g., BP_Enemy_Crab)"),
      parent_class: z.string().describe("Parent class path (e.g., /Script/Engine.Actor, /Game/Blueprints/BP_EnemyBase)"),
      path: z.string().default("/Game/Blueprints/").describe("Content browser folder path"),
      components: z
        .array(
          z.object({
            type: z.string().describe("Component class (e.g., StaticMeshComponent, SphereComponent)"),
            name: z.string().describe("Component name"),
            properties: z.record(z.unknown()).optional().describe("Component properties"),
          })
        )
        .optional()
        .describe("Components to add to the Blueprint"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("blueprint", "create_blueprint", {
        name: params.name,
        parent_class: params.parent_class,
        path: params.path,
        components: params.components ?? [],
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Add Component to Blueprint ---
  server.tool(
    "ue5_add_component",
    "Add a component to an existing Blueprint.",
    {
      blueprint: z.string().describe("Blueprint path (e.g., /Game/Blueprints/BP_Enemy)"),
      component_type: z.string().describe("Component class name (e.g., StaticMeshComponent)"),
      component_name: z.string().describe("Name for the new component"),
      properties: z.record(z.unknown()).optional().describe("Properties to set on the component"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("blueprint", "add_component", {
        blueprint: params.blueprint,
        component_type: params.component_type,
        component_name: params.component_name,
        properties: params.properties ?? {},
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Add Variable to Blueprint ---
  server.tool(
    "ue5_add_variable",
    "Add a variable to a Blueprint.",
    {
      blueprint: z.string().describe("Blueprint path"),
      name: z.string().describe("Variable name (e.g., MaxHealth)"),
      type: z.string().describe("Variable type (bool, int, float, string, FVector, FRotator, UObject*)"),
      default_value: z.unknown().optional().describe("Default value"),
      expose_to_editor: z.boolean().default(true).describe("Show in Details panel when placed"),
      category: z.string().optional().describe("Category in Details panel"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("blueprint", "add_variable", {
        blueprint: params.blueprint,
        name: params.name,
        type: params.type,
        default_value: params.default_value,
        expose_to_editor: params.expose_to_editor,
        category: params.category ?? "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Compile Blueprint ---
  server.tool(
    "ue5_compile_blueprint",
    "Compile a Blueprint and return any errors.",
    {
      blueprint: z.string().describe("Blueprint path to compile"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("blueprint", "compile", {
        blueprint: params.blueprint,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- List Blueprints ---
  server.tool(
    "ue5_list_blueprints",
    "List all Blueprints in a content browser path.",
    {
      path: z.string().default("/Game/Blueprints/").describe("Content browser path to search"),
      recursive: z.boolean().default(true).describe("Include subdirectories"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("asset", "search", {
        path: params.path,
        type_filter: "Blueprint",
        recursive: params.recursive,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Get Blueprint Info ---
  server.tool(
    "ue5_get_blueprint_info",
    "Get detailed info about a Blueprint (variables, components, functions, parent class).",
    {
      blueprint: z.string().describe("Blueprint path"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("blueprint", "get_info", {
        blueprint: params.blueprint,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
