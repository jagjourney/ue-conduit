/**
 * UE Conduit — xAI (Grok) LLM Provider
 *
 * Uses the OpenAI-compatible API format with xAI's base URL.
 * Supports Grok-2, Grok-3, and Grok-3-mini models.
 * Features: tool calling, streaming.
 */

import OpenAI from "openai";
import type { LLMProvider, LLMModel, LLMCapabilities, LLMConfig } from "../types.js";

const XAI_BASE_URL = "https://api.x.ai/v1";

const XAI_MODELS: LLMModel[] = [
  {
    id: "grok-3",
    name: "Grok 3",
    contextWindow: 131072,
    supportsVision: true,
    supportsTools: true,
    costPer1kTokens: 0.003,
  },
  {
    id: "grok-3-mini",
    name: "Grok 3 Mini",
    contextWindow: 131072,
    supportsVision: false,
    supportsTools: true,
    costPer1kTokens: 0.0005,
  },
  {
    id: "grok-2",
    name: "Grok 2",
    contextWindow: 131072,
    supportsVision: true,
    supportsTools: true,
    costPer1kTokens: 0.002,
  },
];

export class XAIProvider implements LLMProvider {
  readonly name = "xAI (Grok)";

  private client: OpenAI;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: LLMConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl || XAI_BASE_URL,
    });
    this.model = config.model || "grok-3";
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
    return XAI_MODELS;
  }

  getCapabilities(): LLMCapabilities {
    const activeModel = XAI_MODELS.find((m) => m.id === this.model);
    return {
      vision: activeModel?.supportsVision ?? false,
      toolUse: activeModel?.supportsTools ?? true,
      streaming: true,
      maxContextTokens: activeModel?.contextWindow ?? 131072,
    };
  }
}
