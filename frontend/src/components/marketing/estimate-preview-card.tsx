import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const BREAKDOWN = [
  { label: "Structure & steel", value: 34, color: "var(--chart-1)" },
  { label: "Cement & masonry", value: 22, color: "var(--chart-2)" },
  { label: "Electrical & plumbing", value: 15, color: "var(--chart-3)" },
  { label: "Woodwork & doors", value: 12, color: "var(--chart-4)" },
  { label: "Tiles, paint & finishing", value: 17, color: "var(--chart-6)" },
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
          10 Marla &middot; Double Storey &middot; Rawalpindi &middot; B-Grade
        </p>
      </CardHeader>
      <CardContent className="space-y-5 py-5">
        <div>
          <p className="text-xs text-muted-foreground">Estimated total cost</p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            PKR 42.8L&ndash;48.2L
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
