/**
 * UE Conduit — Configuration
 */

export interface BridgeConfig {
  ue5Host: string;
  ue5Port: number;
  ue5WsPort: number;
  apiKey: string;
  projectPath: string;
  logLevel: "debug" | "info" | "warn" | "error";
  maxRetries: number;
  timeoutMs: number;
  batchSize: number;
  healthCheckIntervalMs: number;

  // LLM provider configuration
  llmProvider: "claude" | "openai" | "xai" | "gemini" | "ollama" | "custom";
  llmApiKey: string;
  llmModel: string;
  llmBaseUrl: string;
  llmTemperature: number;
  llmMaxTokens: number;
}

export function loadConfig(): BridgeConfig {
  return {
    ue5Host: process.env.UE5_HOST ?? "localhost",
    ue5Port: parseInt(process.env.UE5_PORT ?? "8080", 10),
    ue5WsPort: parseInt(process.env.UE5_WS_PORT ?? "8081", 10),
    apiKey: process.env.UE5_API_KEY ?? "",
    projectPath: process.env.UE5_PROJECT_PATH ?? "",
    logLevel: (process.env.UE5_LOG_LEVEL as BridgeConfig["logLevel"]) ?? "info",
    maxRetries: parseInt(process.env.UE5_MAX_RETRIES ?? "3", 10),
    timeoutMs: parseInt(process.env.UE5_TIMEOUT_MS ?? "30000", 10),
    batchSize: parseInt(process.env.UE5_BATCH_SIZE ?? "50", 10),
    healthCheckIntervalMs: parseInt(process.env.UE5_HEALTH_CHECK_MS ?? "5000", 10),

    // LLM provider configuration
    llmProvider: (process.env.LLM_PROVIDER ?? "claude") as BridgeConfig["llmProvider"],
    llmApiKey: process.env.LLM_API_KEY ?? process.env.ANTHROPIC_API_KEY ?? "",
    llmModel: process.env.LLM_MODEL ?? "claude-sonnet-4-6",
    llmBaseUrl: process.env.LLM_BASE_URL ?? "",
    llmTemperature: parseFloat(process.env.LLM_TEMPERATURE ?? "0.7"),
    llmMaxTokens: parseInt(process.env.LLM_MAX_TOKENS ?? "4096", 10),
  };
}
