/**
 * UE Conduit — OpenAI LLM Provider
 *
 * Uses the openai npm package to communicate with OpenAI's API.
 * Supports GPT-4o, GPT-4-turbo, GPT-4o-mini, o1, and o3 models.
 * Features: tool/function calling, vision (GPT-4o), streaming.
 */

import OpenAI from "openai";
import type { LLMProvider, LLMModel, LLMCapabilities, LLMConfig } from "../types.js";

const OPENAI_MODELS: LLMModel[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    contextWindow: 128000,
    supportsVision: true,
    supportsTools: true,
    costPer1kTokens: 0.005,
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    contextWindow: 128000,
    supportsVision: true,
    supportsTools: true,
    costPer1kTokens: 0.01,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    contextWindow: 128000,
    supportsVision: true,
    supportsTools: true,
    costPer1kTokens: 0.00015,
  },
  {
    id: "o1-preview",
    name: "o1 Preview",
    contextWindow: 128000,
    supportsVision: false,
    supportsTools: false,
    costPer1kTokens: 0.015,
  },
  {
    id: "o3-mini",
    name: "o3 Mini",
    contextWindow: 200000,
    supportsVision: false,
    supportsTools: true,
    costPer1kTokens: 0.0011,
  },
];

export class OpenAIProvider implements LLMProvider {
  readonly name = "OpenAI";

  private client: OpenAI;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: LLMConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl || undefined,
    });
    this.model = config.model || "gpt-4o";
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
    return OPENAI_MODELS;
  }

  getCapabilities(): LLMCapabilities {
    const activeModel = OPENAI_MODELS.find((m) => m.id === this.model);
    return {
      vision: activeModel?.supportsVision ?? false,
      toolUse: activeModel?.supportsTools ?? true,
      streaming: true,
      maxContextTokens: activeModel?.contextWindow ?? 128000,
    };
  }
}
