/**
 * UE Conduit — Build Status Resource
 *
 * MCP resource for editor://build
 * Tracks the last build result, errors, warnings, and duration.
 * Updated after each compile command.
 */

import type { UE5Client } from "../connection/ue5-client.js";
import { Logger } from "../utils/logger.js";

export interface BuildResult {
  status: "clean" | "errors" | "building" | "unknown";
  errors: string[];
  warnings: string[];
  duration_ms: number;
  timestamp: string;
  module: string;
}

export class BuildStatusResource {
  private ue5: UE5Client;
  private logger: Logger;
  private lastBuild: BuildResult | null = null;
  private buildHistory: BuildResult[] = [];
  private maxHistory = 20;

  constructor(ue5: UE5Client, logger: Logger) {
    this.ue5 = ue5;
    this.logger = logger;
  }

  /**
   * Record a build result. Called after compile commands complete.
   */
  recordBuild(result: BuildResult): void {
    this.lastBuild = result;
    this.buildHistory.unshift(result);
    if (this.buildHistory.length > this.maxHistory) {
      this.buildHistory.pop();
    }
    this.logger.debug(`Build recorded: ${result.status} (${result.errors.length} errors, ${result.warnings.length} warnings)`);
  }

  /**
   * Fetch the latest build status from UE5 and record it.
   */
  async refresh(): Promise<BuildResult> {
    try {
      const response = await this.ue5.executeCommand("build", "get_errors", {});
      const result: BuildResult = {
        status: response.success
          ? ((response.output?.error_count as number) ?? 0) > 0
            ? "errors"
            : "clean"
          : "unknown",
        errors: (response.output?.errors as string[]) ?? [],
        warnings: (response.output?.warnings as string[]) ?? [],
        duration_ms: response.execution_time_ms,
        timestamp: response.timestamp ?? new Date().toISOString(),
        module: (response.output?.module as string) ?? "",
      };
      this.recordBuild(result);
      return result;
    } catch {
      this.logger.warn("Failed to refresh build status from UE5");
      return this.getLastBuild();
    }
  }

  /**
   * Get the last recorded build result.
   */
  getLastBuild(): BuildResult {
    if (this.lastBuild) {
      return this.lastBuild;
    }
    return {
      status: "unknown",
      errors: [],
      warnings: [],
      duration_ms: 0,
      timestamp: "",
      module: "",
    };
  }

  /**
   * Get recent build history.
   */
  getHistory(): BuildResult[] {
    return [...this.buildHistory];
  }

  /**
   * Get build status as MCP resource contents.
   */
  async getResourceContents(): Promise<{
    contents: Array<{ uri: string; mimeType: string; text: string }>;
  }> {
    const lastBuild = this.getLastBuild();

    return {
      contents: [
        {
          uri: "editor://build",
          mimeType: "application/json",
          text: JSON.stringify(
            {
              last_build: lastBuild,
              history_count: this.buildHistory.length,
              recent_builds: this.buildHistory.slice(0, 5),
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
