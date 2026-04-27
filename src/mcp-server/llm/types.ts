/**
 * UE Conduit — LLM Provider Abstraction Types
 *
 * Defines the interfaces all LLM providers must implement,
 * enabling users to swap between Claude, OpenAI, xAI, Gemini,
 * Ollama, or any OpenAI-compatible endpoint.
 */

/**
 * Every LLM provider implements this interface.
 * The MCP server routes prompts to whichever provider the user has configured.
 */
export interface LLMProvider {
  /** Human-readable provider name (e.g., "Claude", "OpenAI", "Ollama"). */
  name: string;

  /** Send a prompt and receive a complete response. */
  sendMessage(prompt: string, context?: string): Promise<string>;

  /** Stream a response token-by-token. */
  streamMessage(prompt: string, context?: string): AsyncGenerator<string>;

  /** List models available from this provider. */
  listModels(): Promise<LLMModel[]>;

  /** Report what this provider/model can do. */
  getCapabilities(): LLMCapabilities;
}

/**
 * Describes a single model offered by a provider.
 */
export interface LLMModel {
  /** Model identifier used in API calls (e.g., "claude-sonnet-4-6"). */
  id: string;

  /** Human-readable display name. */
  name: string;

  /** Maximum context window in tokens. */
  contextWindow: number;

  /** Whether the model can accept image inputs. */
  supportsVision: boolean;

  /** Whether the model supports tool/function calling. */
  supportsTools: boolean;

  /** Optional cost per 1 000 input tokens (USD). */
  costPer1kTokens?: number;
}

/**
 * Capability flags for the currently active provider + model combination.
 */
export interface LLMCapabilities {
  /** Can accept image/screenshot inputs. */
  vision: boolean;

  /** Supports tool/function calling. */
  toolUse: boolean;

  /** Supports streaming responses. */
  streaming: boolean;

  /** Maximum context tokens for the active model. */
  maxContextTokens: number;
}

/**
 * Configuration used to initialise an LLM provider.
 * Populated from environment variables or in-editor settings.
 */
export interface LLMConfig {
  /** Which provider to use. */
  provider: "claude" | "openai" | "xai" | "gemini" | "ollama" | "custom";

  /** API key for the chosen provider (empty for Ollama). */
  apiKey: string;

  /** Model identifier to use. */
  model: string;

  /** Override base URL (required for custom, optional for others). */
  baseUrl?: string;

  /** Sampling temperature (0.0 = deterministic, 1.0 = creative). */
  temperature?: number;

  /** Maximum tokens to generate in a single response. */
  maxTokens?: number;
}
