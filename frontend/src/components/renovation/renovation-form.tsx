"use client";

import * as React from "react";
import { Hammer, Loader2 } from "lucide-react";

import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { CITY_LABELS, QUALITY_GRADE_LABELS, WORK_ITEM_LABELS } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RenovationResult } from "@/components/renovation/renovation-result";
import { ResultSkeleton } from "@/components/breakdown/result-skeleton";
import { ResultEmptyState } from "@/components/breakdown/empty-state";

type City = components["schemas"]["City"];
type QualityGrade = components["schemas"]["QualityGrade"];
type WorkItem = components["schemas"]["RenovationWorkItem"];
type RenovationResponse = components["schemas"]["RenovationResponse"];
type RenovationRequest = components["schemas"]["RenovationRequest"];

const WORK_ITEMS = Object.keys(WORK_ITEM_LABELS) as WorkItem[];
const CITIES = Object.keys(CITY_LABELS) as City[];
const QUALITY_GRADES = Object.keys(QUALITY_GRADE_LABELS) as QualityGrade[];

type Status = "idle" | "loading" | "success" | "error";

export function RenovationForm() {
  const [length, setLength] = React.useState("10");
  const [width, setWidth] = React.useState("10");
  const [height, setHeight] = React.useState("9");
  const [workItems, setWorkItems] = React.useState<WorkItem[]>(["floor_tiling"]);
  const [city, setCity] = React.useState<City>("islamabad");
  const [qualityGrade, setQualityGrade] = React.useState<QualityGrade>("standard");

  const [status, setStatus] = React.useState<Status>("idle");
  const [result, setResult] = React.useState<RenovationResponse | null>(null);
  const [request, setRequest] = React.useState<RenovationRequest | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  function toggleWorkItem(item: WorkItem, checked: boolean) {
    setWorkItems((prev) => (checked ? [...prev, item] : prev.filter((i) => i !== item)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (workItems.length === 0) {
      setStatus("error");
      setError("Pick at least one type of work (tiling, painting, or plastering).");
      return;
    }

    setStatus("loading");
    setError(null);

    const body: RenovationRequest = {
      length_ft: Number(length),
      width_ft: Number(width),
      height_ft: Number(height),
      work_items: workItems,
      city,
      quality_grade: qualityGrade,
    };
    const { data, error: apiError } = await api.POST("/api/v1/renovation", { body });

    if (apiError || !data) {
      setStatus("error");
      setError(
        "Couldn't reach the estimate service. Make sure the backend is running and try again.",
      );
      return;
    }

    setRequest(body);
    setResult(data);
    setStatus("success");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr] lg:items-start">
      <Card className="lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Hammer className="size-4.5 text-primary" />
            Your room
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="length">Length (ft)</Label>
                <Input
                  id="length"
                  type="number"
                  min={1}
                  max={200}
                  step="0.5"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="width">Width (ft)</Label>
                <Input
                  id="width"
                  type="number"
                  min={1}
                  max={200}
                  step="0.5"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="height">Height (ft)</Label>
                <Input
                  id="height"
                  type="number"
                  min={1}
                  max={20}
                  step="0.5"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <Label>Work needed</Label>
              {WORK_ITEMS.map((item) => (
                <label key={item} className="flex items-center gap-2.5 text-sm">
                  <Checkbox
                    checked={workItems.includes(item)}
                    onCheckedChange={(checked) => toggleWorkItem(item, checked === true)}
                  />
                  {WORK_ITEM_LABELS[item]}
                </label>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reno-city">City</Label>
              <Select value={city} onValueChange={(v) => setCity(v as City)}>
                <SelectTrigger id="reno-city" className="w-full">
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
              <Label htmlFor="reno-quality">Finish quality</Label>
              <Select
                value={qualityGrade}
                onValueChange={(v) => setQualityGrade(v as QualityGrade)}
              >
                <SelectTrigger id="reno-quality" className="w-full">
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

        {status === "idle" && (
          <ResultEmptyState
            title="Your renovation estimate will appear here"
            description="Fill in your room dimensions and the work you need on the left, and we'll break down the cost by tiling, painting, or plastering — at today's rates."
          />
        )}
        {status === "loading" && <ResultSkeleton />}
        {status === "success" && result && request && (
          <RenovationResult result={result} request={request} />
        )}
        {status === "error" && <ResultEmptyState />}
      </div>
    </div>
  );
}
