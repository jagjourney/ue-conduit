/**
 * UE Conduit — UE5 HTTP Client
 *
 * Sends commands to the UE5 editor plugin via HTTP.
 * Handles retries, timeouts, and connection monitoring.
 */

import type { BridgeConfig } from "../config.js";
import { Logger } from "../utils/logger.js";

export interface UE5CommandRequest {
  command_id: string;
  category: string;
  command: string;
  params: Record<string, unknown>;
}

export interface UE5CommandResponse {
  success: boolean;
  command_id: string;
  message: string;
  execution_time_ms: number;
  timestamp: string;
  output?: Record<string, unknown>;
  warnings?: string[];
}

export interface UE5EditorState {
  connected: boolean;
  level: string;
  actorCount: number;
  pieState: "stopped" | "playing" | "paused";
  lastBuildStatus: "clean" | "errors" | "building" | "unknown";
  selectedActors: string[];
  engineVersion: string;
  projectName: string;
}

export class UE5Client {
  private baseUrl: string;
  private config: BridgeConfig;
  private logger: Logger;
  private connected = false;
  private commandCounter = 0;
  private healthCheckTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: BridgeConfig) {
    this.config = config;
    this.baseUrl = `http://${config.ue5Host}:${config.ue5Port}/api/command`;
    this.logger = new Logger(config.logLevel);
  }

  async connect(): Promise<boolean> {
    try {
      const state = await this.getEditorState();
      this.connected = state.connected;
      if (this.connected) {
        this.logger.info(`Connected to UE5 at ${this.baseUrl} — ${state.projectName} (${state.engineVersion})`);
        this.startHealthCheck();
      }
      return this.connected;
    } catch {
      this.logger.warn(`UE5 not reachable at ${this.baseUrl} — will retry on command`);
      this.connected = false;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Execute a command against the UE5 editor plugin.
   * Automatically retries on transient failures.
   */
  async executeCommand(
    category: string,
    command: string,
    params: Record<string, unknown> = {}
  ): Promise<UE5CommandResponse> {
    const commandId = `uec_${++this.commandCounter}_${Date.now()}`;

    const request: UE5CommandRequest = {
      command_id: commandId,
      category,
      command,
      params,
    };

    this.logger.debug(`→ ${category}/${command} [${commandId}]`, params);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await this.httpPost(request);
        this.connected = true;

        if (!response.success) {
          this.logger.warn(`← ${category}/${command} FAILED: ${response.message}`);
        } else {
          this.logger.debug(`← ${category}/${command} OK (${response.execution_time_ms}ms)`);
        }

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(
          `← ${category}/${command} attempt ${attempt}/${this.config.maxRetries} failed: ${lastError.message}`
        );

        if (attempt < this.config.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await this.sleep(delay);
        }
      }
    }

    this.connected = false;
    throw new Error(
      `UE5 command ${category}/${command} failed after ${this.config.maxRetries} attempts: ${lastError?.message}`
    );
  }

  /**
   * Get the current editor state (level, PIE status, selection, etc.)
   */
  async getEditorState(): Promise<UE5EditorState> {
    try {
      const response = await this.executeCommand("editor", "get_state");
      if (response.success && response.output) {
        return {
          connected: true,
          level: (response.output.level_name as string) ?? "Unknown",
          actorCount: (response.output.actor_count as number) ?? 0,
          pieState: (response.output.pie_state as UE5EditorState["pieState"]) ?? "stopped",
          lastBuildStatus: (response.output.build_status as UE5EditorState["lastBuildStatus"]) ?? "unknown",
          selectedActors: (response.output.selected_actors as string[]) ?? [],
          engineVersion: (response.output.engine_version as string) ?? "5.7",
          projectName: (response.output.project_name as string) ?? "Unknown",
        };
      }
    } catch {
      // Fall through to disconnected state
    }

    return {
      connected: false,
      level: "",
      actorCount: 0,
      pieState: "stopped",
      lastBuildStatus: "unknown",
      selectedActors: [],
      engineVersion: "",
      projectName: "",
    };
  }

  /**
   * Send raw HTTP POST to UE5 plugin.
   */
  private async httpPost(request: UE5CommandRequest): Promise<UE5CommandResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (this.config.apiKey) {
        headers["X-API-Key"] = this.config.apiKey;
      }

      const res = await fetch(this.baseUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return (await res.json()) as UE5CommandResponse;
    } finally {
      clearTimeout(timeout);
    }
  }

  private startHealthCheck(): void {
    if (this.healthCheckTimer) return;

    this.healthCheckTimer = setInterval(async () => {
      try {
        const res = await fetch(`${this.baseUrl}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            command_id: "health",
            category: "editor",
            command: "get_state",
            params: {},
          }),
          signal: AbortSignal.timeout(3000),
        });
        this.connected = res.ok;
      } catch {
        if (this.connected) {
          this.logger.warn("UE5 connection lost — will reconnect on next command");
        }
        this.connected = false;
      }
    }, this.config.healthCheckIntervalMs);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
