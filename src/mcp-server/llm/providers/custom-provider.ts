/**
 * UE Conduit — Custom (OpenAI-compatible) LLM Provider
 *
 * Generic provider that works with any API implementing the OpenAI
 * chat completions format. Compatible with Together.ai, Groq, Fireworks,
 * Anyscale, vLLM, LM Studio, and many others.
 *
 * Users configure base_url, api_key, and model via environment variables
 * or in-editor settings.
 */

import OpenAI from "openai";
import type { LLMProvider, LLMModel, LLMCapabilities, LLMConfig } from "../types.js";

export class CustomProvider implements LLMProvider {
  readonly name = "Custom (OpenAI-compatible)";

  private client: OpenAI;
  private model: string;
  private temperature: number;
  private maxTokens: number;
  private baseUrl: string;

  constructor(config: LLMConfig) {
    if (!config.baseUrl) {
      throw new Error(
        "Custom provider requires LLM_BASE_URL to be set. " +
        "Provide the base URL of your OpenAI-compatible API endpoint."
      );
    }

    this.baseUrl = config.baseUrl;
    this.client = new OpenAI({
      apiKey: config.apiKey || "not-required",
      baseURL: config.baseUrl,
    });
    this.model = config.model || "default";
    this.temperature = config.temperature ?? 0.7;
    this.maxTokens = config.maxTokens ?? 4096;
  }

  async sendMessage(prompt: string, context?: string): Promise<string> {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: "You are an expert Unreal Engine 5 game developer assistant integrated into the UE Conduit editor plugin. Help the user with their game development tasks. Be concise and actionable.",
      },
    ];

    if (context) {
      messages.push({ role: "user", content: context });
      messages.push({ role: "assistant", content: "Understood. I have the context." });
    }

    messages.push({ role: "user", content: prompt });

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
    });

    return response.choices[0]?.message?.content ?? "";
  }

  async *streamMessage(prompt: string, context?: string): AsyncGenerator<string> {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: "You are an expert Unreal Engine 5 game developer assistant integrated into the UE Conduit editor plugin. Help the user with their game development tasks. Be concise and actionable.",
      },
    ];

    if (context) {
      messages.push({ role: "user", content: context });
      messages.push({ role: "assistant", content: "Understood. I have the context." });
    }

    messages.push({ role: "user", content: prompt });

    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield delta;
      }
    }
  }

  async listModels(): Promise<LLMModel[]> {
    // Try to query the /models endpoint if available
    try {
      const models = await this.client.models.list();
      const result: LLMModel[] = [];

      for await (const model of models) {
        result.push({
          id: model.id,
          name: model.id,
          contextWindow: 0, // Unknown for custom providers
          supportsVision: false,
          supportsTools: false,
        });
      }

      return result;
    } catch {
      // Endpoint not available — return the configured model only
      return [
        {
          id: this.model,
          name: `${this.model} (configured)`,
          contextWindow: 0,
          supportsVision: false,
          supportsTools: false,
        },
      ];
    }
  }

  getCapabilities(): LLMCapabilities {
    return {
      vision: false, // Unknown for custom providers; assume no
      toolUse: false,
      streaming: true,
      maxContextTokens: 0, // Unknown
    };
  }
}
