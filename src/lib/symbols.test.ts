import { describe, expect, it } from "vitest";
import {
  DEFAULT_SYMBOL,
  findSymbol,
  isValidSymbol,
  normalizeSymbol,
  SYMBOL_CATEGORIES,
  SYMBOLS,
} from "./symbols";

describe("SYMBOLS", () => {
  it("has 18 entries", () => {
    expect(SYMBOLS).toHaveLength(18);
  });

  it("every symbol has symbol, base, quote, category, pricePrecision, qtyPrecision fields", () => {
    for (const s of SYMBOLS) {
      expect(typeof s.symbol).toBe("string");
      expect(typeof s.base).toBe("string");
      expect(typeof s.quote).toBe("string");
      expect(typeof s.category).toBe("string");
      expect(typeof s.pricePrecision).toBe("number");
      expect(typeof s.qtyPrecision).toBe("number");
    }
  });

  it("no duplicate symbol strings", () => {
    const symbols = SYMBOLS.map((s) => s.symbol);
    expect(new Set(symbols).size).toBe(symbols.length);
  });

  it("all categories are valid SYMBOL_CATEGORIES values", () => {
    for (const s of SYMBOLS) {
      expect(SYMBOL_CATEGORIES).toContain(s.category);
    }
  });
});

describe("DEFAULT_SYMBOL", () => {
  it('equals "BTCUSDT"', () => {
    expect(DEFAULT_SYMBOL).toBe("BTCUSDT");
  });

  it("exists in SYMBOLS array", () => {
    const found = SYMBOLS.find((s) => s.symbol === DEFAULT_SYMBOL);
    expect(found).toBeDefined();
  });
});

describe("findSymbol", () => {
  it("returns SymbolInfo for existing symbol", () => {
    const result = findSymbol("BTCUSDT");
    expect(result).toBeDefined();
    expect(result?.symbol).toBe("BTCUSDT");
    expect(result?.base).toBe("BTC");
    expect(result?.quote).toBe("USDT");
    expect(result?.pricePrecision).toBe(2);
    expect(result?.qtyPrecision).toBe(5);
  });

  it("returns undefined for non-existent symbol", () => {
    expect(findSymbol("DOESNOTEXIST")).toBeUndefined();
  });

  it("is case-sensitive", () => {
    expect(findSymbol("btcusdt")).toBeUndefined();
  });
});

describe("normalizeSymbol", () => {
  it("uppercases the input", () => {
    expect(normalizeSymbol("btcusdt")).toBe("BTCUSDT");
    expect(normalizeSymbol("ethusdt")).toBe("ETHUSDT");
    expect(normalizeSymbol("BTCUSDT")).toBe("BTCUSDT");
  });
});

describe("isValidSymbol", () => {
  it("returns true for valid symbols (case-insensitive)", () => {
    expect(isValidSymbol("BTCUSDT")).toBe(true);
    expect(isValidSymbol("btcusdt")).toBe(true);
    expect(isValidSymbol("BtcUsdt")).toBe(true);
  });

  it("returns false for unknown symbols", () => {
    expect(isValidSymbol("FAKECOIN")).toBe(false);
    expect(isValidSymbol("")).toBe(false);
  });
});

describe("SYMBOL_CATEGORIES", () => {
  it("has 4 entries", () => {
    expect(SYMBOL_CATEGORIES).toHaveLength(4);
  });

  it("contains USDT, BTC, ETH, BNB", () => {
    expect(SYMBOL_CATEGORIES).toContain("USDT");
    expect(SYMBOL_CATEGORIES).toContain("BTC");
    expect(SYMBOL_CATEGORIES).toContain("ETH");
    expect(SYMBOL_CATEGORIES).toContain("BNB");
  });
});
