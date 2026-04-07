import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const pageHeaderVariants = cva("flex items-center justify-between", {
  variants: {
    size: {
      sm: "mb-4",
      md: "mb-6",
      lg: "mb-8",
    },
  },
  defaultVariants: { size: "md" },
});

export type PageHeaderProps = VariantProps<typeof pageHeaderVariants> & {
  title: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function PageHeader({ title, action, size, className }: PageHeaderProps) {
  return (
    <div className={cn(pageHeaderVariants({ size }), className)}>
      <h1 className="text-2xl font-cypher font-semibold tracking-wide text-primary">{title}</h1>
      {action}
    </div>
  );
}
