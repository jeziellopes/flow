import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createReconnectManager } from "./reconnect";

describe("createReconnectManager — AC-5: exponential backoff", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires callback after first delay (1 s)", () => {
    const mgr = createReconnectManager();
    const cb = vi.fn();
    mgr.onReconnect(cb);

    mgr.trigger();
    expect(cb).not.toHaveBeenCalled();

    vi.advanceTimersByTime(999);
    expect(cb).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("increases delay on successive attempts (2 s, 4 s, …)", () => {
    const mgr = createReconnectManager();
    const cb = vi.fn();
    mgr.onReconnect(cb);

    // Attempt 1 → 1 s
    mgr.trigger();
    vi.advanceTimersByTime(1_000);
    expect(cb).toHaveBeenCalledTimes(1);

    // Attempt 2 → 2 s
    mgr.trigger();
    vi.advanceTimersByTime(1_000);
    expect(cb).toHaveBeenCalledTimes(1); // not yet
    vi.advanceTimersByTime(1_000);
    expect(cb).toHaveBeenCalledTimes(2);

    // Attempt 3 → 4 s
    mgr.trigger();
    vi.advanceTimersByTime(3_999);
    expect(cb).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(3);
  });

  it("caps delay at 30 s for all attempts beyond the backoff list", () => {
    const mgr = createReconnectManager();
    const cb = vi.fn();
    mgr.onReconnect(cb);

    // Exhaust the delay table (6 entries: 1,2,4,8,16,30)
    const delays = [1_000, 2_000, 4_000, 8_000, 16_000, 30_000];
    for (const delay of delays) {
      mgr.trigger();
      vi.advanceTimersByTime(delay);
    }
    expect(cb).toHaveBeenCalledTimes(6);

    // Attempts beyond the table should still use 30 s
    mgr.trigger();
    vi.advanceTimersByTime(29_999);
    expect(cb).toHaveBeenCalledTimes(6);
    vi.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(7);
  });

  it("debounces multiple rapid trigger() calls — only one timer at a time", () => {
    const mgr = createReconnectManager();
    const cb = vi.fn();
    mgr.onReconnect(cb);

    mgr.trigger();
    mgr.trigger(); // should be ignored while timer is pending
    mgr.trigger();

    vi.advanceTimersByTime(1_000);
    expect(cb).toHaveBeenCalledTimes(1); // fired exactly once
  });

  it("reset() cancels a pending timer", () => {
    const mgr = createReconnectManager();
    const cb = vi.fn();
    mgr.onReconnect(cb);

    mgr.trigger();
    mgr.reset();
    vi.advanceTimersByTime(10_000);
    expect(cb).not.toHaveBeenCalled();
  });

  it("reset() resets attempt counter to 0", () => {
    const mgr = createReconnectManager();
    const cb = vi.fn();
    mgr.onReconnect(cb);

    // Advance a few attempts
    for (let i = 0; i < 4; i++) {
      mgr.trigger();
      vi.runAllTimers();
    }

    mgr.reset();

    // Next trigger should use the first delay (1 s) again
    mgr.trigger();
    vi.advanceTimersByTime(999);
    expect(cb).toHaveBeenCalledTimes(4); // not yet
    vi.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(5); // fired at 1 s
  });

  it("dispose() stops all callbacks from firing", () => {
    const mgr = createReconnectManager();
    const cb = vi.fn();
    mgr.onReconnect(cb);

    mgr.trigger();
    mgr.dispose();
    vi.advanceTimersByTime(10_000);
    expect(cb).not.toHaveBeenCalled();
  });
});
