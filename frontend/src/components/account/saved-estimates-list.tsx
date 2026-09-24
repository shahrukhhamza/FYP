"use client";

import * as React from "react";
import { Download, Home, Loader2, Trash2 } from "lucide-react";

import { api, API_BASE_URL } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { getToken } from "@/lib/auth/token";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type SavedEstimateSummary = components["schemas"]["SavedEstimateSummary"];

type Status = "loading" | "success" | "error";

async function downloadPdf(id: string, label: string) {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/api/v1/reports/saved-estimates/${id}/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tameer-${label}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export function SavedEstimatesList() {
  const [estimates, setEstimates] = React.useState<SavedEstimateSummary[]>([]);
  const [status, setStatus] = React.useState<Status>("loading");

  const refresh = React.useCallback(async () => {
    const { data, error } = await api.GET("/api/v1/saved-estimates");
    if (error || !data) {
      setStatus("error");
      return;
    }
    setEstimates(data);
    setStatus("success");
  }, []);

  React.useEffect(() => {
    // Fetching on mount — synchronizes with the API, not derivable state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  async function handleDelete(id: string) {
    const { error } = await api.DELETE("/api/v1/saved-estimates/{estimate_id}", {
      params: { path: { estimate_id: id } },
    });
    if (!error) {
      setEstimates((prev) => prev.filter((e) => e.id !== id));
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-40 items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (status === "error") {
    return <p className="text-sm text-muted-foreground">Couldn&apos;t load your saved estimates.</p>;
  }

  if (estimates.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-secondary/20 px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Home className="size-6" strokeWidth={1.75} />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No saved estimates yet</h3>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          Run an instant estimate or renovation estimate, then hit &ldquo;Save this
          estimate&rdquo; to keep it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {estimates.map((estimate) => (
        <Card key={estimate.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{estimate.label}</p>
                <Badge variant="outline" className="capitalize">
                  {estimate.estimate_type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Saved {new Date(estimate.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadPdf(estimate.id, estimate.label)}
              >
                <Download className="size-3.5" />
                PDF
              </Button>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button variant="ghost" size="icon-sm" aria-label="Delete">
                      <Trash2 className="size-3.5" />
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this saved estimate?</AlertDialogTitle>
                    <AlertDialogDescription>
                      &ldquo;{estimate.label}&rdquo; will be permanently removed. This
                      can&apos;t be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(estimate.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
