/**
 * UE Conduit — Input Tools
 *
 * MCP tools for creating Enhanced Input Actions, Mapping Contexts,
 * and configuring key bindings.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerInputTools(server: any, ue5: UE5Client) {
  // --- Create Input Action ---
  server.tool(
    "ue5_create_input_action",
    "Create an Enhanced Input Action asset. Input Actions define abstract gameplay actions (Jump, Attack, Move) separate from physical keys.",
    {
      name: z.string().describe("Input action name (e.g., IA_Jump, IA_Move, IA_Attack)"),
      path: z.string().default("/Game/Input/Actions/").describe("Content browser folder path"),
      value_type: z
        .enum(["Digital", "Axis1D", "Axis2D", "Axis3D"])
        .default("Digital")
        .describe("Value type: Digital (bool), Axis1D (float), Axis2D (FVector2D), Axis3D (FVector)"),
      triggers: z
        .array(z.enum(["Pressed", "Released", "Down", "Tap", "Hold", "HoldAndRelease", "Pulse"]))
        .optional()
        .describe("Trigger types for this action"),
      consume_input: z.boolean().default(true).describe("Whether this action consumes the input"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("input", "create_input_action", {
        name: params.name,
        path: params.path,
        value_type: params.value_type,
        triggers: params.triggers ?? [],
        consume_input: params.consume_input,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Create Mapping Context ---
  server.tool(
    "ue5_create_mapping_context",
    "Create an Input Mapping Context asset. Mapping Contexts group related key bindings that can be enabled/disabled at runtime.",
    {
      name: z.string().describe("Mapping context name (e.g., IMC_Default, IMC_Combat, IMC_Menu)"),
      path: z.string().default("/Game/Input/").describe("Content browser folder path"),
      description: z.string().optional().describe("Human-readable description of when this context is active"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("input", "create_mapping_context", {
        name: params.name,
        path: params.path,
        description: params.description ?? "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Add Key Mapping ---
  server.tool(
    "ue5_add_key_mapping",
    "Add a key binding to a Mapping Context, linking a physical key/button to an Input Action.",
    {
      mapping_context: z.string().describe("Mapping Context asset path (e.g., /Game/Input/IMC_Default)"),
      input_action: z.string().describe("Input Action asset path (e.g., /Game/Input/Actions/IA_Jump)"),
      key: z.string().describe("Key name (e.g., SpaceBar, LeftMouseButton, Gamepad_FaceButton_Bottom, W, A, S, D)"),
      modifiers: z
        .array(z.enum(["Negate", "Swizzle", "DeadZone", "Scalar", "FOVScaling", "ResponseCurve", "Smooth"]))
        .optional()
        .describe("Input modifiers to apply"),
      modifier_params: z.record(z.unknown()).optional().describe("Parameters for modifiers (e.g., {scalar: 0.5, negate_x: true})"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("input", "add_key_mapping", {
        mapping_context: params.mapping_context,
        input_action: params.input_action,
        key: params.key,
        modifiers: params.modifiers ?? [],
        modifier_params: params.modifier_params ?? {},
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- List Input Actions ---
  server.tool(
    "ue5_list_input_actions",
    "List all Enhanced Input Action and Input Mapping Context assets in the project.",
    {
      path: z.string().default("/Game/").describe("Content browser path to search"),
      recursive: z.boolean().default(true).describe("Include subdirectories"),
      type: z
        .enum(["all", "actions", "contexts"])
        .default("all")
        .describe("Filter by asset type"),
    },
    async (params: any) => {
      const typeFilter =
        params.type === "actions"
          ? "InputAction"
          : params.type === "contexts"
          ? "InputMappingContext"
          : "";
      const result = await ue5.executeCommand("asset", "search", {
        path: params.path,
        type_filter: typeFilter,
        recursive: params.recursive,
        query: typeFilter === "" ? "IA_,IMC_" : "",
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
