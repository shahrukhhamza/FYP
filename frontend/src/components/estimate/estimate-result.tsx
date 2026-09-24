import { Info } from "lucide-react";

import type { components } from "@/lib/api/schema";
import {
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CategoryBars } from "@/components/breakdown/category-bars";
import { CategoryAccordion } from "@/components/breakdown/category-accordion";
import { ReportActions } from "@/components/breakdown/report-actions";

type EstimateResponse = components["schemas"]["EstimateResponse"];
type EstimateRequest = components["schemas"]["EstimateRequest"];

export function EstimateResult({
  result,
  request,
}: {
  result: EstimateResponse;
  request: EstimateRequest;
}) {
  const defaultLabel = `${PLOT_SIZE_LABELS[result.plot_size]} · ${CITY_LABELS[result.city]}`;
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
                {result.built_up_area_sqft.toLocaleString()}{" "}
                <span className="text-lg font-medium text-muted-foreground">sqft</span>
              </p>
            </div>
          </div>

          <Separator />

          <CategoryBars categories={result.categories} />
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardContent className="px-4 py-2">
          <CategoryAccordion categories={result.categories} />
        </CardContent>
      </Card>

      <Alert>
        <Info />
        <AlertDescription>{result.disclaimer}</AlertDescription>
      </Alert>

      <ReportActions
        estimateType="house"
        defaultLabel={defaultLabel}
        requestData={request}
        responseData={result}
      />

      <Button variant="outline" className="w-full" size="lg" disabled>
        Request Quotes from Verified Dealers
        <Badge variant="secondary" className="ml-1">
          Coming soon
        </Badge>
      </Button>
    </div>
  );
}
