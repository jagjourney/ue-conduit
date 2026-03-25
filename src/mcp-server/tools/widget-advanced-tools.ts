/**
 * UE Conduit — UI / UMG Advanced Tools
 *
 * MCP tools for creating HUD widgets, managing viewport widgets,
 * widget animations, event bindings, and styling.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";

export function registerWidgetAdvancedTools(server: any, ue5: UE5Client) {
  server.tool(
    "ue5_create_hud_widget",
    "Create a HUD Widget Blueprint for in-game UI (health bars, minimap, crosshair).",
    {
      name: z.string().default("WBP_HUD").describe("Widget Blueprint name"),
      path: z.string().default("/Game/UI/HUD").describe("Content browser path"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("widget_advanced", "create_hud_widget", {
        name: params.name,
        path: params.path,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_add_widget_to_viewport",
    "Add a widget to the game viewport at runtime.",
    {
      widget_path: z.string().describe("Widget Blueprint path"),
      z_order: z.number().default(0).describe("Z-order (higher = on top)"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("widget_advanced", "add_widget_to_viewport", {
        widget_path: params.widget_path,
        z_order: params.z_order,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_remove_widget_from_viewport",
    "Remove a widget from the game viewport.",
    {
      widget_path: z.string().describe("Widget Blueprint path to remove"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("widget_advanced", "remove_widget_from_viewport", {
        widget_path: params.widget_path,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_create_widget_animation",
    "Create a widget animation (fade in/out, slide, scale) on a Widget Blueprint.",
    {
      widget_path: z.string().describe("Widget Blueprint path"),
      animation_name: z.string().describe("Animation name (e.g., FadeIn, SlideFromLeft)"),
      duration: z.number().default(1.0).describe("Animation duration in seconds"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("widget_advanced", "create_widget_animation", {
        widget_path: params.widget_path,
        animation_name: params.animation_name,
        duration: params.duration,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_bind_widget_event",
    "Bind a widget event (button click, hover, etc.) to a Blueprint function.",
    {
      widget_path: z.string().describe("Widget Blueprint path"),
      widget_name: z.string().describe("Name of the widget element (e.g., StartButton)"),
      event_name: z.enum(["OnClicked", "OnHovered", "OnUnhovered", "OnPressed", "OnReleased"]).default("OnClicked").describe("Event to bind"),
      function_name: z.string().describe("Blueprint function name to call"),
    },
    async (params: any) => {
      const result = await ue5.executeCommand("widget_advanced", "bind_widget_event", {
        widget_path: params.widget_path,
        widget_name: params.widget_name,
        event_name: params.event_name,
        function_name: params.function_name,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "ue5_set_widget_style",
    "Set visual style properties on a widget element (font, color, size, alignment, opacity).",
    {
      widget_path: z.string().describe("Widget Blueprint path"),
      widget_name: z.string().describe("Name of the widget element"),
      font_family: z.string().optional().describe("Font family name"),
      font_size: z.number().optional().describe("Font size"),
      color: z.object({ r: z.number(), g: z.number(), b: z.number(), a: z.number().default(1) }).optional().describe("Color (RGBA 0-1)"),
      alignment: z.enum(["Left", "Center", "Right", "Fill"]).optional().describe("Horizontal alignment"),
      padding: z.number().optional().describe("Uniform padding"),
      visibility: z.enum(["Visible", "Hidden", "Collapsed"]).optional().describe("Widget visibility"),
      opacity: z.number().optional().describe("Render opacity (0-1)"),
    },
    async (params: any) => {
      const cmdParams: Record<string, unknown> = {
        widget_path: params.widget_path,
        widget_name: params.widget_name,
      };
      if (params.font_family) cmdParams.font_family = params.font_family;
      if (params.font_size !== undefined) cmdParams.font_size = params.font_size;
      if (params.color) cmdParams.color = params.color;
      if (params.alignment) cmdParams.alignment = params.alignment;
      if (params.padding !== undefined) cmdParams.padding = params.padding;
      if (params.visibility) cmdParams.visibility = params.visibility;
      if (params.opacity !== undefined) cmdParams.opacity = params.opacity;
      const result = await ue5.executeCommand("widget_advanced", "set_widget_style", cmdParams);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
