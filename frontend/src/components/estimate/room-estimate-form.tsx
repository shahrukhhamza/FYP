"use client";

import * as React from "react";
import { Loader2, Plus, Ruler, Trash2 } from "lucide-react";

import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { CITY_LABELS, QUALITY_GRADE_LABELS, STOREYS_LABELS } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RoomEstimateResult } from "@/components/estimate/room-estimate-result";
import { ResultSkeleton } from "@/components/breakdown/result-skeleton";
import { ResultEmptyState } from "@/components/breakdown/empty-state";

type City = components["schemas"]["City"];
type QualityGrade = components["schemas"]["QualityGrade"];
type Storeys = components["schemas"]["Storeys"];
type RoomEstimateRequest = components["schemas"]["RoomEstimateRequest"];
type RoomEstimateResponse = components["schemas"]["RoomEstimateResponse"];

const CITIES = Object.keys(CITY_LABELS) as City[];
const QUALITY_GRADES = Object.keys(QUALITY_GRADE_LABELS) as QualityGrade[];
const STOREYS_OPTIONS: Storeys[] = [1, 1.5, 2, 2.5, 3];

interface RoomRow {
  key: string;
  label: string;
  count: string;
  length_ft: string;
  width_ft: string;
}

let rowIdCounter = 0;
function newRow(label = "", count = "1", length_ft = "", width_ft = ""): RoomRow {
  rowIdCounter += 1;
  return { key: `room-${rowIdCounter}`, label, count, length_ft, width_ft };
}

type Status = "idle" | "loading" | "success" | "error";

export function RoomEstimateForm() {
  const [rows, setRows] = React.useState<RoomRow[]>([
    newRow("Bedroom", "4", "12", "12"),
    newRow("Kitchen", "1", "10", "12"),
    newRow("Lounge", "1", "15", "18"),
  ]);
  const [height, setHeight] = React.useState("9");
  const [storeys, setStoreys] = React.useState<Storeys>(1);
  const [city, setCity] = React.useState<City>("islamabad");
  const [qualityGrade, setQualityGrade] = React.useState<QualityGrade>("standard");

  const [status, setStatus] = React.useState<Status>("idle");
  const [result, setResult] = React.useState<RoomEstimateResponse | null>(null);
  const [request, setRequest] = React.useState<RoomEstimateRequest | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  function updateRow(key: string, patch: Partial<RoomRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const rooms = rows
      .filter((r) => r.label.trim() && r.length_ft && r.width_ft)
      .map((r) => ({
        label: r.label.trim(),
        count: Math.max(1, Number(r.count) || 1),
        length_ft: Number(r.length_ft),
        width_ft: Number(r.width_ft),
      }));

    if (rooms.length === 0) {
      setStatus("error");
      setError("Add at least one room with a length and width.");
      return;
    }

    setStatus("loading");
    setError(null);

    const body: RoomEstimateRequest = {
      rooms,
      height_ft: Number(height) || 9,
      storeys,
      city,
      quality_grade: qualityGrade,
    };
    const { data, error: apiError } = await api.POST("/api/v1/room-estimate", { body });

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
    <div className="grid gap-8 lg:grid-cols-[420px_1fr] lg:items-start">
      <Card className="lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Ruler className="size-4.5 text-primary" />
            Your rooms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              {rows.map((row) => (
                <div key={row.key} className="flex items-end gap-2">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label className="text-xs">Room type</Label>
                    <Input
                      placeholder="Bedroom"
                      value={row.label}
                      onChange={(e) => updateRow(row.key, { label: e.target.value })}
                    />
                  </div>
                  <div className="flex w-14 flex-col gap-1.5">
                    <Label className="text-xs">Qty</Label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={row.count}
                      onChange={(e) => updateRow(row.key, { count: e.target.value })}
                    />
                  </div>
                  <div className="flex w-16 flex-col gap-1.5">
                    <Label className="text-xs">L (ft)</Label>
                    <Input
                      type="number"
                      min={1}
                      step="0.5"
                      value={row.length_ft}
                      onChange={(e) => updateRow(row.key, { length_ft: e.target.value })}
                    />
                  </div>
                  <div className="flex w-16 flex-col gap-1.5">
                    <Label className="text-xs">W (ft)</Label>
                    <Input
                      type="number"
                      min={1}
                      step="0.5"
                      value={row.width_ft}
                      onChange={(e) => updateRow(row.key, { width_ft: e.target.value })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove room"
                    onClick={() => removeRow(row.key)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => setRows((prev) => [...prev, newRow()])}
              >
                <Plus className="size-3.5" />
                Add room type
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="room-height">Ceiling height (ft)</Label>
                <Input
                  id="room-height"
                  type="number"
                  min={1}
                  max={20}
                  step="0.5"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="room-storeys">Storeys</Label>
                <Select
                  value={String(storeys)}
                  onValueChange={(v) => setStoreys(Number(v) as Storeys)}
                >
                  <SelectTrigger id="room-storeys" className="w-full">
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
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="room-city">City</Label>
              <Select value={city} onValueChange={(v) => setCity(v as City)}>
                <SelectTrigger id="room-city" className="w-full">
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
              <Label htmlFor="room-quality">Finish quality</Label>
              <Select
                value={qualityGrade}
                onValueChange={(v) => setQualityGrade(v as QualityGrade)}
              >
                <SelectTrigger id="room-quality" className="w-full">
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
            title="Your room-by-room estimate will appear here"
            description="List the rooms you're planning — length, width, and how many — and we'll compute exact floor and wall areas, then price them by material."
          />
        )}
        {status === "loading" && <ResultSkeleton />}
        {status === "success" && result && request && (
          <RoomEstimateResult result={result} request={request} />
        )}
        {status === "error" && <ResultEmptyState />}
      </div>
    </div>
  );
}
