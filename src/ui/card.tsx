import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        `
          flex flex-col gap-3 p-4 rounded-md border border-border bg-card
          hover:border-primary/30
          transition-all duration-200
        `,
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn("flex items-start justify-between", className)} {...props} />;
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("flex-1", className)} {...props} />;
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div className={cn("border-t border-border pt-1 flex justify-between", className)} {...props} />
  );
}
