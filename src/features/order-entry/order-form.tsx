import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
  onSubmit: (data: OrderFormData) => void | Promise<void>;
  isLoading?: boolean;
}

export function OrderForm({ symbol, onSubmit, isLoading = false }: OrderFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: { symbol, side: "buy", type: "limit", quantity: "", price: "" },
  });

  const side = watch("side");
  const type = watch("type");
  const busy = isLoading || isSubmitting;

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
    await onSubmit(data);
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

      {/* Quick-fill shortcuts — disabled until portfolio store is connected */}
      <div className="flex gap-1.5 bg-muted p-1 rounded-md">
        {(["25%", "50%", "75%", "100%"] as const).map((pct) => (
          <Button
            key={pct}
            type="button"
            intent="segment"
            size="sm"
            className="flex-1 rounded-sm text-xs"
            disabled
            title="Requires portfolio store (coming soon)"
          >
            {pct}
          </Button>
        ))}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        intent={side === "buy" ? "buy" : "sell"}
        size="sm"
        className="w-full"
        disabled={busy}
      >
        {busy
          ? "Placing..."
          : `${side === "buy" ? "Buy" : "Sell"} ${type === "limit" ? "Limit" : "Market"}`}
      </Button>
    </form>
  );
}
