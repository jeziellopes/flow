import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrderBookRow } from "./order-book-row";

describe("OrderBookRow", () => {
  const mockLevel = {
    price: 42500.5,
    quantity: 2.5,
    total: 106251.25,
    percent: 45,
  };

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

  it("renders with correct layout classes", () => {
    const { container } = render(<OrderBookRow level={mockLevel} side="bid" />);
    const row = container.firstChild as HTMLElement;
    expect(row).toHaveClass(
      "relative",
      "grid",
      "grid-cols-3",
      "tabular-nums",
      "font-mono",
      "text-sm",
    );
  });

  it("renders DepthBar component", () => {
    const { container } = render(<OrderBookRow level={mockLevel} side="bid" />);
    const depthBar = container.querySelector("[class*='opacity-15']");
    expect(depthBar).toBeInTheDocument();
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
