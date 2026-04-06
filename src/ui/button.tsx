import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-normal transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      intent: {
        primary: "bg-primary text-on-primary hover:bg-primary/90",
        secondary: "bg-secondary text-on-secondary hover:bg-secondary/90",
        danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        buy: "bg-trading-bid text-on-trading-bid font-medium hover:opacity-90",
        sell: "bg-trading-ask text-on-trading-ask font-medium hover:opacity-90",
        tonal: "bg-primary-container text-on-primary-container hover:bg-primary-container/80",
        ghost: "bg-transparent text-foreground hover:bg-muted",
        segment: "bg-background text-muted-foreground hover:text-foreground transition-colors",
      },
      size: {
        icon: "w-6 h-6 p-0 rounded-sm shrink-0",
        xs: "px-1.5 py-0.5 text-xs rounded-sm",
        sm: "px-2 py-1 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  ref?: React.Ref<HTMLButtonElement>;
}

export function Button({ intent, size, className, ref, ...props }: ButtonProps) {
  return (
    <button ref={ref} className={cn(buttonVariants({ intent, size }), className)} {...props} />
  );
}
