/**
 * UE Conduit — Game Log Resource
 *
 * MCP resource for editor://log
 * Returns the last 100 lines of UE5 output log.
 * Useful for debugging PIE crashes and runtime errors.
 */

import type { UE5Client } from "../connection/ue5-client.js";
import { Logger } from "../utils/logger.js";

export interface LogEntry {
  timestamp: string;
  category: string;
  verbosity: "Display" | "Warning" | "Error" | "Fatal" | "Log";
  message: string;
}

export class GameLogResource {
  private ue5: UE5Client;
  private logger: Logger;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize: number;

  constructor(ue5: UE5Client, logger: Logger, maxBufferSize = 100) {
    this.ue5 = ue5;
    this.logger = logger;
    this.maxBufferSize = maxBufferSize;
  }

  /**
   * Append log entries from an external source (e.g., WebSocket stream).
   */
  appendEntries(entries: LogEntry[]): void {
    this.logBuffer.push(...entries);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }
  }

  /**
   * Append raw log lines (parsed into entries).
   */
  appendRawLines(lines: string[]): void {
    const entries = lines.map((line) => this.parseLine(line));
    this.appendEntries(entries);
  }

  /**
   * Fetch fresh log lines from UE5 and merge into buffer.
   */
  async refresh(): Promise<LogEntry[]> {
    try {
      const response = await this.ue5.executeCommand("console", "get_log", {
        lines: this.maxBufferSize,
        filter: "",
      });

      if (response.success && response.output) {
        const rawLines = (response.output.log_lines as string[]) ?? [];
        // Replace buffer with fresh data from UE5
        this.logBuffer = rawLines.map((line) => this.parseLine(line));
        this.logger.debug(`Game log refreshed: ${this.logBuffer.length} lines`);
      }
    } catch {
      this.logger.warn("Failed to refresh game log from UE5");
    }

    return this.getEntries();
  }

  /**
   * Get buffered log entries.
   */
  getEntries(filter?: string): LogEntry[] {
    if (!filter) {
      return [...this.logBuffer];
    }
    const lowerFilter = filter.toLowerCase();
    return this.logBuffer.filter(
      (entry) =>
        entry.message.toLowerCase().includes(lowerFilter) ||
        entry.category.toLowerCase().includes(lowerFilter)
    );
  }

  /**
   * Check if recent logs contain errors or crashes.
   */
  hasErrors(): boolean {
    return this.logBuffer.some(
      (entry) => entry.verbosity === "Error" || entry.verbosity === "Fatal"
    );
  }

  /**
   * Get only error/fatal entries.
   */
  getErrors(): LogEntry[] {
    return this.logBuffer.filter(
      (entry) => entry.verbosity === "Error" || entry.verbosity === "Fatal"
    );
  }

  /**
   * Clear the log buffer.
   */
  clear(): void {
    this.logBuffer = [];
  }

  /**
   * Get game log as MCP resource contents.
   */
  async getResourceContents(): Promise<{
    contents: Array<{ uri: string; mimeType: string; text: string }>;
  }> {
    // Fetch fresh data
    await this.refresh();

    const errors = this.getErrors();

    return {
      contents: [
        {
          uri: "editor://log",
          mimeType: "application/json",
          text: JSON.stringify(
            {
              total_lines: this.logBuffer.length,
              error_count: errors.length,
              has_errors: errors.length > 0,
              errors: errors.map((e) => e.message),
              lines: this.logBuffer.map(
                (entry) =>
                  `[${entry.timestamp}] [${entry.category}] [${entry.verbosity}] ${entry.message}`
              ),
            },
            null,
            2
          ),
        },
      ],
    };
  }

  /**
   * Parse a raw UE5 log line into a structured entry.
   */
  private parseLine(line: string): LogEntry {
    // UE5 log format: [2024.01.15-12.30.45:123][  0]LogCategory: Verbosity: Message
    // Or simplified: [timestamp] Category: Message
    const timestampMatch = line.match(/^\[([^\]]+)\]/);
    const categoryMatch = line.match(/\]\s*(\w+):\s*/);

    let verbosity: LogEntry["verbosity"] = "Log";
    if (line.includes("Error:") || line.includes("Error]")) {
      verbosity = "Error";
    } else if (line.includes("Warning:") || line.includes("Warning]")) {
      verbosity = "Warning";
    } else if (line.includes("Fatal:") || line.includes("Fatal]")) {
      verbosity = "Fatal";
    } else if (line.includes("Display:") || line.includes("Display]")) {
      verbosity = "Display";
    }

    return {
      timestamp: timestampMatch?.[1] ?? "",
      category: categoryMatch?.[1] ?? "Unknown",
      verbosity,
      message: line,
    };
  }
}
