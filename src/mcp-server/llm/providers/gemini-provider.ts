/**
 * UE Conduit — Google Gemini LLM Provider
 *
 * Uses the @google/generative-ai npm package to communicate with Google's API.
 * Supports Gemini 2.5 Pro and Gemini 2.5 Flash models.
 * Features: tool use, vision, streaming.
 */

import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";
import type { LLMProvider, LLMModel, LLMCapabilities, LLMConfig } from "../types.js";

const GEMINI_MODELS: LLMModel[] = [
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    contextWindow: 1048576,
    supportsVision: true,
    supportsTools: true,
    costPer1kTokens: 0.00125,
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    contextWindow: 1048576,
    supportsVision: true,
    supportsTools: true,
    costPer1kTokens: 0.000075,
  },
];

export class GeminiProvider implements LLMProvider {
  readonly name = "Google Gemini";

  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private modelId: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: LLMConfig) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.modelId = config.model || "gemini-2.5-flash";
    this.temperature = config.temperature ?? 0.7;
    this.maxTokens = config.maxTokens ?? 4096;

    this.model = this.genAI.getGenerativeModel({
      model: this.modelId,
      systemInstruction: "You are an expert Unreal Engine 5 game developer assistant integrated into the UE Conduit editor plugin. Help the user with their game development tasks. Be concise and actionable.",
    });
  }

  async sendMessage(prompt: string, context?: string): Promise<string> {
    const fullPrompt = context ? `Context:\n${context}\n\nRequest:\n${prompt}` : prompt;

    const result = await this.model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: this.temperature,
        maxOutputTokens: this.maxTokens,
      },
    });

    return result.response.text();
  }

  async *streamMessage(prompt: string, context?: string): AsyncGenerator<string> {
    const fullPrompt = context ? `Context:\n${context}\n\nRequest:\n${prompt}` : prompt;

    const result = await this.model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: this.temperature,
        maxOutputTokens: this.maxTokens,
      },
    });

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  }

  async listModels(): Promise<LLMModel[]> {
    return GEMINI_MODELS;
  }

  getCapabilities(): LLMCapabilities {
    const activeModel = GEMINI_MODELS.find((m) => m.id === this.modelId);
    return {
      vision: activeModel?.supportsVision ?? true,
      toolUse: activeModel?.supportsTools ?? true,
      streaming: true,
      maxContextTokens: activeModel?.contextWindow ?? 1048576,
    };
  }
}
