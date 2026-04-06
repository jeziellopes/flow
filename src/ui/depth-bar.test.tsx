import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DepthBar } from "./depth-bar";

describe("DepthBar", () => {
  it("renders as absolutely positioned div", () => {
    const { container } = render(<DepthBar percent={50} side="bid" />);
    const bar = container.querySelector("div");
    expect(bar).toHaveClass("absolute", "inset-y-0", "opacity-15");
  });

  it("applies bid styling", () => {
    const { container } = render(<DepthBar percent={45} side="bid" />);
    const bar = container.querySelector("div");
    expect(bar).toHaveClass("right-0", "bg-trading-bid");
  });

  it("applies ask styling", () => {
    const { container } = render(<DepthBar percent={55} side="ask" />);
    const bar = container.querySelector("div");
    expect(bar).toHaveClass("right-0", "bg-trading-ask");
  });

  it("sets width as inline style from percent", () => {
    const { container } = render(<DepthBar percent={35} side="bid" />);
    const bar = container.querySelector("div");
    expect(bar).toHaveStyle({ width: "35%" });
  });

  it("clamps percent between 0 and 100", () => {
    const { container: container1 } = render(<DepthBar percent={-10} side="bid" />);
    const { container: container2 } = render(<DepthBar percent={150} side="bid" />);
    expect(container1.querySelector("div")).toHaveStyle({ width: "0%" });
    expect(container2.querySelector("div")).toHaveStyle({ width: "100%" });
  });
});
