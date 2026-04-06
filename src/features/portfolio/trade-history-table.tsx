import type { TradeHistory } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

interface TradeHistoryTableProps {
  trades: TradeHistory[];
}

const COLS = ["Symbol", "Side", "Price (USDT)", "Qty", "Total (USDT)", "P&L", "Date"] as const;

export function TradeHistoryTable({ trades }: TradeHistoryTableProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <tr>
            {COLS.map((col, i) => (
              <TableHead
                key={col}
                className={cn("text-xs font-medium py-2.5", i >= 2 && "text-right")}
              >
                {col}
              </TableHead>
            ))}
          </tr>
        </TableHeader>
        <TableBody>
          {trades.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-mono font-semibold">{t.symbol}</TableCell>
              <TableCell
                className={cn(
                  "uppercase font-semibold",
                  t.side === "buy" ? "text-trading-bid" : "text-trading-ask",
                )}
              >
                {t.side}
              </TableCell>
              <TableCell className="text-right">
                {t.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">{t.qty}</TableCell>
              <TableCell className="text-right">
                {t.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-semibold",
                  t.pnl >= 0 ? "text-trading-profit" : "text-trading-loss",
                )}
              >
                {t.pnl >= 0 ? "+" : ""}
                {t.pnl.toFixed(2)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">{t.time}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
