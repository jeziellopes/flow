/** Reconnect delays: 1 → 2 → 4 → 8 → 16 → 30 s (capped at 30 s). */
export const RECONNECT_DELAYS: readonly number[] = [1_000, 2_000, 4_000, 8_000, 16_000, 30_000];

export const RECONNECT_MAX_DELAY = 30_000;

/** Maximum trades kept in the ring buffer. */
export const RING_BUFFER_SIZE = 100;

/** Heartbeat: reconnect if no WS message arrives within this window. */
export const WS_HEARTBEAT_TIMEOUT_MS = 30_000;

export const BINANCE_WS_BASE = "wss://stream.binance.com:9443";
export const BINANCE_REST_BASE = "https://api.binance.com";

/** Depth snapshot levels (max supported by Binance REST). */
export const SNAPSHOT_DEPTH_LIMIT = 1000;
