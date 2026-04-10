import { RECONNECT_DELAYS, RECONNECT_MAX_DELAY } from "@/lib/constants";

export interface ReconnectManager {
  /** Schedule the next reconnect attempt (with exponential backoff). */
  trigger(): void;
  /** Reset attempt counter and cancel any pending reconnect. */
  reset(): void;
  /** Register a callback invoked when a reconnect attempt fires. */
  onReconnect(cb: () => void): void;
  dispose(): void;
}

/**
 * Exponential backoff reconnect scheduler.
 *
 * Delays: 1 s → 2 s → 4 s → 8 s → 16 s → 30 s (capped, AC-5).
 * Debounces multiple rapid `trigger()` calls — only one timer runs at a time.
 */
export function createReconnectManager(): ReconnectManager {
  let attempt = 0;
  let timerId: ReturnType<typeof setTimeout> | null = null;
  const callbacks: Array<() => void> = [];

  function getDelay(): number {
    const idx = Math.min(attempt, RECONNECT_DELAYS.length - 1);
    return RECONNECT_DELAYS[idx] ?? RECONNECT_MAX_DELAY;
  }

  return {
    trigger() {
      if (timerId !== null) return; // already scheduled — debounce
      const delay = getDelay();
      attempt++;
      timerId = setTimeout(() => {
        timerId = null;
        for (const cb of callbacks) cb();
      }, delay);
    },

    reset() {
      attempt = 0;
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
    },

    onReconnect(cb) {
      callbacks.push(cb);
    },

    dispose() {
      this.reset();
      callbacks.length = 0;
    },
  };
}
