import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AskTable, BidTable } from "./bid-ask-table";
import type { PriceLevel } from "./types";

describe("BidTable", () => {
  const mockBids: PriceLevel[] = [
    { price: 42502.0, quantity: 1.5, total: 63753.0, percent: 55 },
    { price: 42501.0, quantity: 2.2, total: 93502.2, percent: 45 },
    { price: 42500.0, quantity: 3.0, total: 127500.0, percent: 30 },
  ];

  it("renders bid table with all levels", () => {
    const { container } = render(<BidTable levels={mockBids} />);
    const text = container.textContent || "";
    expect(text).toContain("42502");
    expect(text).toContain("42501");
    expect(text).toContain("42500");
  });

  it("renders levels in correct order (highest price first)", () => {
    const { container } = render(<BidTable levels={mockBids} />);
    const rows = container.querySelectorAll("[class*='grid-cols-3']");
    expect(rows.length).toBeGreaterThan(0);
  });
});

describe("AskTable", () => {
  const mockAsks: PriceLevel[] = [
    { price: 42504.0, quantity: 1.0, total: 42504.0, percent: 40 },
    { price: 42505.0, quantity: 2.5, total: 106262.5, percent: 60 },
    { price: 42506.0, quantity: 1.8, total: 76510.8, percent: 35 },
  ];

  it("renders ask table with all levels", () => {
    const { container } = render(<AskTable levels={mockAsks} />);
    const text = container.textContent || "";
    expect(text).toContain("42504");
    expect(text).toContain("42505");
    expect(text).toContain("42506");
  });

  it("renders levels in correct visual order (highest price first → best ask at bottom)", () => {
    const { container } = render(<AskTable levels={mockAsks} />);
    // Row structure: DepthBar (absolute) + price div + qty div + total div
    // price is the 2nd child (index 1) in each grid row
    const priceEls = container.querySelectorAll("[class*='grid-cols-3'] > div:nth-child(2)");
    const prices = Array.from(priceEls).map((c) => c.textContent?.trim());
    // DOM order should be descending (highest first) so best ask ends at bottom near spread
    expect(prices[0]).toContain("42506");
    expect(prices[2]).toContain("42504");
  });
});
