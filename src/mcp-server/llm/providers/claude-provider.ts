/**
 * UE Conduit — Claude (Anthropic) LLM Provider
 *
 * Uses the @anthropic-ai/sdk package to communicate with Anthropic's API.
 * Supports Claude Opus 4, Sonnet 4, and Haiku models.
 * Features: tool use, vision (screenshot analysis), streaming.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { LLMProvider, LLMModel, LLMCapabilities, LLMConfig } from "../types.js";

const CLAUDE_MODELS: LLMModel[] = [
  {
    id: "claude-opus-4-6",
    name: "Claude Opus 4",
    contextWindow: 200000,
    supportsVision: true,
    supportsTools: true,
    costPer1kTokens: 0.015,
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4",
    contextWindow: 200000,
    supportsVision: true,
    supportsTools: true,
    costPer1kTokens: 0.003,
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    contextWindow: 200000,
    supportsVision: true,
    supportsTools: true,
    costPer1kTokens: 0.00025,
  },
];

export class ClaudeProvider implements LLMProvider {
  readonly name = "Claude";

  private client: Anthropic;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: LLMConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
    this.model = config.model || "claude-sonnet-4-6";
    this.temperature = config.temperature ?? 0.7;
    this.maxTokens = config.maxTokens ?? 4096;
  }

  async sendMessage(prompt: string, context?: string): Promise<string> {
    const messages: Anthropic.MessageParam[] = [];

    if (context) {
      messages.push({ role: "user", content: context });
      messages.push({ role: "assistant", content: "Understood. I have the context." });
    }

    messages.push({ role: "user", content: prompt });

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      system: "You are an expert Unreal Engine 5 game developer assistant integrated into the UE Conduit editor plugin. Help the user with their game development tasks. Be concise and actionable.",
      messages,
    });

    // Extract text from content blocks
    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === "text"
    );
    return textBlocks.map((b) => b.text).join("");
  }

  async *streamMessage(prompt: string, context?: string): AsyncGenerator<string> {
    const messages: Anthropic.MessageParam[] = [];

    if (context) {
      messages.push({ role: "user", content: context });
      messages.push({ role: "assistant", content: "Understood. I have the context." });
    }

    messages.push({ role: "user", content: prompt });

    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      system: "You are an expert Unreal Engine 5 game developer assistant integrated into the UE Conduit editor plugin. Help the user with their game development tasks. Be concise and actionable.",
      messages,
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
  }

  async listModels(): Promise<LLMModel[]> {
    return CLAUDE_MODELS;
  }

  getCapabilities(): LLMCapabilities {
    const activeModel = CLAUDE_MODELS.find((m) => m.id === this.model);
    return {
      vision: activeModel?.supportsVision ?? true,
      toolUse: activeModel?.supportsTools ?? true,
      streaming: true,
      maxContextTokens: activeModel?.contextWindow ?? 200000,
    };
  }
}
