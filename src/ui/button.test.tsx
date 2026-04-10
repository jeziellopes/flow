import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders with text content", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("applies primary intent by default", () => {
    render(<Button>Submit</Button>);
    const btn = screen.getByRole("button", { name: /submit/i });
    expect(btn).toHaveClass("bg-primary");
    expect(btn).toHaveClass("text-on-primary");
  });

  it("applies tonal intent", () => {
    render(<Button intent="tonal">Tonal</Button>);
    const btn = screen.getByRole("button", { name: /tonal/i });
    expect(btn).toHaveClass("bg-primary-container");
    expect(btn).toHaveClass("text-on-primary-container");
  });

  it("applies secondary intent", () => {
    render(<Button intent="secondary">Cancel</Button>);
    const btn = screen.getByRole("button", { name: /cancel/i });
    expect(btn).toHaveClass("bg-secondary");
    expect(btn).toHaveClass("text-on-secondary");
  });

  it("applies segment intent", () => {
    render(<Button intent="segment">Tab</Button>);
    const btn = screen.getByRole("button", { name: /tab/i });
    expect(btn).toHaveClass("bg-background");
    expect(btn).toHaveClass("text-muted-foreground");
  });

  it("applies danger intent", () => {
    render(<Button intent="danger">Delete</Button>);
    const btn = screen.getByRole("button", { name: /delete/i });
    expect(btn).toHaveClass("bg-destructive");
  });

  it("applies md size by default", () => {
    render(<Button>Button</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("px-4", "py-2");
  });

  it("applies sm size", () => {
    render(<Button size="sm">Small</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("px-2", "py-1");
  });

  it("applies lg size", () => {
    render(<Button size="lg">Large</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("px-6", "py-3");
  });

  it("respects disabled prop", () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
  });

  it("responds to click events", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("accepts className prop for additional styling", () => {
    render(<Button className="custom-class">Custom</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("custom-class");
  });

  it("forwards ref", () => {
    const ref = { current: null };
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("applies font-cypher font-medium on base variant", () => {
    render(<Button>Base</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("font-cypher");
    expect(btn).toHaveClass("font-medium");
  });

  it("applies font-medium on buy variant", () => {
    render(<Button intent="buy">Buy</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("font-medium");
    expect(btn).toHaveClass("text-on-trading-bid");
  });

  it("applies font-medium on sell variant", () => {
    render(<Button intent="sell">Sell</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("font-medium");
    expect(btn).toHaveClass("text-on-trading-ask");
  });
});
