import { Activity, type ReactNode, useState } from "react";
import { BotManagerPanel } from "@/features/bots/bot-manager-panel";
import type { BotInstance, BotStatus } from "@/features/bots/types";
import { OpenOrders } from "@/features/order-entry/open-orders";
import { cn } from "@/lib/utils";
import { Tab, TabList } from "@/ui/tabs";

interface DataPanelProps {
  bots: BotInstance[];
  /** Render slot for the trades tab — caller owns the data subscription. */
  TradesFeedSlot: ReactNode;
  onBotStatusChange: (id: string, status: BotStatus) => void;
  className?: string;
}

const TABS = [
  { value: "trades", label: "My Trades" },
  { value: "orders", label: "Open Orders" },
  { value: "bots", label: "Bots" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

/** Self-contained panel — owns its own chrome matching Panel header height/typography. */
export function DataPanel({ bots, TradesFeedSlot, onBotStatusChange, className }: DataPanelProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("bots");

  return (
    <div
      className={cn(
        "bg-card rounded-md border border-border flex flex-col h-full overflow-hidden",
        className,
      )}
    >
      <div className="border-b border-border shrink-0 cursor-move">
        <TabList
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
          aria-label="Data panel"
          variant="header"
        >
          {TABS.map((t) => (
            <Tab key={t.value} value={t.value}>
              {t.label}
            </Tab>
          ))}
        </TabList>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <Activity mode={activeTab === "trades" ? "visible" : "hidden"}>{TradesFeedSlot}</Activity>
        <Activity mode={activeTab === "orders" ? "visible" : "hidden"}>
          <div className="p-3">
            <OpenOrders />
          </div>
        </Activity>
        <Activity mode={activeTab === "bots" ? "visible" : "hidden"}>
          <BotManagerPanel bots={bots} onStatusChange={onBotStatusChange} />
        </Activity>
      </div>
    </div>
  );
}
