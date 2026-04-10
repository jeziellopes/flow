import { cn } from "@/lib/utils";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  ref?: React.Ref<HTMLInputElement>;
  size?: "sm" | "md";
}

export function Input({ className, size = "md", ref, ...props }: InputProps) {
  return (
    <input
      ref={ref}
      className={cn(
        `
          flex w-full rounded-md border border-input bg-input px-3 font-mono tabular-nums
          text-foreground
          placeholder:text-muted-foreground
          focus-visible:outline focus-visible:outline-offset-1 focus-visible:outline-primary
          disabled:opacity-50 disabled:cursor-not-allowed
        `,
        size === "sm" ? "h-8 py-1 text-sm" : "h-10 py-2 text-base",
        className,
      )}
      {...props}
    />
  );
}
