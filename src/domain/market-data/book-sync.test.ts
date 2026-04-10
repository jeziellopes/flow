import { describe, expect, it } from "vitest";
import { applyDepthUpdate, bookFromSnapshot, detectGap } from "./book-sync";
import type { NormalizedDepthUpdate, NormalizedSnapshot } from "./normalized";

const SNAPSHOT: NormalizedSnapshot = {
  bids: [
    ["50000.00", "1.0"],
    ["49999.00", "2.0"],
  ],
  asks: [
    ["50001.00", "1.5"],
    ["50002.00", "0.5"],
  ],
  sequenceId: 100,
};

function makeUpdate(opts: {
  firstSeq?: number;
  lastSeq?: number;
  bids?: [string, string][];
  asks?: [string, string][];
}): NormalizedDepthUpdate {
  return {
    firstSequenceId: opts.firstSeq ?? 101,
    lastSequenceId: opts.lastSeq ?? 101,
    bids: opts.bids ?? [],
    asks: opts.asks ?? [],
  };
}

describe("bookFromSnapshot", () => {
  it("populates bids and asks from snapshot arrays", () => {
    const book = bookFromSnapshot(SNAPSHOT);
    expect(book.bids.get("50000.00")).toBe("1.0");
    expect(book.bids.get("49999.00")).toBe("2.0");
    expect(book.asks.get("50001.00")).toBe("1.5");
    expect(book.asks.get("50002.00")).toBe("0.5");
  });

  it("sets lastUpdateId from snapshot sequenceId", () => {
    const book = bookFromSnapshot(SNAPSHOT);
    expect(book.lastUpdateId).toBe(100);
  });

  it("creates independent Maps (mutations don't affect snapshot)", () => {
    const book = bookFromSnapshot(SNAPSHOT);
    book.bids.delete("50000.00");
    expect(SNAPSHOT.bids).toHaveLength(2); // snapshot unchanged
  });
});

describe("applyDepthUpdate — AC-2: correct merging", () => {
  it("adds a new bid level", () => {
    const book = bookFromSnapshot(SNAPSHOT);
    const updated = applyDepthUpdate(book, makeUpdate({ bids: [["49998.00", "3.0"]] }));
    expect(updated.bids.get("49998.00")).toBe("3.0");
    expect(updated.bids.size).toBe(3);
  });

  it("updates an existing ask quantity", () => {
    const book = bookFromSnapshot(SNAPSHOT);
    const updated = applyDepthUpdate(book, makeUpdate({ asks: [["50001.00", "9.9"]] }));
    expect(updated.asks.get("50001.00")).toBe("9.9");
  });

  it("removes a bid level when quantity is '0'", () => {
    const book = bookFromSnapshot(SNAPSHOT);
    const updated = applyDepthUpdate(book, makeUpdate({ bids: [["50000.00", "0"]] }));
    expect(updated.bids.has("50000.00")).toBe(false);
    expect(updated.bids.size).toBe(1);
  });

  it("removes an ask level when quantity is '0'", () => {
    const book = bookFromSnapshot(SNAPSHOT);
    const updated = applyDepthUpdate(book, makeUpdate({ asks: [["50002.00", "0"]] }));
    expect(updated.asks.has("50002.00")).toBe(false);
    expect(updated.asks.size).toBe(1);
  });

  it("handles multiple bid and ask changes in one update", () => {
    const book = bookFromSnapshot(SNAPSHOT);
    const updated = applyDepthUpdate(
      book,
      makeUpdate({
        bids: [
          ["50000.00", "0"], // remove
          ["48000.00", "5.0"], // add
        ],
        asks: [
          ["50001.00", "2.0"], // update
        ],
      }),
    );
    expect(updated.bids.has("50000.00")).toBe(false);
    expect(updated.bids.get("48000.00")).toBe("5.0");
    expect(updated.asks.get("50001.00")).toBe("2.0");
  });

  it("advances lastUpdateId to the update's lastSequenceId", () => {
    const book = bookFromSnapshot(SNAPSHOT);
    const updated = applyDepthUpdate(book, makeUpdate({ lastSeq: 105 }));
    expect(updated.lastUpdateId).toBe(105);
  });

  it("does not mutate the input book Maps", () => {
    const book = bookFromSnapshot(SNAPSHOT);
    const before = new Map(book.bids);
    applyDepthUpdate(book, makeUpdate({ bids: [["50000.00", "0"]] }));
    expect(book.bids).toEqual(before);
  });
});

describe("applyDepthUpdate — AC-3: stale event discard", () => {
  it("returns the same reference for events where lastSequenceId <= lastUpdateId", () => {
    const book = bookFromSnapshot(SNAPSHOT); // lastUpdateId = 100
    const stale = makeUpdate({ firstSeq: 99, lastSeq: 100 });
    const result = applyDepthUpdate(book, stale);
    expect(result).toBe(book); // same reference — no allocation
  });

  it("discards stale event without modifying bids or asks", () => {
    const book = bookFromSnapshot(SNAPSHOT);
    // Stale event that would add a level if applied
    const stale = makeUpdate({
      firstSeq: 50,
      lastSeq: 100,
      bids: [["1.00", "999"]],
    });
    const result = applyDepthUpdate(book, stale);
    expect(result.bids.has("1.00")).toBe(false);
  });

  it("applies an event when lastSequenceId > lastUpdateId", () => {
    const book = bookFromSnapshot(SNAPSHOT);
    const fresh = makeUpdate({ firstSeq: 100, lastSeq: 101, bids: [["40000.00", "1.0"]] });
    const result = applyDepthUpdate(book, fresh);
    expect(result.bids.get("40000.00")).toBe("1.0");
  });
});

describe("applyDepthUpdate — sequential merging", () => {
  it("applies a chain of updates correctly", () => {
    let book = bookFromSnapshot(SNAPSHOT);
    book = applyDepthUpdate(book, makeUpdate({ lastSeq: 101, bids: [["49900.00", "1.0"]] }));
    book = applyDepthUpdate(
      book,
      makeUpdate({ firstSeq: 102, lastSeq: 102, bids: [["49900.00", "2.0"]] }),
    );
    book = applyDepthUpdate(
      book,
      makeUpdate({ firstSeq: 103, lastSeq: 103, bids: [["49900.00", "0"]] }),
    );
    expect(book.bids.has("49900.00")).toBe(false);
    expect(book.lastUpdateId).toBe(103);
  });
});

describe("detectGap", () => {
  it("returns false when firstSequenceId === lastUpdateId + 1 (next expected event)", () => {
    const book = bookFromSnapshot(SNAPSHOT); // lastUpdateId = 100
    const update = makeUpdate({ firstSeq: 101, lastSeq: 101 });
    expect(detectGap(book, update)).toBe(false);
  });

  it("returns false when firstSequenceId === lastUpdateId (overlapping — acceptable per Binance)", () => {
    const book = bookFromSnapshot(SNAPSHOT); // lastUpdateId = 100
    const update = makeUpdate({ firstSeq: 100, lastSeq: 101 });
    expect(detectGap(book, update)).toBe(false);
  });

  it("returns false when firstSequenceId < lastUpdateId (stale — caller should discard)", () => {
    const book = bookFromSnapshot(SNAPSHOT); // lastUpdateId = 100
    const update = makeUpdate({ firstSeq: 99, lastSeq: 100 });
    expect(detectGap(book, update)).toBe(false);
  });

  it("returns true when firstSequenceId > lastUpdateId + 1 (gap — missed events)", () => {
    const book = bookFromSnapshot(SNAPSHOT); // lastUpdateId = 100
    const update = makeUpdate({ firstSeq: 102, lastSeq: 103 });
    expect(detectGap(book, update)).toBe(true);
  });

  it("returns true for a large gap (multiple missed events)", () => {
    const book = bookFromSnapshot(SNAPSHOT); // lastUpdateId = 100
    const update = makeUpdate({ firstSeq: 200, lastSeq: 210 });
    expect(detectGap(book, update)).toBe(true);
  });
});
