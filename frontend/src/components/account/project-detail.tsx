"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";
import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { formatPkr } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DiaryFeed } from "@/components/site-diary/diary-feed";

type SavedEstimateRead = components["schemas"]["SavedEstimateRead"];

function totalCostRange(responseData: Record<string, unknown>): string | null {
  const low = responseData.total_cost_low_pkr;
  const high = responseData.total_cost_high_pkr;
  if (typeof low !== "number" || typeof high !== "number") return null;
  return `${formatPkr(low)}–${formatPkr(high)}`;
}

export function ProjectDetail({ estimateId }: { estimateId: string }) {
  const router = useRouter();
  const { status: authStatus } = useAuth();

  const [estimate, setEstimate] = React.useState<SavedEstimateRead | null>(null);
  const [status, setStatus] = React.useState<"loading" | "success" | "error">("loading");

  React.useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/login");
    }
  }, [authStatus, router]);

  React.useEffect(() => {
    if (authStatus !== "authenticated") return;

    // Fetching in response to auth becoming ready — synchronizes with the
    // API, not derivable state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("loading");
    api
      .GET("/api/v1/saved-estimates/{estimate_id}", {
        params: { path: { estimate_id: estimateId } },
      })
      .then(({ data, error }) => {
        if (error || !data) {
          setStatus("error");
          return;
        }
        setEstimate(data);
        setStatus("success");
      });
  }, [authStatus, estimateId]);

  if (authStatus === "loading" || authStatus === "unauthenticated" || status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "error" || !estimate) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <p className="text-muted-foreground">
          Couldn&apos;t find this project &mdash; it may have been deleted.
        </p>
        <Button className="mt-4" render={<Link href="/account" />}>
          Back to My Estimates
        </Button>
      </section>
    );
  }

  const total = totalCostRange(estimate.response_data);

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <Button variant="ghost" size="sm" className="mb-4" render={<Link href="/account" />}>
        <ArrowLeft className="size-3.5" />
        My Estimates
      </Button>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{estimate.label}</h1>
        <Badge variant="outline" className="capitalize">
          {estimate.estimate_type}
        </Badge>
      </div>

      <Card className="mb-8">
        <CardContent className="flex flex-wrap items-center gap-8">
          {total && (
            <div>
              <p className="text-xs text-muted-foreground">Estimated total cost</p>
              <p className="text-2xl font-semibold tabular-nums tracking-tight">{total}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Saved</p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {new Date(estimate.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <DiaryFeed estimateId={estimate.id} />
    </section>
  );
}
