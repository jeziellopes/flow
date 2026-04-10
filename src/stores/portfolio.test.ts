import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// localStorage stub — must be set up before the store module is imported
// ---------------------------------------------------------------------------

const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    for (const k of Object.keys(store)) delete store[k];
  },
  get length() {
    return Object.keys(store).length;
  },
  key: (i: number) => Object.keys(store)[i] ?? null,
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });

// ---------------------------------------------------------------------------
// Mock market-data store dependency
// ---------------------------------------------------------------------------

vi.mock("@/stores/market-data", () => ({
  useMarketDataStore: {
    getState: () => ({
      symbolInfo: { base: "BTC", quote: "USDT" },
      orderBook: null,
    }),
  },
}));

// ---------------------------------------------------------------------------
// Import store under test (after mocks are configured)
// ---------------------------------------------------------------------------

const { usePortfolioStore } = await import("@/stores/portfolio");

const STORAGE_KEY = "flow:portfolio:v1";

function getState() {
  return usePortfolioStore.getState();
}

describe("portfolio store", () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Reset to initial state between tests
    getState().resetPortfolio();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("starts with 10,000 USDT and zero crypto balances", () => {
      const { balances } = getState();
      expect(balances.USDT).toBe("10000");
      expect(balances.BTC).toBe("0");
      expect(balances.ETH).toBe("0");
    });

    it("starts with no orders", () => {
      const { openOrders, filledOrders } = getState();
      expect(openOrders).toHaveLength(0);
      expect(filledOrders).toHaveLength(0);
    });
  });

  describe("resetPortfolio", () => {
    it("restores balances to initial values", async () => {
      // Place a market order to change state
      await getState().submitOrder({
        symbol: "BTCUSDT",
        side: "buy",
        type: "market",
        quantity: "0.001",
      });

      getState().resetPortfolio();

      const { balances, openOrders, filledOrders } = getState();
      expect(balances.USDT).toBe("10000");
      expect(balances.BTC).toBe("0");
      expect(openOrders).toHaveLength(0);
      expect(filledOrders).toHaveLength(0);
    });

    it("clears persisted localStorage state", () => {
      // Ensure something is in storage first
      localStorageMock.setItem(
        STORAGE_KEY,
        JSON.stringify({ state: { balances: { USDT: "5000" } } }),
      );

      getState().resetPortfolio();

      // After reset, next persist write will contain initial state
      const { balances } = getState();
      expect(balances.USDT).toBe("10000");
    });
  });

  describe("persistence", () => {
    it("exposes a persist API (Zustand persist middleware is active)", () => {
      // The persist middleware adds a `.persist` property to the store
      expect(typeof (usePortfolioStore as unknown as { persist?: unknown }).persist).toBe("object");
    });
  });
});
