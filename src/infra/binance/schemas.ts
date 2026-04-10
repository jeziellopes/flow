import { z } from "zod";

const PriceLevel = z.tuple([z.string(), z.string()]);

/** Binance REST /api/v3/depth response. */
export const DepthSnapshotSchema = z.object({
  lastUpdateId: z.number(),
  bids: z.array(PriceLevel),
  asks: z.array(PriceLevel),
});
export type DepthSnapshotMsg = z.infer<typeof DepthSnapshotSchema>;

/** Binance WebSocket depth update event (diff depth stream). */
export const DepthUpdateSchema = z.object({
  e: z.literal("depthUpdate"),
  E: z.number(), // event time
  s: z.string(), // symbol
  U: z.number(), // first update ID in event
  u: z.number(), // final update ID in event
  b: z.array(PriceLevel), // bid deltas
  a: z.array(PriceLevel), // ask deltas
});
export type DepthUpdateMsg = z.infer<typeof DepthUpdateSchema>;

/** Binance WebSocket aggregated trade event (@aggTrade). */
export const AggTradeEventSchema = z.object({
  e: z.literal("aggTrade"),
  E: z.number(), // event time
  s: z.string(), // symbol
  a: z.number(), // aggregate trade ID
  p: z.string(), // price
  q: z.string(), // quantity
  f: z.number(), // first trade ID in aggregate
  l: z.number(), // last trade ID in aggregate
  T: z.number(), // trade time
  m: z.boolean(), // is buyer maker
});
export type AggTradeEventMsg = z.infer<typeof AggTradeEventSchema>;

/** Binance WebSocket 24hr mini-ticker event (@miniTicker stream). */
export const MiniTickerEventSchema = z.object({
  e: z.literal("24hrMiniTicker"),
  E: z.number(), // event time
  s: z.string(), // symbol
  c: z.string(), // last (close) price
  o: z.string(), // open price
  h: z.string(), // high price
  l: z.string(), // low price
  v: z.string(), // base asset volume
  q: z.string(), // quote asset volume
});
export type MiniTickerEventMsg = z.infer<typeof MiniTickerEventSchema>;

/** Discriminated union for all stream messages this app consumes. */
export const StreamMessageSchema = z.discriminatedUnion("e", [
  DepthUpdateSchema,
  AggTradeEventSchema,
  MiniTickerEventSchema,
]);
export type StreamMessage = z.infer<typeof StreamMessageSchema>;
