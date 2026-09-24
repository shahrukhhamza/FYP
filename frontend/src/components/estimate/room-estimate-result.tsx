import { Info } from "lucide-react";

import type { components } from "@/lib/api/schema";
import { formatPkr, ROOM_TYPE_LABELS } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CategoryBars } from "@/components/breakdown/category-bars";
import { CategoryAccordion } from "@/components/breakdown/category-accordion";
import { ReportActions } from "@/components/breakdown/report-actions";
import { SourcedBadge } from "@/components/breakdown/sourced-badge";

type RoomEstimateResponse = components["schemas"]["RoomEstimateResponse"];
type RoomEstimateRequest = components["schemas"]["RoomEstimateRequest"];

export function RoomEstimateResult({
  result,
  request,
}: {
  result: RoomEstimateResponse;
  request: RoomEstimateRequest;
}) {
  const roomSummary = request.rooms
    .map((r) => `${r.count}× ${ROOM_TYPE_LABELS[r.room_type]} (${r.length_ft}×${r.width_ft}ft)`)
    .join(", ");
  const defaultLabel = `Rooms · ${result.total_floor_area_sqft} sqft`;

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
          <p className="text-sm font-semibold text-foreground">{roomSummary}</p>
        </CardHeader>

        <CardContent className="space-y-6 py-5">
          <div>
            <p className="text-xs text-muted-foreground">Estimated total cost</p>
            <p className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
              {formatPkr(result.total_cost_low_pkr)}&ndash;{formatPkr(result.total_cost_high_pkr)}
            </p>
            <div className="mt-1.5">
              <SourcedBadge date={result.rates_sourced_date} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Floor area (exact, from your rooms)</p>
              <p className="text-xl font-semibold tabular-nums tracking-tight text-foreground">
                {result.total_floor_area_sqft.toLocaleString()}{" "}
                <span className="text-sm font-medium text-muted-foreground">sqft</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Wall area (exact, after openings)</p>
              <p className="text-xl font-semibold tabular-nums tracking-tight text-foreground">
                {result.total_wall_area_sqft.toLocaleString()}{" "}
                <span className="text-sm font-medium text-muted-foreground">sqft</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Wet area</p>
              <p className="text-base font-semibold tabular-nums text-foreground">
                {result.wet_floor_area_sqft.toLocaleString()}{" "}
                <span className="text-xs font-medium text-muted-foreground">sqft</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dry area</p>
              <p className="text-base font-semibold tabular-nums text-foreground">
                {result.dry_floor_area_sqft.toLocaleString()}{" "}
                <span className="text-xs font-medium text-muted-foreground">sqft</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Doors</p>
              <p className="text-base font-semibold tabular-nums text-foreground">
                {result.total_doors}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Windows</p>
              <p className="text-base font-semibold tabular-nums text-foreground">
                {result.total_windows}
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
