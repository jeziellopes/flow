import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full text-xs font-mono tabular-nums", className)} {...props} />;
}

export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("sticky top-0 bg-card border-b border-border", className)} {...props} />
  );
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("", className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        `
          border-b border-border/40
          hover:bg-muted/30
          transition-colors
        `,
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("px-3 py-1.5 text-left font-medium text-muted-foreground", className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-3 py-1", className)} {...props} />;
}
