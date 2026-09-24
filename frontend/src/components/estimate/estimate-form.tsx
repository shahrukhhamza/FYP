"use client";

import * as React from "react";
import { Calculator, Loader2 } from "lucide-react";

import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import {
  CITY_LABELS,
  PLOT_SIZE_LABELS,
  QUALITY_GRADE_LABELS,
  STOREYS_LABELS,
} from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EstimateResult } from "@/components/estimate/estimate-result";
import { ResultSkeleton } from "@/components/breakdown/result-skeleton";
import { ResultEmptyState } from "@/components/breakdown/empty-state";

type PlotSize = components["schemas"]["PlotSize"];
type City = components["schemas"]["City"];
type QualityGrade = components["schemas"]["QualityGrade"];
type Storeys = components["schemas"]["Storeys"];
type EstimateResponse = components["schemas"]["EstimateResponse"];

const PLOT_SIZES = Object.keys(PLOT_SIZE_LABELS) as PlotSize[];
const CITIES = Object.keys(CITY_LABELS) as City[];
const QUALITY_GRADES = Object.keys(QUALITY_GRADE_LABELS) as QualityGrade[];
const STOREYS_OPTIONS: Storeys[] = [1, 1.5, 2, 2.5, 3];

type Status = "idle" | "loading" | "success" | "error";

export function EstimateForm() {
  const [plotSize, setPlotSize] = React.useState<PlotSize>("10_marla");
  const [city, setCity] = React.useState<City>("islamabad");
  const [storeys, setStoreys] = React.useState<Storeys>(2);
  const [qualityGrade, setQualityGrade] = React.useState<QualityGrade>("standard");

  const [status, setStatus] = React.useState<Status>("idle");
  const [result, setResult] = React.useState<EstimateResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const { data, error: apiError } = await api.POST("/api/v1/estimate", {
      body: { plot_size: plotSize, city, storeys, quality_grade: qualityGrade },
    });

    if (apiError || !data) {
      setStatus("error");
      setError(
        "Couldn't reach the estimate service. Make sure the backend is running and try again.",
      );
      return;
    }

    setResult(data);
    setStatus("success");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr] lg:items-start">
      <Card className="lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="size-4.5 text-primary" />
            Your project details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plot-size">Plot size</Label>
              <Select value={plotSize} onValueChange={(v) => setPlotSize(v as PlotSize)}>
                <SelectTrigger id="plot-size" className="w-full">
                  <SelectValue>{(v: PlotSize) => PLOT_SIZE_LABELS[v]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PLOT_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {PLOT_SIZE_LABELS[size]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">City</Label>
              <Select value={city} onValueChange={(v) => setCity(v as City)}>
                <SelectTrigger id="city" className="w-full">
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
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="storeys">Storeys</Label>
              <Select
                value={String(storeys)}
                onValueChange={(v) => setStoreys(Number(v) as Storeys)}
              >
                <SelectTrigger id="storeys" className="w-full">
                  <SelectValue>{(v: string) => STOREYS_LABELS[v]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STOREYS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {STOREYS_LABELS[String(s)]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quality-grade">Finish quality</Label>
              <Select
                value={qualityGrade}
                onValueChange={(v) => setQualityGrade(v as QualityGrade)}
              >
                <SelectTrigger id="quality-grade" className="w-full">
                  <SelectValue>{(v: QualityGrade) => QUALITY_GRADE_LABELS[v]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {QUALITY_GRADES.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {QUALITY_GRADE_LABELS[grade]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" size="lg" className="mt-1" disabled={status === "loading"}>
              {status === "loading" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Calculating&hellip;
                </>
              ) : (
                "Get Instant Estimate"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        {status === "error" && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status === "idle" && <ResultEmptyState />}
        {status === "loading" && <ResultSkeleton />}
        {status === "success" && result && <EstimateResult result={result} />}
        {status === "error" && <ResultEmptyState />}
      </div>
    </div>
  );
}
