import type { components } from "@/lib/api/schema";
import { CATEGORY_COLORS, formatPkr } from "@/lib/labels";

type CategoryBreakdown = components["schemas"]["CategoryBreakdown"];

export function CategoryBars({ categories }: { categories: CategoryBreakdown[] }) {
  return (
    <div className="space-y-3">
      {categories.map((cat) => (
        <div key={cat.category} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{cat.label}</span>
            <span className="font-medium text-foreground">
              {formatPkr(cat.cost_pkr)} &middot; {cat.percentage}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${cat.percentage}%`,
                backgroundColor: CATEGORY_COLORS[cat.category] ?? "var(--chart-5)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
