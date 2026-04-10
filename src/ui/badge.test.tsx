import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>Hello</Badge>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders as a span element", () => {
    render(<Badge>Tag</Badge>);
    const el = screen.getByText("Tag");
    expect(el.tagName).toBe("SPAN");
  });

  it("applies default variant (pill) classes when no variant specified", () => {
    render(<Badge>Default</Badge>);
    const el = screen.getByText("Default");
    expect(el).toHaveClass("bg-muted", "text-muted-foreground");
  });

  it("applies active variant classes", () => {
    render(<Badge variant="active">Active</Badge>);
    const el = screen.getByText("Active");
    expect(el).toHaveClass("text-primary", "border");
  });

  it("applies muted variant classes", () => {
    render(<Badge variant="muted">Muted</Badge>);
    const el = screen.getByText("Muted");
    expect(el).toHaveClass("text-muted-foreground", "border");
  });

  it("applies buy variant classes", () => {
    render(<Badge variant="buy">Buy</Badge>);
    const el = screen.getByText("Buy");
    expect(el).toHaveClass("border");
  });

  it("applies sell variant classes", () => {
    render(<Badge variant="sell">Sell</Badge>);
    const el = screen.getByText("Sell");
    expect(el).toHaveClass("border");
  });

  it("applies filled variant classes", () => {
    render(<Badge variant="filled">Filled</Badge>);
    const el = screen.getByText("Filled");
    expect(el).toHaveClass("border");
  });

  it("applies cancelled variant classes", () => {
    render(<Badge variant="cancelled">Cancelled</Badge>);
    const el = screen.getByText("Cancelled");
    expect(el).toHaveClass("text-muted-foreground", "border");
  });

  it("applies open variant classes", () => {
    render(<Badge variant="open">Open</Badge>);
    const el = screen.getByText("Open");
    expect(el).toHaveClass("text-primary", "border");
  });

  it("applies stat variant classes (different sizing: text-xs)", () => {
    render(<Badge variant="stat">123</Badge>);
    const el = screen.getByText("123");
    expect(el).toHaveClass("text-xs", "bg-muted", "px-2", "py-1");
  });

  it("merges custom className with variant classes", () => {
    render(<Badge className="custom-extra">Custom</Badge>);
    const el = screen.getByText("Custom");
    expect(el).toHaveClass("custom-extra");
    // Still has base classes
    expect(el).toHaveClass("inline-flex", "items-center");
  });

  it("forwards HTML attributes like data-testid", () => {
    render(<Badge data-testid="my-badge">Test</Badge>);
    expect(screen.getByTestId("my-badge")).toBeInTheDocument();
  });
});
