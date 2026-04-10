import { BINANCE_WS_BASE, WS_HEARTBEAT_TIMEOUT_MS } from "@/lib/constants";
import { type StreamMessage, StreamMessageSchema } from "./schemas";

export interface WsClientCallbacks {
  onMessage(msg: StreamMessage): void;
  onDisconnect(): void;
}

export interface WsClient {
  connect(streams: string[]): void;
  close(): void;
}

/**
 * Manages a single Binance combined-stream WebSocket connection.
 *
 * - Connects to `wss://stream.binance.com:9443/stream?streams=<a>/<b>/...`
 * - Parses each message with Zod; malformed messages are logged and skipped (AC-10).
 * - Reconnects via `onDisconnect` if no message arrives within HEARTBEAT_TIMEOUT (AC-4).
 * - Intentional `close()` does NOT fire `onDisconnect`.
 */
export function createWsClient(callbacks: WsClientCallbacks): WsClient {
  let ws: WebSocket | null = null;
  let heartbeatTimer: ReturnType<typeof setTimeout> | null = null;

  function resetHeartbeat() {
    if (heartbeatTimer !== null) clearTimeout(heartbeatTimer);
    heartbeatTimer = setTimeout(() => {
      heartbeatTimer = null;
      callbacks.onDisconnect();
      ws?.close();
      ws = null;
    }, WS_HEARTBEAT_TIMEOUT_MS);
  }

  function clearHeartbeat() {
    if (heartbeatTimer !== null) {
      clearTimeout(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  return {
    connect(streams) {
      // Clean up any existing connection without triggering onDisconnect.
      if (ws !== null) {
        clearHeartbeat();
        ws.onclose = null;
        ws.close();
        ws = null;
      }

      const url = `${BINANCE_WS_BASE}/stream?streams=${streams.join("/")}`;
      ws = new WebSocket(url);

      ws.onopen = () => {
        resetHeartbeat();
      };

      ws.onmessage = (event: MessageEvent) => {
        resetHeartbeat();
        try {
          const raw: unknown = JSON.parse(event.data as string);
          // Combined stream wraps payload in { stream: string, data: ... }
          const payload =
            raw !== null && typeof raw === "object" && "data" in raw
              ? (raw as { data: unknown }).data
              : raw;

          const result = StreamMessageSchema.safeParse(payload);
          if (result.success) {
            callbacks.onMessage(result.data);
          } else {
            console.warn("[ws-client] malformed message skipped:", result.error.message);
          }
        } catch (err) {
          console.warn("[ws-client] JSON parse error (skipped):", err);
        }
      };

      ws.onerror = () => {
        // An error will always be followed by a close event; let onclose handle it.
      };

      ws.onclose = () => {
        clearHeartbeat();
        ws = null;
        callbacks.onDisconnect();
      };
    },

    close() {
      clearHeartbeat();
      if (ws !== null) {
        ws.onclose = null; // suppress onDisconnect for intentional close
        ws.close();
        ws = null;
      }
    },
  };
}
