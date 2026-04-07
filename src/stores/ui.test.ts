import { afterEach, describe, expect, it } from "vitest";
import { useUIStore } from "./ui";

afterEach(() => {
  useUIStore.setState({ activeTab: "book", selectedPrice: null });
});

describe("useUIStore", () => {
  it("has correct initial state", () => {
    const state = useUIStore.getState();
    expect(state.activeTab).toBe("book");
    expect(state.selectedPrice).toBeNull();
  });

  it("setActiveTab updates activeTab", () => {
    useUIStore.getState().setActiveTab("depth");
    expect(useUIStore.getState().activeTab).toBe("depth");
  });

  it("setActiveTab accepts all valid tabs", () => {
    const tabs = ["book", "trades", "depth"] as const;
    for (const tab of tabs) {
      useUIStore.getState().setActiveTab(tab);
      expect(useUIStore.getState().activeTab).toBe(tab);
    }
  });

  it("syncFromSearch updates activeTab", () => {
    useUIStore.getState().syncFromSearch("trades");
    expect(useUIStore.getState().activeTab).toBe("trades");
  });

  it("syncFromSearch overwrites previous state", () => {
    useUIStore.getState().setActiveTab("depth");
    useUIStore.getState().syncFromSearch("book");
    expect(useUIStore.getState().activeTab).toBe("book");
  });

  it("setSelectedPrice updates selectedPrice", () => {
    useUIStore.getState().setSelectedPrice(42500.5);
    expect(useUIStore.getState().selectedPrice).toBe(42500.5);
  });

  it("setSelectedPrice accepts null to clear selection", () => {
    useUIStore.getState().setSelectedPrice(42500.5);
    useUIStore.getState().setSelectedPrice(null);
    expect(useUIStore.getState().selectedPrice).toBeNull();
  });
});
