/**
 * UE Conduit — Editor State Resource
 *
 * MCP resource provider for editor://state
 * Polls UE5 every 5 seconds and caches result to avoid hammering the editor.
 */

import type { UE5Client, UE5EditorState } from "../connection/ue5-client.js";
import { Logger } from "../utils/logger.js";

export class EditorStateResource {
  private ue5: UE5Client;
  private logger: Logger;
  private cache: UE5EditorState | null = null;
  private lastPoll = 0;
  private pollIntervalMs: number;
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor(ue5: UE5Client, logger: Logger, pollIntervalMs = 5000) {
    this.ue5 = ue5;
    this.logger = logger;
    this.pollIntervalMs = pollIntervalMs;
  }

  /**
   * Start background polling of editor state.
   */
  start(): void {
    if (this.pollTimer) return;

    this.pollTimer = setInterval(async () => {
      try {
        this.cache = await this.ue5.getEditorState();
        this.lastPoll = Date.now();
        this.logger.debug("Editor state polled successfully");
      } catch {
        this.logger.debug("Editor state poll failed — using stale cache");
      }
    }, this.pollIntervalMs);

    // Run initial poll immediately
    this.poll();
  }

  /**
   * Stop background polling.
   */
  stop(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /**
   * Force a fresh poll (bypasses cache).
   */
  async poll(): Promise<UE5EditorState> {
    try {
      this.cache = await this.ue5.getEditorState();
      this.lastPoll = Date.now();
    } catch {
      this.logger.warn("Editor state poll failed");
    }
    return this.getState();
  }

  /**
   * Get the cached editor state. Returns default disconnected state if no cache exists.
   */
  getState(): UE5EditorState {
    if (this.cache) {
      return this.cache;
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
   * Get state as a JSON string for MCP resource response.
   */
  async getResourceContents(): Promise<{
    contents: Array<{ uri: string; mimeType: string; text: string }>;
  }> {
    const state = this.getState();
    const staleness = this.lastPoll > 0 ? Date.now() - this.lastPoll : -1;

    return {
      contents: [
        {
          uri: "editor://state",
          mimeType: "application/json",
          text: JSON.stringify(
            {
              ...state,
              _cache_age_ms: staleness,
              _last_poll: this.lastPoll > 0 ? new Date(this.lastPoll).toISOString() : null,
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
