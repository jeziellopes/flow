import { toast } from "sonner";
import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import type { Order, OrderInput, OrderStatusUpdate } from "@/domain/trading/types";
import { LocalFillEngine } from "@/infra/local/LocalFillEngine";
import { useMarketDataStore } from "@/stores/market-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PortfolioState {
  balances: Record<string, string>;
  openOrders: Order[];
  filledOrders: Order[];
}

interface PortfolioActions {
  /** Place a simulated order — updates balance optimistically, wires fill engine. */
  submitOrder(input: OrderInput): Promise<{ ok: boolean; error?: string }>;
  /** Cancel a pending limit order and restore reserved balance. */
  cancelOrder(orderId: string): void;
}

// ---------------------------------------------------------------------------
// Balance helpers — string ↔ number with precision
// ---------------------------------------------------------------------------

function fmt(n: number, decimals = 8): string {
  return n.toFixed(decimals).replace(/\.?0+$/, "") || "0";
}

function add(a: string, b: string): string {
  return fmt(Number(a) + Number(b));
}

function sub(a: string, b: string): string {
  return fmt(Number(a) - Number(b));
}

/** Get base/quote from active symbol info. Falls back to USDT/BTC. */
function getAssets(): { base: string; quote: string } {
  const info = useMarketDataStore.getState().symbolInfo;
  return { base: info?.base ?? "BTC", quote: info?.quote ?? "USDT" };
}

// ---------------------------------------------------------------------------
// Singleton fill engine — lives for the whole session
// ---------------------------------------------------------------------------

const engine = new LocalFillEngine();

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePortfolioStore = create<PortfolioState & PortfolioActions>((set, get) => {
  // Wire fill engine → portfolio when a limit order fills asynchronously.
  engine.onOrderUpdate((update: OrderStatusUpdate) => {
    if (update.status !== "filled") return;

    set((state) => {
      const order = state.openOrders.find((o) => o.id === update.orderId);
      if (!order) return state;

      const fillPrice = update.fillPrice ?? order.price;
      const qty = Number(order.quantity);
      const price = Number(fillPrice);
      const { base, quote } = getAssets();

      // Balances: for limit orders the quote/base was already reserved on
      // placement, so we only add what we receive.
      const newBalances = { ...state.balances };
      if (order.side === "buy") {
        // USDT was deducted at limit price; add BTC received.
        // If fill is at a better price, refund the difference.
        const reserved = qty * Number(order.price);
        const actual = qty * price;
        if (actual < reserved) {
          newBalances[quote] = add(newBalances[quote] ?? "0", fmt(reserved - actual));
        }
        newBalances[base] = add(newBalances[base] ?? "0", fmt(qty));
      } else {
        // BTC was deducted; add USDT received.
        newBalances[quote] = add(newBalances[quote] ?? "0", fmt(qty * price));
      }

      const filledOrder: Order = {
        ...order,
        status: "filled",
        fillPrice,
        filledQuantity: order.quantity,
        filledAt: update.timestamp,
        updatedAt: update.timestamp,
      };

      toast.success(`Limit ${order.side === "buy" ? "buy" : "sell"} filled`, {
        description: `${order.quantity} @ ${Number(fillPrice).toFixed(2)}`,
      });

      return {
        balances: newBalances,
        openOrders: state.openOrders.filter((o) => o.id !== update.orderId),
        filledOrders: [filledOrder, ...state.filledOrders],
      };
    });
  });

  return {
    // Initial simulated portfolio
    balances: { USDT: "10000", BTC: "0", ETH: "0" },
    openOrders: [],
    filledOrders: [],

    async submitOrder(input) {
      const state = get();
      const { base, quote } = getAssets();
      const qty = Number(input.quantity);

      // Balance check before submission
      if (input.side === "buy") {
        const price =
          input.type === "market"
            ? (() => {
                const book = useMarketDataStore.getState().orderBook;
                if (!book || book.asks.size === 0) return 0;
                return Math.min(...[...book.asks.keys()].map(Number));
              })()
            : Number(input.price ?? 0);
        const cost = qty * price;
        if (Number(state.balances[quote] ?? 0) < cost) {
          return { ok: false, error: `Insufficient ${quote} balance` };
        }
      } else {
        if (Number(state.balances[base] ?? 0) < qty) {
          return { ok: false, error: `Insufficient ${base} balance` };
        }
      }

      const result = await engine.submit(input);

      if (result.status === "rejected") {
        return { ok: false, error: result.reason };
      }

      const order = result.order;

      set((state) => {
        const newBalances = { ...state.balances };

        if (order.status === "filled") {
          // Market order — apply fill immediately
          const fillPrice = Number(order.fillPrice ?? order.price);
          if (order.side === "buy") {
            newBalances[quote] = sub(newBalances[quote] ?? "0", fmt(qty * fillPrice));
            newBalances[base] = add(newBalances[base] ?? "0", fmt(qty));
          } else {
            newBalances[base] = sub(newBalances[base] ?? "0", fmt(qty));
            newBalances[quote] = add(newBalances[quote] ?? "0", fmt(qty * fillPrice));
          }

          toast.success(`${order.side === "buy" ? "Buy" : "Sell"} market filled`, {
            description: `${order.quantity} @ ${Number(order.fillPrice).toFixed(2)}`,
          });

          return {
            balances: newBalances,
            filledOrders: [order, ...state.filledOrders],
          };
        }

        // Limit order accepted — reserve balance
        const reservePrice = Number(order.price);
        if (order.side === "buy") {
          newBalances[quote] = sub(newBalances[quote] ?? "0", fmt(qty * reservePrice));
        } else {
          newBalances[base] = sub(newBalances[base] ?? "0", fmt(qty));
        }

        return {
          balances: newBalances,
          openOrders: [order, ...state.openOrders],
        };
      });

      return { ok: true };
    },

    cancelOrder(orderId) {
      engine.cancel(orderId).then((result) => {
        if (result.status !== "cancelled") return;

        set((state) => {
          const order = state.openOrders.find((o) => o.id === orderId);
          if (!order) return state;

          const { base, quote } = getAssets();
          const qty = Number(order.quantity);
          const newBalances = { ...state.balances };

          // Restore reserved balance
          if (order.side === "buy") {
            newBalances[quote] = add(newBalances[quote] ?? "0", fmt(qty * Number(order.price)));
          } else {
            newBalances[base] = add(newBalances[base] ?? "0", fmt(qty));
          }

          return {
            balances: newBalances,
            openOrders: state.openOrders.filter((o) => o.id !== orderId),
          };
        });
      });
    },
  };
});

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export function useBalance(asset: string): string {
  return usePortfolioStore((s) => s.balances[asset] ?? "0");
}

export function useOpenOrders(): Order[] {
  return usePortfolioStore((s) => s.openOrders);
}

export function useFilledOrders(): Order[] {
  return usePortfolioStore((s) => s.filledOrders);
}

const INITIAL_USDT_BALANCE = 10_000;

/**
 * Derives live portfolio summary values from the portfolio store.
 * - totalBalance: current USDT balance
 * - totalPnL: USDT balance delta from starting $10,000
 * - totalPnLPct: delta as a percentage of initial balance
 */
export function usePortfolioSummary() {
  return usePortfolioStore(
    useShallow((s) => {
      const totalBalance = parseFloat(s.balances.USDT ?? "0");
      const totalPnL = totalBalance - INITIAL_USDT_BALANCE;
      const totalPnLPct = (totalPnL / INITIAL_USDT_BALANCE) * 100;
      return { totalBalance, totalPnL, totalPnLPct };
    }),
  );
}
