import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MarketDataSource } from "@/domain/market-data/MarketDataSource";
import type {
  NormalizedDepthUpdate,
  NormalizedSnapshot,
  NormalizedTicker,
  NormalizedTrade,
} from "@/domain/market-data/normalized";
import type { ConnectionStatus } from "@/domain/market-data/types";
import { useConnectionStatus, useMarketDataStore, useOrderBook, useTrades } from "./market-data";

// State accessors that don't require a React component context
const getStatus = () => useMarketDataStore.getState().connectionStatus;
const getTrades = () => useMarketDataStore.getState().trades;

// ---------------------------------------------------------------------------
// Mock MarketDataSource factory
// ---------------------------------------------------------------------------

function createMockSource() {
  let statusCb: ((s: ConnectionStatus) => void) | null = null;
  let depthCb: ((u: NormalizedDepthUpdate) => void) | null = null;
  let tradeCb: ((t: NormalizedTrade) => void) | null = null;
  let tickerCb: ((t: NormalizedTicker) => void) | null = null;

  const source: MarketDataSource = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    onStatusChange: vi.fn((cb) => {
      statusCb = cb;
    }),
    onDepthUpdate: vi.fn((cb) => {
      depthCb = cb;
    }),
    onTrade: vi.fn((cb) => {
      tradeCb = cb;
    }),
    onTicker: vi.fn((cb) => {
      tickerCb = cb;
    }),
    getSnapshot: vi.fn(),
    fetchKlines: vi.fn().mockResolvedValue([]),
  };

  return {
    source,
    emitStatus: (s: ConnectionStatus) => {
      statusCb?.(s);
    },
    emitDepthUpdate: (u: NormalizedDepthUpdate) => {
      depthCb?.(u);
    },
    emitTrade: (t: NormalizedTrade) => {
      tradeCb?.(t);
    },
    emitTicker: (t: NormalizedTicker) => {
      tickerCb?.(t);
    },
  };
}

const SNAPSHOT: NormalizedSnapshot = {
  bids: [["50000.00", "1.0"]],
  asks: [["50001.00", "1.0"]],
  sequenceId: 100,
};

function makeUpdate(lastSeq: number, bids: [string, string][] = []): NormalizedDepthUpdate {
  return { firstSequenceId: lastSeq, lastSequenceId: lastSeq, bids, asks: [] };
}

function makeTrade(id: string): NormalizedTrade {
  return { id, price: "50000", quantity: "0.1", time: Date.now(), isBuyerMaker: false };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resetStore() {
  useMarketDataStore.setState({
    orderBook: null,
    trades: [],
    klines: [],
    connectionStatus: "disconnected",
    symbol: null,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("market-data store — AC-1: snapshot before stream", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetStore();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("registers all callbacks before calling connect()", async () => {
    const { source } = createMockSource();
    vi.mocked(source.getSnapshot).mockResolvedValue(SNAPSHOT);

    const callOrder: string[] = [];
    vi.mocked(source.onStatusChange).mockImplementation(() => {
      callOrder.push("onStatusChange");
    });
    vi.mocked(source.onDepthUpdate).mockImplementation(() => {
      callOrder.push("onDepthUpdate");
    });
    vi.mocked(source.onTrade).mockImplementation(() => {
      callOrder.push("onTrade");
    });
    vi.mocked(source.connect).mockImplementation(() => {
      callOrder.push("connect");
    });

    await act(async () => {
      await useMarketDataStore.getState().initMarketData(source, "BTCUSDT");
    });

    const connectIdx = callOrder.indexOf("connect");
    expect(callOrder.indexOf("onStatusChange")).toBeLessThan(connectIdx);
    expect(callOrder.indexOf("onDepthUpdate")).toBeLessThan(connectIdx);
    expect(callOrder.indexOf("onTrade")).toBeLessThan(connectIdx);
  });

  it("initialises order book from snapshot", async () => {
    const { source } = createMockSource();
    vi.mocked(source.getSnapshot).mockResolvedValue(SNAPSHOT);

    await act(async () => {
      await useMarketDataStore.getState().initMarketData(source, "BTCUSDT");
    });

    const book = useMarketDataStore.getState().orderBook;
    expect(book).not.toBeNull();
    expect(book?.bids.get("50000.00")).toBe("1.0");
    expect(book?.asks.get("50001.00")).toBe("1.0");
    expect(book?.lastUpdateId).toBe(100);
  });

  it("sets connectionStatus to 'connected' after snapshot resolves", async () => {
    const { source } = createMockSource();
    vi.mocked(source.getSnapshot).mockResolvedValue(SNAPSHOT);

    await act(async () => {
      await useMarketDataStore.getState().initMarketData(source, "BTCUSDT");
    });

    expect(getStatus()).toBe("connected");
  });

  it("sets symbol in state", async () => {
    const { source } = createMockSource();
    vi.mocked(source.getSnapshot).mockResolvedValue(SNAPSHOT);

    await act(async () => {
      await useMarketDataStore.getState().initMarketData(source, "ETHUSDT");
    });

    expect(useMarketDataStore.getState().symbol).toBe("ETHUSDT");
  });
});

describe("market-data store — AC-7: RAF-batched depth updates", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetStore();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("batches multiple rapid updates into one state write per frame", async () => {
    const { source, emitDepthUpdate } = createMockSource();
    vi.mocked(source.getSnapshot).mockResolvedValue(SNAPSHOT);

    await act(async () => {
      await useMarketDataStore.getState().initMarketData(source, "BTCUSDT");
    });

    const setState = vi.spyOn(useMarketDataStore, "setState");

    // Emit 5 updates synchronously (no RAF tick yet)
    act(() => {
      for (let i = 101; i <= 105; i++) {
        emitDepthUpdate(makeUpdate(i, [["49900.00", String(i)]]));
      }
    });

    // Before RAF fires: no setState calls for orderBook yet
    const callsBefore = setState.mock.calls.length;

    // Advance RAF
    act(() => {
      vi.runAllTimers();
    });

    // After RAF: exactly one additional call batching all 5 updates
    expect(setState.mock.calls.length).toBe(callsBefore + 1);

    const book = useMarketDataStore.getState().orderBook;
    expect(book?.bids.get("49900.00")).toBe("105"); // last write wins
    expect(book?.lastUpdateId).toBe(105);
  });
});

describe("market-data store — AC-9: trades ring buffer", () => {
  beforeEach(() => {
    resetStore();
  });

  it("stores incoming trades", async () => {
    const { source, emitTrade } = createMockSource();
    vi.mocked(source.getSnapshot).mockResolvedValue(SNAPSHOT);

    await act(async () => {
      await useMarketDataStore.getState().initMarketData(source, "BTCUSDT");
    });

    act(() => {
      emitTrade(makeTrade("1"));
    });
    act(() => {
      emitTrade(makeTrade("2"));
    });

    const trades = getTrades();
    expect(trades).toHaveLength(2);
    expect(trades[0]?.id).toBe("2"); // newest first
    expect(trades[1]?.id).toBe("1");
  });

  it("caps the ring buffer at 100 trades", async () => {
    const { source, emitTrade } = createMockSource();
    vi.mocked(source.getSnapshot).mockResolvedValue(SNAPSHOT);

    await act(async () => {
      await useMarketDataStore.getState().initMarketData(source, "BTCUSDT");
    });

    act(() => {
      for (let i = 0; i < 110; i++) {
        emitTrade(makeTrade(String(i)));
      }
    });

    expect(getTrades()).toHaveLength(100);
  });
});

describe("market-data store — AC-8: symbol switch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetStore();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("teardown calls disconnect on the source", async () => {
    const { source } = createMockSource();
    vi.mocked(source.getSnapshot).mockResolvedValue(SNAPSHOT);

    await act(async () => {
      await useMarketDataStore.getState().initMarketData(source, "BTCUSDT");
    });

    act(() => {
      useMarketDataStore.getState().teardown(source);
    });

    expect(source.disconnect).toHaveBeenCalledTimes(1);
  });

  it("teardown resets store state", async () => {
    const { source } = createMockSource();
    vi.mocked(source.getSnapshot).mockResolvedValue(SNAPSHOT);

    await act(async () => {
      await useMarketDataStore.getState().initMarketData(source, "BTCUSDT");
    });

    act(() => {
      useMarketDataStore.getState().teardown(source);
    });

    const state = useMarketDataStore.getState();
    expect(state.orderBook).toBeNull();
    expect(state.trades).toHaveLength(0);
    expect(state.connectionStatus).toBe("disconnected");
    expect(state.symbol).toBeNull();
  });
});

describe("market-data store — connection status", () => {
  beforeEach(() => {
    resetStore();
  });

  it("reflects status changes emitted by the source", async () => {
    const { source, emitStatus } = createMockSource();
    vi.mocked(source.getSnapshot).mockResolvedValue(SNAPSHOT);

    await act(async () => {
      await useMarketDataStore.getState().initMarketData(source, "BTCUSDT");
    });

    act(() => {
      emitStatus("reconnecting");
    });
    expect(getStatus()).toBe("reconnecting");

    act(() => {
      emitStatus("connected");
    });
    expect(getStatus()).toBe("connected");
  });
});

describe("market-data store — flushDepthUpdates edge branches (lines 36-41)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetStore();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("RAF firing with empty queue (line 36 early-return branch) does not throw", async () => {
    const { source } = createMockSource();
    vi.mocked(source.getSnapshot).mockResolvedValue(SNAPSHOT);

    await act(async () => {
      await useMarketDataStore.getState().initMarketData(source, "BTCUSDT");
    });

    // Schedule a RAF with an empty queue by calling flushDepthUpdates indirectly:
    // emit an update, then manually drain pending updates before the RAF fires
    // The simplest path is to just run timers with nothing queued via requestAnimationFrame
    // We use fake timers which stub rAF — just advance them.
    act(() => {
      vi.runAllTimers();
    }); // no pending updates → early return, no crash

    expect(useMarketDataStore.getState().orderBook).not.toBeNull();
  });

  it("RAF firing after orderBook is cleared (line 41 null-guard) does not crash", async () => {
    const { source, emitDepthUpdate } = createMockSource();
    vi.mocked(source.getSnapshot).mockResolvedValue(SNAPSHOT);

    await act(async () => {
      await useMarketDataStore.getState().initMarketData(source, "BTCUSDT");
    });

    // Emit update to enqueue a RAF
    act(() => {
      emitDepthUpdate(makeUpdate(101, [["49000.00", "1.0"]]));
    });

    // Force-clear orderBook before RAF fires (simulates a concurrent teardown race)
    useMarketDataStore.setState({ orderBook: null });

    // RAF fires — setState guard (line 41) should return state unchanged
    act(() => {
      vi.runAllTimers();
    });

    expect(useMarketDataStore.getState().orderBook).toBeNull(); // unchanged
  });
});

describe("market-data store — teardown cancels in-flight RAF (lines 100-102)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetStore();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("cancels a pending RAF when teardown is called before the frame fires", async () => {
    const { source, emitDepthUpdate } = createMockSource();
    vi.mocked(source.getSnapshot).mockResolvedValue(SNAPSHOT);

    await act(async () => {
      await useMarketDataStore.getState().initMarketData(source, "BTCUSDT");
    });

    // Emit a depth update — schedules a RAF
    act(() => {
      emitDepthUpdate(makeUpdate(101, [["49000.00", "1.0"]]));
    });

    // Teardown before the RAF fires — should cancel it without throwing
    act(() => {
      useMarketDataStore.getState().teardown(source);
    });

    // Advance timers — RAF must NOT fire (store already reset)
    act(() => {
      vi.runAllTimers();
    });

    const state = useMarketDataStore.getState();
    expect(state.orderBook).toBeNull();
    expect(state.connectionStatus).toBe("disconnected");
  });
});

describe("market-data store — exported selector hooks (lines 120-129)", () => {
  beforeEach(() => {
    resetStore();
  });

  it("useOrderBook returns null before init", () => {
    const { result } = renderHook(() => useOrderBook());
    expect(result.current).toBeNull();
  });

  it("useOrderBook returns book after init", async () => {
    const { source } = createMockSource();
    vi.mocked(source.getSnapshot).mockResolvedValue(SNAPSHOT);

    await act(async () => {
      await useMarketDataStore.getState().initMarketData(source, "BTCUSDT");
    });

    const { result } = renderHook(() => useOrderBook());
    expect(result.current).not.toBeNull();
    expect(result.current?.bids.get("50000.00")).toBe("1.0");
  });

  it("useTrades returns empty array before init", () => {
    const { result } = renderHook(() => useTrades());
    expect(result.current).toHaveLength(0);
  });

  it("useConnectionStatus returns 'disconnected' before init", () => {
    const { result } = renderHook(() => useConnectionStatus());
    expect(result.current).toBe("disconnected");
  });

  it("useConnectionStatus reflects live status changes", async () => {
    const { source, emitStatus } = createMockSource();
    vi.mocked(source.getSnapshot).mockResolvedValue(SNAPSHOT);

    await act(async () => {
      await useMarketDataStore.getState().initMarketData(source, "BTCUSDT");
    });

    const { result } = renderHook(() => useConnectionStatus());
    expect(result.current).toBe("connected");

    act(() => {
      emitStatus("reconnecting");
    });
    expect(result.current).toBe("reconnecting");
  });
});
