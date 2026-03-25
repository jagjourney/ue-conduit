/**
 * UE Conduit — WebSocket Client
 *
 * Real-time event stream from UE5 editor plugin.
 * Connects to ws://localhost:8081 and streams:
 *   - log: Output log lines
 *   - compile: Build progress and results
 *   - pie: Play-In-Editor state changes
 *   - editor_events: General editor events (level load, actor selection, etc.)
 *
 * Features:
 *   - Auto-reconnect on disconnect
 *   - Event emitter pattern
 *   - Buffers recent events (last 100 per stream)
 */

import WebSocket from "ws";
import type { BridgeConfig } from "../config.js";
import { Logger } from "../utils/logger.js";

export type StreamType = "log" | "compile" | "pie" | "editor_events";

export interface StreamEvent {
  stream: StreamType;
  timestamp: string;
  data: Record<string, unknown>;
}

type EventHandler = (event: StreamEvent) => void;

export class WebSocketClient {
  private config: BridgeConfig;
  private logger: Logger;
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 20;
  private baseReconnectDelayMs = 1000;
  private maxReconnectDelayMs = 30000;
  private connected = false;
  private intentionalClose = false;

  /** Event buffers — last 100 events per stream */
  private buffers: Record<StreamType, StreamEvent[]> = {
    log: [],
    compile: [],
    pie: [],
    editor_events: [],
  };
  private maxBufferSize = 100;

  /** Event listeners */
  private listeners: Map<string, Set<EventHandler>> = new Map();

  constructor(config: BridgeConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Connect to the UE5 WebSocket server.
   */
  connect(): void {
    if (this.ws) {
      this.logger.debug("WebSocket already connected or connecting");
      return;
    }

    this.intentionalClose = false;
    const url = `ws://${this.config.ue5Host}:${this.config.ue5WsPort}`;
    this.logger.info(`WebSocket connecting to ${url}`);

    try {
      this.ws = new WebSocket(url);
    } catch (error) {
      this.logger.warn(`WebSocket creation failed: ${error instanceof Error ? error.message : String(error)}`);
      this.scheduleReconnect();
      return;
    }

    this.ws.on("open", () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      this.logger.info("WebSocket connected to UE5");

      // Subscribe to all streams
      this.sendMessage({
        type: "subscribe",
        streams: ["log", "compile", "pie", "editor_events"],
      });

      this.emit("connected", {
        stream: "editor_events",
        timestamp: new Date().toISOString(),
        data: { event: "websocket_connected" },
      });
    });

    this.ws.on("message", (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(message);
      } catch {
        this.logger.debug("Received non-JSON WebSocket message");
      }
    });

    this.ws.on("close", (code: number, reason: Buffer) => {
      this.connected = false;
      this.ws = null;
      const reasonStr = reason.toString() || "unknown";
      this.logger.info(`WebSocket closed: ${code} (${reasonStr})`);

      if (!this.intentionalClose) {
        this.scheduleReconnect();
      }
    });

    this.ws.on("error", (error: Error) => {
      this.logger.warn(`WebSocket error: ${error.message}`);
      // The 'close' event will fire after this, which handles reconnection
    });
  }

  /**
   * Disconnect from the WebSocket server.
   */
  disconnect(): void {
    this.intentionalClose = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, "Client disconnecting");
      this.ws = null;
    }

    this.connected = false;
    this.logger.info("WebSocket disconnected");
  }

  /**
   * Check if connected.
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Register an event handler.
   *
   * @param event - Event name: stream type ("log", "compile", etc.) or "connected", "disconnected", "*" for all
   * @param handler - Callback function
   */
  on(event: string, handler: EventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  /**
   * Remove an event handler.
   */
  off(event: string, handler: EventHandler): void {
    this.listeners.get(event)?.delete(handler);
  }

  /**
   * Get buffered events for a stream.
   */
  getBuffer(stream: StreamType): StreamEvent[] {
    return [...this.buffers[stream]];
  }

  /**
   * Get all buffered events across all streams, sorted by timestamp.
   */
  getAllBuffered(): StreamEvent[] {
    const all: StreamEvent[] = [];
    for (const events of Object.values(this.buffers)) {
      all.push(...events);
    }
    return all.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  /**
   * Clear buffer for a specific stream or all streams.
   */
  clearBuffer(stream?: StreamType): void {
    if (stream) {
      this.buffers[stream] = [];
    } else {
      for (const key of Object.keys(this.buffers) as StreamType[]) {
        this.buffers[key] = [];
      }
    }
  }

  /**
   * Handle an incoming WebSocket message.
   */
  private handleMessage(message: Record<string, unknown>): void {
    const stream = message.stream as StreamType | undefined;
    if (!stream || !this.buffers[stream]) {
      this.logger.debug("Received message with unknown stream type", message);
      return;
    }

    const event: StreamEvent = {
      stream,
      timestamp: (message.timestamp as string) ?? new Date().toISOString(),
      data: (message.data as Record<string, unknown>) ?? message,
    };

    // Buffer the event
    this.buffers[stream].push(event);
    if (this.buffers[stream].length > this.maxBufferSize) {
      this.buffers[stream].shift();
    }

    // Emit to listeners
    this.emit(stream, event);
    this.emit("*", event);
  }

  /**
   * Emit an event to registered listeners.
   */
  private emit(eventName: string, event: StreamEvent): void {
    const handlers = this.listeners.get(eventName);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(event);
        } catch (error) {
          this.logger.error(
            `Event handler error for "${eventName}": ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }
  }

  /**
   * Send a JSON message to the WebSocket server.
   */
  private sendMessage(message: Record<string, unknown>): void {
    if (this.ws && this.connected) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Schedule a reconnection attempt with exponential backoff.
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error(
        `WebSocket reconnect failed after ${this.maxReconnectAttempts} attempts — giving up`
      );
      return;
    }

    const delay = Math.min(
      this.baseReconnectDelayMs * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelayMs
    );

    this.reconnectAttempts++;
    this.logger.info(
      `WebSocket reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }
}
