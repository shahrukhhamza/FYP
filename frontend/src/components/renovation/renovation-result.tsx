import { Info } from "lucide-react";

import type { components } from "@/lib/api/schema";
import { formatPkr } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CategoryBars } from "@/components/breakdown/category-bars";
import { CategoryAccordion } from "@/components/breakdown/category-accordion";
import { ReportActions } from "@/components/breakdown/report-actions";

type RenovationResponse = components["schemas"]["RenovationResponse"];
type RenovationRequest = components["schemas"]["RenovationRequest"];

export function RenovationResult({
  result,
  request,
}: {
  result: RenovationResponse;
  request: RenovationRequest;
}) {
  const defaultLabel = `Renovation · ${result.floor_area_sqft} sqft`;

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
            {result.floor_area_sqft.toLocaleString()} sqft floor &middot;{" "}
            {result.wall_area_sqft.toLocaleString()} sqft wall
          </p>
        </CardHeader>

        <CardContent className="space-y-6 py-5">
          <div>
            <p className="text-xs text-muted-foreground">Estimated total cost</p>
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              {formatPkr(result.total_cost_low_pkr)}&ndash;{formatPkr(result.total_cost_high_pkr)}
            </p>
          </div>

          <Separator />

          <CategoryBars categories={result.items} />
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardContent className="px-4 py-2">
          <CategoryAccordion categories={result.items} />
        </CardContent>
      </Card>

      <Alert>
        <Info />
        <AlertDescription>{result.disclaimer}</AlertDescription>
      </Alert>

      <ReportActions
        estimateType="renovation"
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
