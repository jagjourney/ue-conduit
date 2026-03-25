/**
 * UE Conduit — Logger
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = "info") {
    this.level = level;
  }

  debug(message: string, data?: unknown): void {
    this.log("debug", message, data);
  }

  info(message: string, data?: unknown): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log("warn", message, data);
  }

  error(message: string, data?: unknown): void {
    this.log("error", message, data);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.level]) return;

    const timestamp = new Date().toISOString().slice(11, 23);
    const prefix = `[${timestamp}] [UEC] [${level.toUpperCase()}]`;
    const line = data ? `${prefix} ${message} ${JSON.stringify(data)}` : `${prefix} ${message}`;

    if (level === "error") {
      process.stderr.write(line + "\n");
    } else {
      process.stderr.write(line + "\n");
    }
  }
}
