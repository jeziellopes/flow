import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: React.Ref<HTMLTextAreaElement>;
}

export function Textarea({ className, ref, ...props }: TextareaProps) {
  return (
    <textarea
      ref={ref}
      className={cn(
        `
          flex w-full rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground
          placeholder:text-muted-foreground
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1
          focus-visible:outline-[var(--primary)]
          disabled:opacity-50 disabled:cursor-not-allowed
          resize-none
        `,
        className,
      )}
      {...props}
    />
  );
}
