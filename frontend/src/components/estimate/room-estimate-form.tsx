"use client";

import * as React from "react";
import { Loader2, Plus, Ruler, Trash2 } from "lucide-react";

import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import {
  CITY_LABELS,
  QUALITY_GRADE_LABELS,
  ROOM_TYPE_LABELS,
  STOREYS_LABELS,
  WET_ROOM_TYPES,
} from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
type RoomType = components["schemas"]["RoomType"];
type RoomEstimateRequest = components["schemas"]["RoomEstimateRequest"];
type RoomEstimateResponse = components["schemas"]["RoomEstimateResponse"];

const CITIES = Object.keys(CITY_LABELS) as City[];
const QUALITY_GRADES = Object.keys(QUALITY_GRADE_LABELS) as QualityGrade[];
const ROOM_TYPES = Object.keys(ROOM_TYPE_LABELS) as RoomType[];
const STOREYS_OPTIONS: Storeys[] = [1, 1.5, 2, 2.5, 3];

interface RoomRow {
  key: string;
  room_type: RoomType;
  count: string;
  length_ft: string;
  width_ft: string;
  doors: string;
  windows: string;
}

let rowIdCounter = 0;
function newRow(
  room_type: RoomType = "bedroom",
  count = "1",
  length_ft = "",
  width_ft = "",
  doors = "1",
  windows = "1",
): RoomRow {
  rowIdCounter += 1;
  return { key: `room-${rowIdCounter}`, room_type, count, length_ft, width_ft, doors, windows };
}

type Status = "idle" | "loading" | "success" | "error";

export function RoomEstimateForm() {
  const [rows, setRows] = React.useState<RoomRow[]>([
    newRow("bedroom", "4", "12", "12", "1", "2"),
    newRow("kitchen", "1", "10", "12", "1", "1"),
    newRow("bathroom", "2", "6", "7", "1", "1"),
    newRow("lounge", "1", "15", "18", "2", "3"),
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
      .filter((r) => r.length_ft && r.width_ft)
      .map((r) => ({
        room_type: r.room_type,
        count: Math.max(1, Number(r.count) || 1),
        length_ft: Number(r.length_ft),
        width_ft: Number(r.width_ft),
        doors: Math.max(0, Number(r.doors) || 0),
        windows: Math.max(0, Number(r.windows) || 0),
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
    <div className="grid gap-8 lg:grid-cols-[460px_1fr] lg:items-start">
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
                <div
                  key={row.key}
                  className="flex flex-col gap-2 rounded-lg border border-border/60 bg-secondary/30 p-3"
                >
                  <div className="flex items-end gap-2">
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Label className="text-xs">Room type</Label>
                      <Select
                        value={row.room_type}
                        onValueChange={(v) => updateRow(row.key, { room_type: v as RoomType })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>{(v: RoomType) => ROOM_TYPE_LABELS[v]}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {ROOM_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {ROOM_TYPE_LABELS[t]}
                              {WET_ROOM_TYPES.has(t) ? " (wet area)" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex w-16 flex-col gap-1.5">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={row.count}
                        onChange={(e) => updateRow(row.key, { count: e.target.value })}
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

                  <div className="grid grid-cols-4 gap-2">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">L (ft)</Label>
                      <Input
                        type="number"
                        min={1}
                        step="0.5"
                        value={row.length_ft}
                        onChange={(e) => updateRow(row.key, { length_ft: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">W (ft)</Label>
                      <Input
                        type="number"
                        min={1}
                        step="0.5"
                        value={row.width_ft}
                        onChange={(e) => updateRow(row.key, { width_ft: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Doors</Label>
                      <Input
                        type="number"
                        min={0}
                        max={5}
                        value={row.doors}
                        onChange={(e) => updateRow(row.key, { doors: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Windows</Label>
                      <Input
                        type="number"
                        min={0}
                        max={6}
                        value={row.windows}
                        onChange={(e) => updateRow(row.key, { windows: e.target.value })}
                      />
                    </div>
                  </div>
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

            <Badge variant="outline" className="w-fit text-xs font-normal text-muted-foreground">
              Wet areas (kitchen/bathroom) are priced higher per sqft — real tiling &amp; fixture
              density, not a flat guess.
            </Badge>

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
            description="List the rooms you're planning — type, size, doors and windows — and we'll compute exact floor and wall areas, split wet vs dry, then price them by material."
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
