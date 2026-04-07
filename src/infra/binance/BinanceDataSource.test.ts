import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NormalizedSnapshot } from "@/domain/market-data/normalized";
import { BinanceDataSource } from "./BinanceDataSource";
import * as snapshotModule from "./snapshot";
import type { WsClientCallbacks } from "./ws-client";
import * as wsClientModule from "./ws-client";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("./snapshot");
vi.mock("./ws-client");

const mockedFetchSnapshot = vi.mocked(snapshotModule.fetchDepthSnapshot);

let capturedCallbacks: WsClientCallbacks | null = null;
const mockWsClient = {
  connect: vi.fn(),
  close: vi.fn(),
};

vi.mocked(wsClientModule.createWsClient).mockImplementation((callbacks) => {
  capturedCallbacks = callbacks;
  return mockWsClient;
});

function makeSnapshot(sequenceId: number): NormalizedSnapshot {
  return { bids: [["100.00", "1.0"]], asks: [["101.00", "1.0"]], sequenceId };
}

function depthUpdate(U: number, u: number) {
  return {
    e: "depthUpdate" as const,
    U,
    u,
    b: [] as [string, string][],
    a: [] as [string, string][],
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BinanceDataSource — gap detection", () => {
  let source: BinanceDataSource;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedCallbacks = null;
    source = new BinanceDataSource();
    source.connect("BTCUSDT");
  });

  afterEach(() => {
    source.disconnect();
  });

  it("emits depth update for normal sequential events after snapshot", async () => {
    mockedFetchSnapshot.mockResolvedValue(makeSnapshot(100));
    const depthCb = vi.fn();
    source.onDepthUpdate(depthCb);

    await source.getSnapshot("BTCUSDT");

    // U=101 — immediately follows snapshot (lastUpdateId=100)
    capturedCallbacks?.onMessage(depthUpdate(101, 101));
    expect(depthCb).toHaveBeenCalledTimes(1);
  });

  it("triggers reconnect when a gap is detected (U > snapshotSeqId + 1)", async () => {
    mockedFetchSnapshot.mockResolvedValue(makeSnapshot(100));
    const statusCb = vi.fn();
    source.onStatusChange(statusCb);

    await source.getSnapshot("BTCUSDT");
    statusCb.mockClear();

    // U=103 skips 101–102 — gap detected
    capturedCallbacks?.onMessage(depthUpdate(103, 104));

    expect(statusCb).toHaveBeenCalledWith("reconnecting");
  });

  it("does NOT trigger reconnect for contiguous events (U === snapshotSeqId + 1)", async () => {
    mockedFetchSnapshot.mockResolvedValue(makeSnapshot(100));
    const statusCb = vi.fn();
    source.onStatusChange(statusCb);

    await source.getSnapshot("BTCUSDT");
    statusCb.mockClear();

    capturedCallbacks?.onMessage(depthUpdate(101, 101));
    expect(statusCb).not.toHaveBeenCalledWith("reconnecting");
  });

  it("discards stale events silently (u <= snapshotSeqId)", async () => {
    mockedFetchSnapshot.mockResolvedValue(makeSnapshot(100));
    const depthCb = vi.fn();
    const statusCb = vi.fn();
    source.onDepthUpdate(depthCb);
    source.onStatusChange(statusCb);

    await source.getSnapshot("BTCUSDT");
    statusCb.mockClear();

    capturedCallbacks?.onMessage(depthUpdate(99, 100));
    expect(depthCb).not.toHaveBeenCalled();
    expect(statusCb).not.toHaveBeenCalledWith("reconnecting");
  });

  it("advances snapshotSeqId as live events are applied (prevents false gap on next event)", async () => {
    mockedFetchSnapshot.mockResolvedValue(makeSnapshot(100));
    const depthCb = vi.fn();
    source.onDepthUpdate(depthCb);

    await source.getSnapshot("BTCUSDT");

    // Apply 101, then 102 — should be two normal events, no reconnect
    capturedCallbacks?.onMessage(depthUpdate(101, 101));
    capturedCallbacks?.onMessage(depthUpdate(102, 102));
    expect(depthCb).toHaveBeenCalledTimes(2);
  });
});

describe("BinanceDataSource — aggTrade normalisation", () => {
  let source: BinanceDataSource;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedCallbacks = null;
    source = new BinanceDataSource();
    source.connect("BTCUSDT");
  });

  afterEach(() => {
    source.disconnect();
  });

  it("maps aggTrade event to NormalizedTrade using aggregate ID", () => {
    const tradeCb = vi.fn();
    source.onTrade(tradeCb);

    capturedCallbacks?.onMessage({
      e: "aggTrade",
      E: 1_700_000_000_000,
      s: "BTCUSDT",
      a: 9_999_001,
      p: "68722.30",
      q: "0.573",
      f: 7_534_530_079,
      l: 7_534_530_080,
      T: 1_700_000_000_000,
      m: false,
    });

    expect(tradeCb).toHaveBeenCalledTimes(1);
    expect(tradeCb).toHaveBeenCalledWith({
      id: "9999001",
      price: "68722.30",
      quantity: "0.573",
      time: 1_700_000_000_000,
      isBuyerMaker: false,
    });
  });

  it("emits aggTrade as buyer-maker correctly", () => {
    const tradeCb = vi.fn();
    source.onTrade(tradeCb);

    capturedCallbacks?.onMessage({
      e: "aggTrade",
      E: 1_700_000_000_001,
      s: "BTCUSDT",
      a: 9_999_002,
      p: "68700.00",
      q: "1.000",
      f: 7_534_530_081,
      l: 7_534_530_081,
      T: 1_700_000_000_001,
      m: true,
    });

    expect(tradeCb).toHaveBeenCalledWith(
      expect.objectContaining({ isBuyerMaker: true, id: "9999002" }),
    );
  });
});

describe("BinanceDataSource — snapshot staleness check", () => {
  let source: BinanceDataSource;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedCallbacks = null;
    source = new BinanceDataSource();
    source.connect("BTCUSDT");
  });

  afterEach(() => {
    source.disconnect();
  });

  it("re-fetches snapshot when it is older than the first buffered event's U", async () => {
    // First snapshot: sequenceId=50, but buffer has event with U=60 → stale
    // Second snapshot: sequenceId=65 → fresh
    mockedFetchSnapshot
      .mockResolvedValueOnce(makeSnapshot(50))
      .mockResolvedValueOnce(makeSnapshot(65));

    // Buffer an event before snapshot arrives
    capturedCallbacks?.onMessage(depthUpdate(60, 62));

    await source.getSnapshot("BTCUSDT");

    expect(mockedFetchSnapshot).toHaveBeenCalledTimes(2);
  });

  it("does NOT re-fetch when snapshot covers the buffered events", async () => {
    mockedFetchSnapshot.mockResolvedValue(makeSnapshot(100));

    capturedCallbacks?.onMessage(depthUpdate(95, 98));

    await source.getSnapshot("BTCUSDT");

    expect(mockedFetchSnapshot).toHaveBeenCalledTimes(1);
  });

  it("triggers handleDisconnect after MAX_SNAPSHOT_RETRIES stale snapshots", async () => {
    // Always returns a snapshot too old for the buffered event
    mockedFetchSnapshot.mockResolvedValue(makeSnapshot(10));
    capturedCallbacks?.onMessage(depthUpdate(100, 102));

    const statusCb = vi.fn();
    source.onStatusChange(statusCb);

    await source.getSnapshot("BTCUSDT");

    // After 3 retries (0,1,2) it gives up and calls handleDisconnect → "reconnecting"
    expect(mockedFetchSnapshot).toHaveBeenCalledTimes(4); // initial + 3 retries
    expect(statusCb).toHaveBeenCalledWith("reconnecting");
  });
});
