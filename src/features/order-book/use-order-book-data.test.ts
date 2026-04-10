import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useMarketDataStore } from "@/stores/market-data";
import { useOrderBookViewState } from "./use-order-book-data";

const resetStore = () =>
  useMarketDataStore.setState({
    orderBook: null,
    trades: [],
    connectionStatus: "disconnected",
    symbol: null,
  });

afterEach(resetStore);

const makeBook = (bids: [string, string][], asks: [string, string][]) => ({
  bids: new Map(bids),
  asks: new Map(asks),
  lastUpdateId: 1,
  lastEventTime: 1,
});

describe("useOrderBookViewState", () => {
  it("returns null when orderBook is null", () => {
    const { result } = renderHook(() => useOrderBookViewState());
    expect(result.current).toBeNull();
  });

  it("returns view state once order book is populated", () => {
    act(() => {
      useMarketDataStore.setState({
        orderBook: makeBook(
          [
            ["50000.00", "1.0"],
            ["49999.00", "2.0"],
          ],
          [
            ["50001.00", "0.5"],
            ["50002.00", "1.5"],
          ],
        ),
        connectionStatus: "connected",
        trades: [],
        symbol: "BTCUSDT",
      });
    });

    const { result } = renderHook(() => useOrderBookViewState(20));
    const state = result.current;

    expect(state).not.toBeNull();
    // Bids sorted desc (highest first)
    expect(state?.bids[0].price).toBe(50000);
    expect(state?.bids[1].price).toBe(49999);
    // Asks sorted asc (lowest first in state, though AskTable re-sorts for display)
    expect(state?.asks[0].price).toBe(50001);
    expect(state?.asks[1].price).toBe(50002);
  });

  it("limits to requested levels", () => {
    const bids: [string, string][] = Array.from({ length: 30 }, (_, i) => [
      String(50000 - i),
      "1.0",
    ]);
    act(() => {
      useMarketDataStore.setState({
        orderBook: makeBook(bids, [["50001.00", "1.0"]]),
        connectionStatus: "connected",
        trades: [],
        symbol: "BTCUSDT",
      });
    });

    const { result } = renderHook(() => useOrderBookViewState(10));
    expect(result.current?.bids).toHaveLength(10);
  });

  it("computes correct spread", () => {
    act(() => {
      useMarketDataStore.setState({
        orderBook: makeBook([["50000.00", "1.0"]], [["50002.00", "1.0"]]),
        connectionStatus: "connected",
        trades: [],
        symbol: "BTCUSDT",
      });
    });

    const { result } = renderHook(() => useOrderBookViewState());
    // biome-ignore lint/style/noNonNullAssertion: state is asserted non-null by expect above
    const state = result.current!;
    expect(state.bestBid).toBe(50000);
    expect(state.bestAsk).toBe(50002);
    expect(state.spreadAmount).toBeCloseTo(2, 5);
    expect(state.spreadPercent).toBeCloseTo((2 / 50000) * 100, 5);
  });

  it("computes cumulative totals correctly", () => {
    act(() => {
      useMarketDataStore.setState({
        orderBook: makeBook(
          [
            ["50000.00", "1.0"],
            ["49999.00", "2.0"],
            ["49998.00", "0.5"],
          ],
          [["50001.00", "1.0"]],
        ),
        connectionStatus: "connected",
        trades: [],
        symbol: "BTCUSDT",
      });
    });

    const { result } = renderHook(() => useOrderBookViewState());
    const bids = result.current?.bids;
    expect(bids[0].total).toBeCloseTo(1.0, 5); // 1.0
    expect(bids[1].total).toBeCloseTo(3.0, 5); // 1.0 + 2.0
    expect(bids[2].total).toBeCloseTo(3.5, 5); // 1.0 + 2.0 + 0.5
  });

  it("computes percent relative to max quantity", () => {
    act(() => {
      useMarketDataStore.setState({
        orderBook: makeBook(
          [
            ["50000.00", "2.0"],
            ["49999.00", "4.0"],
            ["49998.00", "1.0"],
          ],
          [["50001.00", "1.0"]],
        ),
        connectionStatus: "connected",
        trades: [],
        symbol: "BTCUSDT",
      });
    });

    const { result } = renderHook(() => useOrderBookViewState());
    const bids = result.current?.bids;
    // max qty = 4.0 (at 49999)
    expect(bids[0].percent).toBeCloseTo(50, 1); // 2/4 = 50%
    expect(bids[1].percent).toBeCloseTo(100, 1); // 4/4 = 100%
    expect(bids[2].percent).toBeCloseTo(25, 1); // 1/4 = 25%
  });

  it("derives lastPrice from most recent trade", () => {
    act(() => {
      useMarketDataStore.setState({
        orderBook: makeBook([["50000.00", "1.0"]], [["50001.00", "1.0"]]),
        connectionStatus: "connected",
        trades: [
          { id: "1", price: "50005.00", quantity: "0.1", time: Date.now(), isBuyerMaker: false },
        ],
        symbol: "BTCUSDT",
      });
    });

    const { result } = renderHook(() => useOrderBookViewState());
    expect(result.current?.lastPrice).toBeCloseTo(50005, 2);
  });

  it("sets lastPriceTick correctly from trade direction", () => {
    act(() => {
      useMarketDataStore.setState({
        orderBook: makeBook([["50000.00", "1.0"]], [["50001.00", "1.0"]]),
        connectionStatus: "connected",
        trades: [
          { id: "2", price: "50010.00", quantity: "0.1", time: Date.now(), isBuyerMaker: false },
          {
            id: "1",
            price: "50005.00",
            quantity: "0.1",
            time: Date.now() - 100,
            isBuyerMaker: false,
          },
        ],
        symbol: "BTCUSDT",
      });
    });

    const { result } = renderHook(() => useOrderBookViewState());
    expect(result.current?.lastPriceTick).toBe("up");
  });

  it("filters out zero-quantity levels", () => {
    act(() => {
      useMarketDataStore.setState({
        orderBook: makeBook(
          [
            ["50000.00", "1.0"],
            ["49999.00", "0.0"],
            ["49998.00", "0.5"],
          ],
          [["50001.00", "1.0"]],
        ),
        connectionStatus: "connected",
        trades: [],
        symbol: "BTCUSDT",
      });
    });

    const { result } = renderHook(() => useOrderBookViewState());
    expect(result.current?.bids).toHaveLength(2);
  });

  it("passes connectionStatus through to view state", () => {
    act(() => {
      useMarketDataStore.setState({
        orderBook: makeBook([["50000.00", "1.0"]], [["50001.00", "1.0"]]),
        connectionStatus: "reconnecting",
        trades: [],
        symbol: "BTCUSDT",
      });
    });

    const { result } = renderHook(() => useOrderBookViewState());
    expect(result.current?.connectionStatus).toBe("reconnecting");
  });
});
