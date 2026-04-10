import { create } from "zustand";
import type { BotInstance } from "@/features/bots/types";
import { MOCK_BOTS, MOCK_ORDER_BOOK_STATE, MOCK_PORTFOLIO_STATE } from "@/lib/mock-data";

export interface SimulatedFill {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  price: string;
  quantity: string;
  time: number;
}

interface TerminalState {
  orderBook: typeof MOCK_ORDER_BOOK_STATE;
  portfolio: typeof MOCK_PORTFOLIO_STATE;
  bots: BotInstance[];
  fills: SimulatedFill[];
  setBotStatus: (id: string, status: BotInstance["status"]) => void;
  addFill: (fill: SimulatedFill) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  orderBook: MOCK_ORDER_BOOK_STATE,
  portfolio: MOCK_PORTFOLIO_STATE,
  bots: MOCK_BOTS,
  fills: [],
  setBotStatus: (id, status) =>
    set((state) => ({
      bots: state.bots.map((b) => (b.id === id ? { ...b, status } : b)),
    })),
  addFill: (fill) => set((state) => ({ fills: [fill, ...state.fills].slice(0, 200) })),
}));
