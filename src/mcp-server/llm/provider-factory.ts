/**
 * UE Conduit — LLM Provider Factory
 *
 * Creates the correct LLM provider based on configuration.
 * Reads LLM_PROVIDER, LLM_API_KEY, LLM_MODEL from the environment
 * and instantiates the matching provider class.
 */

import type { LLMConfig, LLMProvider } from "./types.js";
import { ClaudeProvider } from "./providers/claude-provider.js";
import { OpenAIProvider } from "./providers/openai-provider.js";
import { XAIProvider } from "./providers/xai-provider.js";
import { GeminiProvider } from "./providers/gemini-provider.js";
import { OllamaProvider } from "./providers/ollama-provider.js";
import { CustomProvider } from "./providers/custom-provider.js";

/**
 * Build an LLMConfig from environment variables.
 */
export function loadLLMConfig(): LLMConfig {
  return {
    provider: (process.env.LLM_PROVIDER ?? "claude") as LLMConfig["provider"],
    apiKey: process.env.LLM_API_KEY ?? process.env.ANTHROPIC_API_KEY ?? "",
    model: process.env.LLM_MODEL ?? "claude-sonnet-4-6",
    baseUrl: process.env.LLM_BASE_URL ?? "",
    temperature: parseFloat(process.env.LLM_TEMPERATURE ?? "0.7"),
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS ?? "4096", 10),
  };
}

/**
 * Create an LLMProvider instance from the given config.
 */
export function createProvider(config: LLMConfig): LLMProvider {
  switch (config.provider) {
    case "claude":
      return new ClaudeProvider(config);
    case "openai":
      return new OpenAIProvider(config);
    case "xai":
      return new XAIProvider(config);
    case "gemini":
      return new GeminiProvider(config);
    case "ollama":
      return new OllamaProvider(config);
    case "custom":
      return new CustomProvider(config);
    default:
      throw new Error(
        `Unknown LLM provider: '${config.provider}'. ` +
        `Valid providers: claude, openai, xai, gemini, ollama, custom`
      );
  }
}

/**
 * Singleton manager — holds the active provider and allows hot-swapping.
 */
export class LLMProviderManager {
  private config: LLMConfig;
  private provider: LLMProvider;

  constructor(config?: LLMConfig) {
    this.config = config ?? loadLLMConfig();
    this.provider = createProvider(this.config);
  }

  /** Get the currently active provider. */
  getProvider(): LLMProvider {
    return this.provider;
  }

  /** Get the current configuration. */
  getConfig(): LLMConfig {
    return { ...this.config };
  }

  /**
   * Switch to a different provider at runtime.
   * Called from the ue5_llm_set_provider MCP tool or in-editor settings.
   */
  switchProvider(newConfig: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.provider = createProvider(this.config);
  }

  /** List metadata about all available providers. */
  static listAvailableProviders(): Array<{
    id: LLMConfig["provider"];
    name: string;
    requiresApiKey: boolean;
    defaultBaseUrl: string;
  }> {
    return [
      {
        id: "claude",
        name: "Anthropic Claude",
        requiresApiKey: true,
        defaultBaseUrl: "https://api.anthropic.com",
      },
      {
        id: "openai",
        name: "OpenAI",
        requiresApiKey: true,
        defaultBaseUrl: "https://api.openai.com/v1",
      },
      {
        id: "xai",
        name: "xAI (Grok)",
        requiresApiKey: true,
        defaultBaseUrl: "https://api.x.ai/v1",
      },
      {
        id: "gemini",
        name: "Google Gemini",
        requiresApiKey: true,
        defaultBaseUrl: "https://generativelanguage.googleapis.com",
      },
      {
        id: "ollama",
        name: "Ollama (Local)",
        requiresApiKey: false,
        defaultBaseUrl: "http://localhost:11434",
      },
      {
        id: "custom",
        name: "Custom (OpenAI-compatible)",
        requiresApiKey: true,
        defaultBaseUrl: "",
      },
    ];
  }
}
