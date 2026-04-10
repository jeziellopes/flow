import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NormalizedTrade } from "@/domain/market-data/normalized";
import { TradesFeed } from "./trades-feed";

const makeTrade = (
  id: string,
  price: string,
  quantity: string,
  isBuyerMaker: boolean,
  time = 1_700_000_000_000,
): NormalizedTrade => ({ id, price, quantity, time, isBuyerMaker });

describe("TradesFeed", () => {
  it("shows waiting message when trades are empty", () => {
    render(<TradesFeed trades={[]} />);
    expect(screen.getByText(/Waiting for data/)).toBeInTheDocument();
  });

  it("renders a row per trade", () => {
    const trades = [
      makeTrade("1", "50000.00", "0.1000", false),
      makeTrade("2", "49999.00", "0.2000", true),
    ];
    const { container } = render(<TradesFeed trades={trades} />);
    const rows = container.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(2);
  });

  it("labels isBuyerMaker=false as buy", () => {
    render(<TradesFeed trades={[makeTrade("1", "50000.00", "0.1", false)]} />);
    expect(screen.getByText("buy")).toBeInTheDocument();
  });

  it("labels isBuyerMaker=true as sell", () => {
    render(<TradesFeed trades={[makeTrade("1", "50000.00", "0.1", true)]} />);
    expect(screen.getByText("sell")).toBeInTheDocument();
  });

  it("applies bid color class for buy trades", () => {
    render(<TradesFeed trades={[makeTrade("1", "50000.00", "0.1", false)]} />);
    const priceCell = screen.getByText("50000.00");
    expect(priceCell).toHaveClass("text-trading-bid");
  });

  it("applies ask color class for sell trades", () => {
    render(<TradesFeed trades={[makeTrade("1", "50000.00", "0.1", true)]} />);
    const priceCell = screen.getByText("50000.00");
    expect(priceCell).toHaveClass("text-trading-ask");
  });

  it("formats price to 2 decimal places", () => {
    render(<TradesFeed trades={[makeTrade("1", "50000.5", "0.1", false)]} />);
    expect(screen.getByText("50000.50")).toBeInTheDocument();
  });

  it("formats quantity to 4 decimal places", () => {
    render(<TradesFeed trades={[makeTrade("1", "50000.00", "0.1", false)]} />);
    expect(screen.getByText("0.1000")).toBeInTheDocument();
  });

  it("renders column headers", () => {
    render(<TradesFeed trades={[makeTrade("1", "50000.00", "0.1", false)]} />);
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("Price")).toBeInTheDocument();
    expect(screen.getByText("Qty")).toBeInTheDocument();
    expect(screen.getByText("Side")).toBeInTheDocument();
  });
});
