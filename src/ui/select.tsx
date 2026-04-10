import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  ref?: React.Ref<HTMLSelectElement>;
}

export function Select({ className, ref, ...props }: SelectProps) {
  return (
    <select
      ref={ref}
      className={cn(
        `
          flex w-full rounded-md border border-input bg-input px-3 h-8 py-1 text-sm text-foreground
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1
          focus-visible:outline-[var(--primary)]
          disabled:opacity-50 disabled:cursor-not-allowed
        `,
        className,
      )}
      {...props}
    />
  );
}
