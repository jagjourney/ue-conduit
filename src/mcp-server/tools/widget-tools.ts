/**
 * UE Conduit — Widget (UMG) Tools
 *
 * MCP tools for creating and editing UMG Widget Blueprints, adding child widgets,
 * setting properties, and binding data.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerWidgetTools(server: any, ue5: UE5Client) {
  // --- Create Widget Blueprint ---
  server.tool(
    "ue5_create_widget",
    "Create a new UMG Widget Blueprint. This creates a UserWidget that can be designed in the Widget Editor.",
    {
      name: z.string().describe("Widget name (e.g., WBP_HUD_Main, WBP_Inventory)"),
      path: z.string().default("/Game/UI/").describe("Content browser folder path"),
      parent_class: z.string().default("UserWidget").describe("Parent widget class (UserWidget, ActivatableWidget, etc.)"),
      root_widget: z
        .enum(["CanvasPanel", "Overlay", "VerticalBox", "HorizontalBox", "GridPanel", "SizeBox"])
        .default("CanvasPanel")
        .describe("Root container widget type"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("widget", "create_widget", {
        name: params.name,
        path: params.path,
        parent_class: params.parent_class,
        root_widget: params.root_widget,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Add Widget Child ---
  server.tool(
    "ue5_add_widget_child",
    "Add a child widget to an existing Widget Blueprint. Supports text blocks, images, buttons, progress bars, and more.",
    {
      widget_blueprint: z.string().describe("Widget Blueprint path (e.g., /Game/UI/WBP_HUD_Main)"),
      parent_slot: z.string().optional().describe("Name of the parent slot/widget to add into (defaults to root)"),
      widget_type: z
        .enum([
          "TextBlock",
          "Image",
          "Button",
          "ProgressBar",
          "Slider",
          "CheckBox",
          "EditableText",
          "RichTextBlock",
          "Border",
          "CanvasPanel",
          "VerticalBox",
          "HorizontalBox",
          "GridPanel",
          "ScrollBox",
          "SizeBox",
          "Overlay",
          "Spacer",
          "CircularThrobber",
        ])
        .describe("Type of widget to add"),
      name: z.string().describe("Name for the new widget element"),
      properties: z.record(z.unknown()).optional().describe("Properties to set on the widget (text, color, size, etc.)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("widget", "add_child", {
        widget_blueprint: params.widget_blueprint,
        parent_slot: params.parent_slot ?? "Root",
        widget_type: params.widget_type,
        name: params.name,
        properties: params.properties ?? {},
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Set Widget Property ---
  server.tool(
    "ue5_set_widget_property",
    "Set any property on a widget element (text, color, size, anchors, alignment, visibility, etc.).",
    {
      widget_blueprint: z.string().describe("Widget Blueprint path"),
      widget_name: z.string().describe("Name of the widget element to modify"),
      property_path: z.string().describe("Property to set (e.g., Text, ColorAndOpacity, Visibility, RenderTransform.Translation)"),
      value: z.unknown().describe("The value to set"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("widget", "set_property", {
        widget_blueprint: params.widget_blueprint,
        widget_name: params.widget_name,
        property_path: params.property_path,
        value: params.value,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Set Widget Binding ---
  server.tool(
    "ue5_set_widget_binding",
    "Bind a widget property to a Blueprint variable or function for dynamic updates (e.g., bind Text to a GetHealthText function).",
    {
      widget_blueprint: z.string().describe("Widget Blueprint path"),
      widget_name: z.string().describe("Name of the widget element"),
      property_name: z.string().describe("Property to bind (e.g., Text, Percent, Visibility, ColorAndOpacity)"),
      binding_type: z
        .enum(["variable", "function"])
        .describe("Bind to a variable or a function"),
      binding_name: z.string().describe("Variable or function name to bind to"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("widget", "set_binding", {
        widget_blueprint: params.widget_blueprint,
        widget_name: params.widget_name,
        property_name: params.property_name,
        binding_type: params.binding_type,
        binding_name: params.binding_name,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- List Widgets ---
  server.tool(
    "ue5_list_widgets",
    "List all Widget Blueprints in the project or a specific folder.",
    {
      path: z.string().default("/Game/").describe("Content browser path to search"),
      recursive: z.boolean().default(true).describe("Include subdirectories"),
      limit: z.number().default(100).describe("Max results to return"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("asset", "search", {
        path: params.path,
        type_filter: "WidgetBlueprint",
        recursive: params.recursive,
        limit: params.limit,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
