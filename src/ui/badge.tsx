import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded font-mono transition-colors", {
  variants: {
    variant: {
      // Status badge with primary accent border
      active: "text-[10px] text-primary border border-primary/30 px-1.5 py-0.5",
      // Muted/upcoming status
      muted: "text-[10px] text-muted-foreground border border-border px-1.5 py-0.5",
      // Tag chip (symbol, category)
      pill: "text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5",
      // Numeric stat with dark bg
      stat: "text-xs bg-muted px-2 py-1",
      // Trading side badges
      buy: "text-[10px] px-1.5 py-0.5 text-trading-bid border border-trading-bid/30",
      sell: "text-[10px] px-1.5 py-0.5 text-trading-ask border border-trading-ask/30",
      // Order status
      filled: "text-[10px] px-1.5 py-0.5 text-trading-profit border border-trading-profit/30",
      cancelled: "text-[10px] px-1.5 py-0.5 text-muted-foreground border border-border",
      open: "text-[10px] px-1.5 py-0.5 text-primary border border-primary/30",
    },
  },
  defaultVariants: {
    variant: "pill",
  },
});

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ variant, className, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
