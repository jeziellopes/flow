import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MOCK_ORDER_BOOK_STATE } from "@/lib/mock-data";
import { OrderBook } from "./order-book";

describe("OrderBook", () => {
  it("renders connection banner", () => {
    const state = { ...MOCK_ORDER_BOOK_STATE, connectionStatus: "reconnecting" as const };
    render(<OrderBook state={state} />);
    expect(screen.getByText(/Reconnecting/)).toBeInTheDocument();
  });

  it("renders spread bar", () => {
    render(<OrderBook state={MOCK_ORDER_BOOK_STATE} />);
    expect(screen.getByText(/Spread:/)).toBeInTheDocument();
  });

  it("renders bid and ask tables", () => {
    const { container } = render(<OrderBook state={MOCK_ORDER_BOOK_STATE} />);
    // Should have bids and asks
    const allText = container.textContent;
    expect(allText).toContain("67843.50"); // bid
    expect(allText).toContain("67846.00"); // ask
  });

  it("applies correct container styling", () => {
    const { container } = render(<OrderBook state={MOCK_ORDER_BOOK_STATE} />);
    const orderbook = container.firstChild;
    expect(orderbook).toHaveClass("flex", "flex-col", "w-full", "h-full", "font-mono", "text-sm");
    expect(orderbook).not.toHaveClass("overflow-y-auto");
  });

  it("asks container scrolls independently", () => {
    render(<OrderBook state={MOCK_ORDER_BOOK_STATE} />);
    const asksContainer = screen.getByTestId("asks-container");
    expect(asksContainer).toHaveClass("overflow-y-scroll", "flex-1");
  });

  it("bids container scrolls independently", () => {
    render(<OrderBook state={MOCK_ORDER_BOOK_STATE} />);
    const bidsContainer = screen.getByTestId("bids-container");
    expect(bidsContainer).toHaveClass("overflow-y-scroll", "flex-1");
  });

  it("spread bar is not inside a scrollable container", () => {
    const { container } = render(<OrderBook state={MOCK_ORDER_BOOK_STATE} />);
    const spreadText = screen.getByText(/Spread:/);
    const rootContainer = container.firstChild;
    // Walk up from the spread text to find the direct child of root
    let el: HTMLElement | null = spreadText;
    while (el && el.parentElement !== rootContainer) {
      el = el.parentElement;
    }
    expect(el).not.toBeNull();
    expect(el?.parentElement).toBe(rootContainer);
  });

  it("asks container is bottom-aligned", () => {
    render(<OrderBook state={MOCK_ORDER_BOOK_STATE} />);
    const asksContainer = screen.getByTestId("asks-container");
    expect(asksContainer).toHaveClass("justify-end");
  });
});
