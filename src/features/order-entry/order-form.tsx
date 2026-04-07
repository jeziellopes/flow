import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useBaseAsset, useBestAsk, useQuoteAsset } from "@/stores/market-data";
import { useBalance } from "@/stores/portfolio";
import { useUIStore } from "@/stores/ui";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Tab, TabList } from "@/ui/tabs";

const orderSchema = z
  .object({
    symbol: z.string().min(1, "Symbol is required"),
    side: z.enum(["buy", "sell"]),
    type: z.enum(["market", "limit"]),
    quantity: z
      .string()
      .min(1, "Quantity is required")
      .refine((v) => parseFloat(v) > 0, { message: "Must be positive" }),
    price: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "limit") {
      const n = Number(data.price);
      if (!data.price || Number.isNaN(n) || !Number.isFinite(n) || n <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Limit price required",
          path: ["price"],
        });
      }
    }
  });

export type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
  symbol: string;
  /** Return `{ error }` to show an inline error on the quantity field without resetting. */
  onSubmit: (data: OrderFormData) => Promise<{ error?: string } | undefined>;
  isLoading?: boolean;
  /** Disables submit with "Waiting for market data" when false. */
  isConnected?: boolean;
}

export function OrderForm({
  symbol,
  onSubmit,
  isLoading = false,
  isConnected = true,
}: OrderFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: { symbol, side: "buy", type: "limit", quantity: "", price: "" },
  });

  const side = watch("side");
  const type = watch("type");
  const price = watch("price");
  const busy = isLoading || isSubmitting;

  const base = useBaseAsset();
  const quote = useQuoteAsset();
  const bestAsk = useBestAsk();
  const quoteBalance = useBalance(quote || "USDT");
  const baseBalance = useBalance(base || "BTC");

  /** Fill quantity field based on % of available balance. */
  const handleQuickFill = (pct: number) => {
    if (side === "buy") {
      const refPrice = type === "limit" ? Number(price) : bestAsk !== null ? Number(bestAsk) : null;
      if (refPrice && refPrice > 0) {
        const qty = (Number(quoteBalance) * pct) / refPrice;
        setValue("quantity", qty.toFixed(6).replace(/\.?0+$/, ""));
      }
    } else {
      const qty = Number(baseBalance) * pct;
      setValue("quantity", qty.toFixed(6).replace(/\.?0+$/, ""));
    }
  };

  const selectedPrice = useUIStore((s) => s.selectedPrice);
  const setSelectedPrice = useUIStore((s) => s.setSelectedPrice);

  // When an order book row is clicked, pre-fill the price and switch to limit.
  useEffect(() => {
    if (selectedPrice === null) return;
    setValue("price", selectedPrice.toString());
    setValue("type", "limit");
    setSelectedPrice(null);
  }, [selectedPrice, setValue, setSelectedPrice]);

  const internalSubmit = async (data: OrderFormData) => {
    const result = await onSubmit(data);
    if (result?.error) {
      // Surface balance/gateway errors as inline field errors (AC-5).
      setError("quantity", { message: result.error });
      return;
    }
    reset({ symbol, side: data.side, type: data.type, quantity: "", price: "" });
  };

  const handleTypeChange = (next: string) => {
    setValue("type", next as "limit" | "market");
    if (next === "market") setValue("price", "");
  };

  return (
    <form onSubmit={handleSubmit(internalSubmit)} noValidate className="flex flex-col gap-2.5">
      {/* Order type tabs — top of form*/}
      <TabList
        value={type}
        onValueChange={handleTypeChange}
        aria-label="Order type"
        variant="underline"
      >
        <Tab value="limit">Limit</Tab>
        <Tab value="market">Market</Tab>
      </TabList>

      {/* Side toggle */}
      <div className="flex gap-1.5 bg-muted p-1 rounded-md">
        <Button
          type="button"
          intent={side === "buy" ? "buy" : "segment"}
          size="sm"
          onClick={() => setValue("side", "buy")}
          className="flex-1 rounded-sm"
        >
          Buy
        </Button>
        <Button
          type="button"
          intent={side === "sell" ? "sell" : "segment"}
          size="sm"
          onClick={() => setValue("side", "sell")}
          className="flex-1 rounded-sm"
        >
          Sell
        </Button>
      </div>

      {/* Price — removed entirely on Market (no layout shift via flex-start) */}
      {type === "limit" && (
        <div>
          <label htmlFor="order-price" className="text-xs text-muted-foreground block mb-1">
            Price
          </label>
          <Input
            id="order-price"
            type="number"
            placeholder="0.00"
            {...register("price")}
            disabled={busy}
            step="0.01"
            size="sm"
            aria-invalid={errors.price ? "true" : undefined}
            aria-describedby={errors.price ? "order-price-error" : undefined}
          />
          {errors.price && (
            <p id="order-price-error" role="alert" className="text-xs mt-1 text-destructive">
              {errors.price.message}
            </p>
          )}
        </div>
      )}

      {/* Quantity */}
      <div>
        <label htmlFor="order-quantity" className="text-xs text-muted-foreground block mb-1">
          Quantity
        </label>
        <Input
          id="order-quantity"
          type="number"
          placeholder="0.000"
          {...register("quantity")}
          disabled={busy}
          step="0.001"
          size="sm"
          aria-invalid={errors.quantity ? "true" : undefined}
          aria-describedby={errors.quantity ? "order-quantity-error" : undefined}
        />
        {errors.quantity && (
          <p id="order-quantity-error" role="alert" className="text-xs mt-1 text-destructive">
            {errors.quantity.message}
          </p>
        )}
      </div>

      {/* Available balance */}
      <p className="text-[10px] text-muted-foreground font-mono tabular-nums">
        {side === "buy"
          ? `Available: ${Number(quoteBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })} ${quote}`
          : `Available: ${Number(baseBalance).toFixed(6)} ${base}`}
      </p>

      {/* Quick-fill shortcuts */}
      <div className="flex gap-1.5 bg-muted p-1 rounded-md">
        {([0.25, 0.5, 0.75, 1] as const).map((pct) => (
          <Button
            key={pct}
            type="button"
            intent="segment"
            size="sm"
            className="flex-1 rounded-sm text-xs"
            onClick={() => handleQuickFill(pct)}
          >
            {pct * 100}%
          </Button>
        ))}
      </div>

      {/* Submit — disabled with tooltip when market data not ready (AC-10) */}
      <Button
        type="submit"
        intent={side === "buy" ? "buy" : "sell"}
        size="sm"
        className="w-full"
        disabled={busy || !isConnected}
        title={!isConnected ? "Waiting for market data" : undefined}
      >
        {busy
          ? "Placing..."
          : !isConnected
            ? "Waiting for market data"
            : `${side === "buy" ? "Buy" : "Sell"} ${type === "limit" ? "Limit" : "Market"}`}
      </Button>
    </form>
  );
}
