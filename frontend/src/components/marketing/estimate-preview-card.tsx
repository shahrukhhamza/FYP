import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Mirrors real output from POST /api/v1/estimate for this exact scenario
// (10 Marla, Rawalpindi, 2 storeys, standard grade) so this illustration
// doesn't visually disagree with the real /estimate page. Kept static
// (not live-fetched) so the landing page stays resilient if the API is down.
const BREAKDOWN = [
  { label: "Structure & steel", value: 39.2, color: "var(--chart-1)" },
  { label: "Cement & masonry", value: 7.4, color: "var(--chart-2)" },
  { label: "Electrical & plumbing", value: 12.2, color: "var(--chart-3)" },
  { label: "Woodwork & doors", value: 9.5, color: "var(--chart-4)" },
  { label: "Tiles, paint & finishing", value: 31.8, color: "var(--chart-6)" },
];

export function EstimatePreviewCard() {
  return (
    <Card className="w-full max-w-md gap-0 overflow-hidden border-border/70 py-0 shadow-xl shadow-primary/5">
      <CardHeader className="gap-2 border-b border-border/60 bg-secondary/50 !pb-4 pt-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">Sample estimate</p>
          <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
            Rates updated today
          </Badge>
        </div>
        <p className="text-sm font-semibold text-foreground">
          10 Marla &middot; 2 Storeys &middot; Rawalpindi &middot; Standard
        </p>
      </CardHeader>
      <CardContent className="space-y-5 py-5">
        <div>
          <p className="text-xs text-muted-foreground">Estimated total cost</p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            PKR 107.0L&ndash;125.6L
          </p>
        </div>

        <Separator />

        <div className="space-y-3">
          {BREAKDOWN.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground">{item.value}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${item.value}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
