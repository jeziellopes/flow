import { Children, isValidElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
  title: string;
  children: ReactNode;
  className?: string;
  draggable?: boolean;
}

interface PanelHeaderProps {
  extra?: ReactNode;
}

interface PanelContentProps {
  children: ReactNode;
  noScroll?: boolean;
  className?: string;
}

function PanelHeader(_props: PanelHeaderProps) {
  // Slot marker — Panel extracts `extra` from this component's props
  return null;
}

function PanelContent({ children, noScroll = false, className }: PanelContentProps) {
  return (
    <div
      className={cn(
        "flex-1 min-h-0",
        noScroll ? "flex flex-col overflow-hidden" : "overflow-y-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Panel({ title, children, className, draggable = false }: PanelProps) {
  let extra: ReactNode = null;
  const bodyChildren: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === PanelHeader) {
      extra = (child.props as PanelHeaderProps).extra ?? null;
    } else {
      bodyChildren.push(child);
    }
  });

  return (
    <div
      className={cn(
        "bg-card rounded-md border border-border flex flex-col h-full overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          `
        px-3 py-2 border-b border-border shrink-0 flex items-center justify-between gap-2
      `,
          draggable && `cursor-move`,
        )}
      >
        <h2 className="text-xs font-cypher font-semibold tracking-widest uppercase text-foreground select-none">
          {title}
        </h2>
        {extra}
      </div>
      {bodyChildren}
    </div>
  );
}

Panel.Header = PanelHeader;
Panel.Content = PanelContent;
