/**
 * UE Conduit — Ollama LLM Provider
 *
 * Connects to a local Ollama instance (http://localhost:11434).
 * Supports any model installed on the user's machine (Llama 3, Mistral,
 * CodeLlama, DeepSeek, Qwen, etc.). Free, runs entirely on local hardware.
 *
 * Ollama exposes an OpenAI-compatible /v1/chat/completions endpoint
 * as well as its native /api endpoints. We use the native API for
 * maximum compatibility and model discovery.
 */

import type { LLMProvider, LLMModel, LLMCapabilities, LLMConfig } from "../types.js";

const DEFAULT_OLLAMA_URL = "http://localhost:11434";

interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  details?: {
    parameter_size?: string;
    family?: string;
  };
}

interface OllamaChatResponse {
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export class OllamaProvider implements LLMProvider {
  readonly name = "Ollama (Local)";

  private baseUrl: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: LLMConfig) {
    this.baseUrl = config.baseUrl || DEFAULT_OLLAMA_URL;
    this.model = config.model || "llama3.1";
    this.temperature = config.temperature ?? 0.7;
    this.maxTokens = config.maxTokens ?? 4096;
  }

  async sendMessage(prompt: string, context?: string): Promise<string> {
    const messages: Array<{ role: string; content: string }> = [
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

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: false,
        options: {
          temperature: this.temperature,
          num_predict: this.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Ollama request failed: ${response.status} ${response.statusText}. ` +
        `Is Ollama running at ${this.baseUrl}? Try: ollama serve`
      );
    }

    const data = (await response.json()) as OllamaChatResponse;
    return data.message?.content ?? "";
  }

  async *streamMessage(prompt: string, context?: string): AsyncGenerator<string> {
    const messages: Array<{ role: string; content: string }> = [
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

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: true,
        options: {
          temperature: this.temperature,
          num_predict: this.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Ollama streaming request failed: ${response.status} ${response.statusText}. ` +
        `Is Ollama running at ${this.baseUrl}? Try: ollama serve`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get response stream from Ollama");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Ollama streams newline-delimited JSON
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const chunk = JSON.parse(line) as OllamaChatResponse;
          if (chunk.message?.content) {
            yield chunk.message.content;
          }
        } catch {
          // Skip malformed lines
        }
      }
    }

    // Process remaining buffer
    if (buffer.trim()) {
      try {
        const chunk = JSON.parse(buffer) as OllamaChatResponse;
        if (chunk.message?.content) {
          yield chunk.message.content;
        }
      } catch {
        // Skip
      }
    }
  }

  async listModels(): Promise<LLMModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        return this.getDefaultModels();
      }

      const data = (await response.json()) as { models: OllamaModel[] };

      return (data.models ?? []).map((m) => ({
        id: m.name,
        name: m.name,
        contextWindow: this.estimateContextWindow(m),
        supportsVision: this.isVisionModel(m.name),
        supportsTools: false, // Most Ollama models don't support structured tool calling
        costPer1kTokens: 0, // Free — local hardware
      }));
    } catch {
      // Ollama not running — return common model names as suggestions
      return this.getDefaultModels();
    }
  }

  getCapabilities(): LLMCapabilities {
    return {
      vision: this.isVisionModel(this.model),
      toolUse: false,
      streaming: true,
      maxContextTokens: 128000, // Varies by model; safe default
    };
  }

  private isVisionModel(modelName: string): boolean {
    const lower = modelName.toLowerCase();
    return lower.includes("llava") || lower.includes("bakllava") || lower.includes("vision");
  }

  private estimateContextWindow(model: OllamaModel): number {
    // Rough estimates based on model family
    const name = model.name.toLowerCase();
    if (name.includes("llama3") || name.includes("llama-3")) return 128000;
    if (name.includes("mistral")) return 32768;
    if (name.includes("codellama")) return 16384;
    if (name.includes("deepseek")) return 128000;
    if (name.includes("qwen")) return 131072;
    return 8192; // Conservative default
  }

  private getDefaultModels(): LLMModel[] {
    return [
      { id: "llama3.1", name: "Llama 3.1", contextWindow: 128000, supportsVision: false, supportsTools: false, costPer1kTokens: 0 },
      { id: "llama3.2", name: "Llama 3.2", contextWindow: 128000, supportsVision: false, supportsTools: false, costPer1kTokens: 0 },
      { id: "mistral", name: "Mistral", contextWindow: 32768, supportsVision: false, supportsTools: false, costPer1kTokens: 0 },
      { id: "codellama", name: "CodeLlama", contextWindow: 16384, supportsVision: false, supportsTools: false, costPer1kTokens: 0 },
      { id: "deepseek-coder-v2", name: "DeepSeek Coder v2", contextWindow: 128000, supportsVision: false, supportsTools: false, costPer1kTokens: 0 },
      { id: "qwen2.5-coder", name: "Qwen 2.5 Coder", contextWindow: 131072, supportsVision: false, supportsTools: false, costPer1kTokens: 0 },
      { id: "llava", name: "LLaVA (Vision)", contextWindow: 4096, supportsVision: true, supportsTools: false, costPer1kTokens: 0 },
    ];
  }
}
