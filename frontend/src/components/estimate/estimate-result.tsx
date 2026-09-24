import { Info } from "lucide-react";

import type { components } from "@/lib/api/schema";
import {
  CATEGORY_COLORS,
  CITY_LABELS,
  PLOT_SIZE_LABELS,
  QUALITY_GRADE_LABELS,
  STOREYS_LABELS,
  formatPkr,
} from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";

type EstimateResponse = components["schemas"]["EstimateResponse"];

export function EstimateResult({ result }: { result: EstimateResponse }) {
  return (
    <div className="space-y-6">
      <Card className="gap-0 overflow-hidden py-0">
        <CardHeader className="gap-2 border-b border-border/60 bg-secondary/50 !pb-4 pt-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Your estimate</p>
            <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
              Generated just now
            </Badge>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {PLOT_SIZE_LABELS[result.plot_size]} &middot; {STOREYS_LABELS[String(result.storeys)]}{" "}
            &middot; {CITY_LABELS[result.city]} &middot; {QUALITY_GRADE_LABELS[result.quality_grade]}
          </p>
        </CardHeader>

        <CardContent className="space-y-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Estimated total cost</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">
                {formatPkr(result.total_cost_low_pkr)}&ndash;{formatPkr(result.total_cost_high_pkr)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Built-up area</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">
                {result.built_up_area_sqft.toLocaleString()} <span className="text-lg font-medium text-muted-foreground">sqft</span>
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            {result.categories.map((cat) => (
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
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardContent className="px-4 py-2">
          <Accordion>
            {result.categories.map((cat) => (
              <AccordionItem key={cat.category} value={cat.category}>
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[cat.category] ?? "var(--chart-5)" }}
                    />
                    {cat.label}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {cat.materials && cat.materials.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-muted-foreground">
                            <th className="pb-2 font-medium">Material</th>
                            <th className="pb-2 font-medium">Quantity</th>
                            <th className="pb-2 font-medium">Rate</th>
                            <th className="pb-2 text-right font-medium">Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cat.materials.map((m) => (
                            <tr key={m.material} className="border-t border-border/50">
                              <td className="py-2 pr-2">{m.material}</td>
                              <td className="py-2 pr-2 text-muted-foreground">
                                {m.quantity.toLocaleString()} {m.unit}
                              </td>
                              <td className="py-2 pr-2 text-muted-foreground">
                                {formatPkr(m.rate_pkr)}
                              </td>
                              <td className="py-2 text-right font-medium">{formatPkr(m.cost_pkr)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Flat per-sqft benchmark for this category &mdash; not yet broken down by
                      individual material.
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Alert>
        <Info />
        <AlertDescription>{result.disclaimer}</AlertDescription>
      </Alert>

      <Button variant="outline" className="w-full" size="lg" disabled>
        Request Quotes from Verified Dealers
        <Badge variant="secondary" className="ml-1">
          Coming soon
        </Badge>
      </Button>
    </div>
  );
}
