import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import type { components } from "@/lib/api/schema";

type TrendDirection = components["schemas"]["MaterialRate"]["trend_direction"];

// Status color is domain-specific, not the stock-chart default: a rising
// material rate is unfavorable for someone budgeting a build, so "up" wears
// warning, not a neutral/positive color. Always paired with an icon + label,
// never color alone.
const CONFIG: Record<TrendDirection, { Icon: typeof TrendingUp; className: string }> = {
  up: { Icon: TrendingUp, className: "text-warning" },
  down: { Icon: TrendingDown, className: "text-success" },
  flat: { Icon: Minus, className: "text-muted-foreground" },
};

export function TrendBadge({ direction, pct }: { direction: TrendDirection; pct: number }) {
  const { Icon, className } = CONFIG[direction];
  const sign = pct > 0 ? "+" : "";

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${className}`}>
      <Icon className="size-3.5" />
      {sign}
      {pct.toFixed(1)}%
    </span>
  );
}
