import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { useUIStore } from "@/stores/ui";
import { OrderBookRow } from "./order-book-row";

describe("OrderBookRow", () => {
  const mockLevel = {
    price: 42500.5,
    quantity: 2.5,
    total: 106251.25,
    percent: 45,
  };

  afterEach(() => {
    useUIStore.setState({ selectedPrice: null });
  });

  it("renders price, quantity, and total", () => {
    render(<OrderBookRow level={mockLevel} side="bid" />);
    expect(screen.getByText("42500.50")).toBeInTheDocument();
    expect(screen.getByText("2.5000")).toBeInTheDocument();
    expect(screen.getByText("106251.2500")).toBeInTheDocument();
  });

  it("applies bid styling to side=bid", () => {
    render(<OrderBookRow level={mockLevel} side="bid" />);
    const priceCell = screen.getByText("42500.50");
    expect(priceCell).toHaveClass("text-trading-bid");
  });

  it("applies ask styling to side=ask", () => {
    render(<OrderBookRow level={mockLevel} side="ask" />);
    const priceCell = screen.getByText("42500.50");
    expect(priceCell).toHaveClass("text-trading-ask");
  });

  it("renders with correct layout and interaction classes", () => {
    const { container } = render(<OrderBookRow level={mockLevel} side="bid" />);
    const row = container.firstChild as HTMLElement;
    expect(row.tagName).toBe("TR");
    expect(row).toHaveClass(
      "tabular-nums",
      "font-mono",
      "text-xs",
      "overflow-x-hidden",
      "cursor-pointer",
    );
  });

  it("applies muted hover background on bid side", () => {
    const { container } = render(<OrderBookRow level={mockLevel} side="bid" />);
    const row = container.firstChild as HTMLElement;
    expect(row).toHaveClass("hover:bg-muted");
  });

  it("applies muted hover background on ask side", () => {
    const { container } = render(<OrderBookRow level={mockLevel} side="ask" />);
    const row = container.firstChild as HTMLElement;
    expect(row).toHaveClass("hover:bg-muted");
  });

  it("is keyboard accessible (tabIndex=0 + onKeyDown on tr)", () => {
    const { container } = render(<OrderBookRow level={mockLevel} side="bid" />);
    const row = container.firstChild as HTMLElement;
    expect(row.tagName).toBe("TR");
    expect(row).toHaveAttribute("tabindex", "0");
  });

  it("sets selectedPrice in UIStore on click", async () => {
    const user = userEvent.setup();
    render(<OrderBookRow level={mockLevel} side="bid" />);
    const row = screen.getByRole("row");
    await user.click(row);
    expect(useUIStore.getState().selectedPrice).toBe(42500.5);
  });

  it("sets selectedPrice in UIStore on Enter key", async () => {
    const user = userEvent.setup();
    render(<OrderBookRow level={mockLevel} side="bid" />);
    const row = screen.getByRole("row");
    row.focus();
    await user.keyboard("{Enter}");
    expect(useUIStore.getState().selectedPrice).toBe(42500.5);
  });
  it("applies depth bar as full-row backgroundImage on bid side", () => {
    const { container } = render(<OrderBookRow level={mockLevel} side="bid" />);
    const row = container.firstChild as HTMLElement;
    expect(row.style.backgroundImage).toContain("trading-bid");
    expect(row.style.backgroundImage).toContain("45%");
  });

  it("applies depth bar as full-row backgroundImage on ask side", () => {
    const { container } = render(<OrderBookRow level={mockLevel} side="ask" />);
    const row = container.firstChild as HTMLElement;
    expect(row.style.backgroundImage).toContain("trading-ask");
  });

  it("formats prices with 2 decimal places", () => {
    const level = { ...mockLevel, price: 42500.123 };
    render(<OrderBookRow level={level} side="bid" />);
    expect(screen.getByText("42500.12")).toBeInTheDocument();
  });

  it("formats quantities with 4 decimal places (default qtyPrecision)", () => {
    const level = { ...mockLevel, quantity: 1.5 };
    render(<OrderBookRow level={level} side="bid" />);
    expect(screen.getByText("1.5000")).toBeInTheDocument();
  });
});
