"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { CITY_LABELS, formatPkr } from "@/lib/labels";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkline } from "@/components/ui/sparkline";
import { TrendBadge } from "@/components/rates/trend-badge";

type City = components["schemas"]["City"];
type RatesResponse = components["schemas"]["RatesResponse"];

const CITIES = Object.keys(CITY_LABELS) as City[];

export function RatesTable() {
  const [city, setCity] = React.useState<City>("islamabad");
  const [data, setData] = React.useState<RatesResponse | null>(null);
  const [status, setStatus] = React.useState<"loading" | "success" | "error">("loading");

  React.useEffect(() => {
    let cancelled = false;
    // Kicking off a fetch in response to `city` changing and marking it
    // loading; this synchronizes with an external system (the API), not
    // derivable state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("loading");

    api.GET("/api/v1/rates", { params: { query: { city } } }).then(({ data, error }) => {
      if (cancelled) return;
      if (error || !data) {
        setStatus("error");
        return;
      }
      setData(data);
      setStatus("success");
    });

    return () => {
      cancelled = true;
    };
  }, [city]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Select value={city} onValueChange={(v) => setCity(v as City)}>
          <SelectTrigger className="w-44">
            <SelectValue>{(v: City) => CITY_LABELS[v]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {CITIES.map((c) => (
              <SelectItem key={c} value={c}>
                {CITY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {status === "loading" && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Updating&hellip;
          </span>
        )}
      </div>

      {status === "error" && (
        <Alert variant="destructive">
          <AlertDescription>
            Couldn&apos;t reach the rates service. Make sure the backend is running and try again.
          </AlertDescription>
        </Alert>
      )}

      {data && (
        <Card className="py-0">
          <CardContent className="px-0 py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead className="text-right">
                    <span className="sm:hidden">Trend</span>
                    <span className="hidden sm:inline">14-day trend</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rates.map((rate) => (
                  <TableRow key={rate.material}>
                    <TableCell className="font-medium">{rate.label}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatPkr(rate.rate_pkr)}{" "}
                      <span className="hidden text-xs sm:inline">{rate.unit}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-3">
                        <TrendBadge direction={rate.trend_direction} pct={rate.trend_pct} />
                        <Sparkline
                          values={rate.history.map((h) => h.rate_pkr)}
                          className="hidden sm:block"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {data && <p className="text-xs text-muted-foreground">{data.disclaimer}</p>}
    </div>
  );
}
