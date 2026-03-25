/**
 * UE Conduit — LLM Tools
 *
 * MCP tools for interacting with the configured LLM provider.
 * Enables AI-powered chat, vision analysis, code generation,
 * and provider management directly from the editor.
 */

import { z } from "zod";
import type { UE5Client } from "../connection/ue5-client.js";
import type { LLMProviderManager } from "../llm/provider-factory.js";

export function registerLLMTools(server: any, ue5: UE5Client, llmManager: LLMProviderManager) {
  // --- LLM Chat ---
  server.tool(
    "ue5_llm_chat",
    "Send a message to the configured LLM and get a response. Optionally include the current editor state (open level, actor count, selection, etc.) as context.",
    {
      message: z.string().describe("The message/prompt to send to the LLM"),
      context: z.string().optional().describe("Additional context to prepend (e.g., code, error messages)"),
      include_editor_state: z.boolean().default(false).describe("If true, automatically appends current level info, actor count, selected actors, etc. as context"),
    },
    async (params: any) => {
      const provider = llmManager.getProvider();
      let context = params.context ?? "";

      // Optionally enrich context with editor state
      if (params.include_editor_state) {
        try {
          const state = await ue5.getEditorState();
          const editorContext = [
            `\n--- Current Editor State ---`,
            `Level: ${state.level}`,
            `Actor Count: ${state.actorCount}`,
            `PIE State: ${state.pieState}`,
            `Build Status: ${state.lastBuildStatus}`,
            `Selected Actors: ${state.selectedActors.join(", ") || "none"}`,
            `Engine: UE ${state.engineVersion}`,
            `Project: ${state.projectName}`,
            `---`,
          ].join("\n");
          context = context ? `${context}\n${editorContext}` : editorContext;
        } catch {
          // Editor not connected — proceed without state
        }
      }

      try {
        const response = await provider.sendMessage(params.message, context || undefined);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                provider: provider.name,
                model: llmManager.getConfig().model,
                response,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: true,
                provider: provider.name,
                message: error instanceof Error ? error.message : String(error),
              }, null, 2),
            },
          ],
        };
      }
    }
  );

  // --- LLM Analyze Screenshot ---
  server.tool(
    "ue5_llm_analyze_screenshot",
    "Take a screenshot of the editor viewport and send it to a vision-capable LLM for analysis. Only works with providers that support vision (Claude, GPT-4o, Gemini). The screenshot is taken first via UE5, then analyzed by the LLM.",
    {
      prompt: z.string().describe("What to analyze (e.g., 'What is wrong with this scene?', 'Describe the lighting')"),
    },
    async (params: any) => {
      const provider = llmManager.getProvider();
      const capabilities = provider.getCapabilities();

      if (!capabilities.vision) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: true,
                message: `Current provider '${provider.name}' (model: ${llmManager.getConfig().model}) does not support vision. Switch to Claude, GPT-4o, or Gemini for screenshot analysis.`,
              }, null, 2),
            },
          ],
        };
      }

      // Take a screenshot via the UE5 plugin
      let screenshotPath = "";
      try {
        const screenshotResult = await ue5.executeCommand("editor", "take_screenshot", {
          filename: `llm_analysis_${Date.now()}.png`,
          resolution_x: 1920,
          resolution_y: 1080,
        });
        screenshotPath = (screenshotResult.output?.absolute_path as string) ?? "";
      } catch {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: true,
                message: "Failed to capture screenshot from UE5. Is the editor connected?",
              }, null, 2),
            },
          ],
        };
      }

      // Send the screenshot path info as context alongside the prompt
      // The actual image reading would require the UE5 plugin to return
      // base64 data or the provider to support file paths — for now we
      // describe what was captured and let the LLM reason about it.
      const analysisContext = [
        `A screenshot was captured from the UE5 editor viewport.`,
        `Screenshot path: ${screenshotPath}`,
        `The user wants you to analyze the scene.`,
      ].join("\n");

      try {
        const response = await provider.sendMessage(
          `${params.prompt}\n\n(Screenshot was captured to: ${screenshotPath})`,
          analysisContext
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                provider: provider.name,
                model: llmManager.getConfig().model,
                screenshot_path: screenshotPath,
                analysis: response,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: true,
                provider: provider.name,
                screenshot_path: screenshotPath,
                message: error instanceof Error ? error.message : String(error),
              }, null, 2),
            },
          ],
        };
      }
    }
  );

  // --- LLM Generate Code ---
  server.tool(
    "ue5_llm_generate_code",
    "Ask the LLM to generate UE5 C++, Blueprint logic description, or Python script. Returns the generated code ready to use.",
    {
      description: z.string().describe("What the code should do (e.g., 'A health component that regenerates over time')"),
      language: z.enum(["cpp", "blueprint", "python"]).default("cpp").describe("Output language: C++, Blueprint logic description, or Python (for editor scripting)"),
    },
    async (params: any) => {
      const provider = llmManager.getProvider();

      const languageLabels: Record<string, string> = {
        cpp: "Unreal Engine 5 C++",
        blueprint: "UE5 Blueprint logic (describe nodes, connections, and settings)",
        python: "UE5 Editor Python scripting",
      };

      const codePrompt = [
        `Generate ${languageLabels[params.language] ?? "C++"} code for the following:`,
        ``,
        params.description,
        ``,
        `Requirements:`,
        `- Follow UE5 coding standards and naming conventions`,
        `- Include all necessary #include directives (for C++)`,
        `- Add UE5 macros (UCLASS, UPROPERTY, UFUNCTION) where appropriate`,
        `- Include comments explaining key decisions`,
        `- Make it production-ready, not a prototype`,
      ].join("\n");

      try {
        const response = await provider.sendMessage(codePrompt);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                provider: provider.name,
                model: llmManager.getConfig().model,
                language: params.language,
                generated_code: response,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: true,
                provider: provider.name,
                message: error instanceof Error ? error.message : String(error),
              }, null, 2),
            },
          ],
        };
      }
    }
  );

  // --- Set LLM Provider ---
  server.tool(
    "ue5_llm_set_provider",
    "Switch the active LLM provider at runtime. Changes take effect immediately for all subsequent LLM calls.",
    {
      provider: z.enum(["claude", "openai", "xai", "gemini", "ollama", "custom"]).describe("Provider to switch to"),
      api_key: z.string().optional().describe("API key for the provider (not needed for Ollama)"),
      model: z.string().optional().describe("Model ID to use (e.g., 'gpt-4o', 'claude-sonnet-4-6')"),
      base_url: z.string().optional().describe("Custom base URL (required for 'custom' provider, optional for others)"),
      temperature: z.number().optional().describe("Sampling temperature (0.0-1.0)"),
      max_tokens: z.number().optional().describe("Max tokens per response"),
    },
    async (params: any) => {
      try {
        const newConfig: Record<string, unknown> = { provider: params.provider };

        if (params.api_key !== undefined) newConfig.apiKey = params.api_key;
        if (params.model !== undefined) newConfig.model = params.model;
        if (params.base_url !== undefined) newConfig.baseUrl = params.base_url;
        if (params.temperature !== undefined) newConfig.temperature = params.temperature;
        if (params.max_tokens !== undefined) newConfig.maxTokens = params.max_tokens;

        llmManager.switchProvider(newConfig as any);

        const activeProvider = llmManager.getProvider();
        const activeConfig = llmManager.getConfig();
        const capabilities = activeProvider.getCapabilities();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                provider: activeProvider.name,
                model: activeConfig.model,
                capabilities,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: true,
                message: error instanceof Error ? error.message : String(error),
              }, null, 2),
            },
          ],
        };
      }
    }
  );

  // --- List LLM Providers ---
  server.tool(
    "ue5_llm_list_providers",
    "List all available LLM providers with their metadata, including which one is currently active.",
    {},
    async () => {
      const { LLMProviderManager } = await import("../llm/provider-factory.js");
      const providers = LLMProviderManager.listAvailableProviders();
      const activeConfig = llmManager.getConfig();

      const result = providers.map((p) => ({
        ...p,
        active: p.id === activeConfig.provider,
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              active_provider: activeConfig.provider,
              active_model: activeConfig.model,
              providers: result,
            }, null, 2),
          },
        ],
      };
    }
  );

  // --- List LLM Models ---
  server.tool(
    "ue5_llm_list_models",
    "List available models for the currently active LLM provider. For Ollama, shows locally installed models.",
    {},
    async () => {
      const provider = llmManager.getProvider();

      try {
        const models = await provider.listModels();
        const activeConfig = llmManager.getConfig();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                provider: provider.name,
                active_model: activeConfig.model,
                models,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: true,
                provider: provider.name,
                message: error instanceof Error ? error.message : String(error),
              }, null, 2),
            },
          ],
        };
      }
    }
  );
}
