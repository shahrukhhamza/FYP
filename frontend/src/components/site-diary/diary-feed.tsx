"use client";

import * as React from "react";
import { Loader2, ScrollText, Trash2 } from "lucide-react";

import { api, API_BASE_URL } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { Button } from "@/components/ui/button";
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
import { AuthedImage } from "@/components/site-diary/authed-image";
import { DiaryEntryForm } from "@/components/site-diary/diary-entry-form";

type DiaryEntry = components["schemas"]["SiteDiaryEntryRead"];
type Status = "loading" | "success" | "error";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function DiaryFeed({ estimateId }: { estimateId: string }) {
  const [entries, setEntries] = React.useState<DiaryEntry[]>([]);
  const [status, setStatus] = React.useState<Status>("loading");

  const refresh = React.useCallback(async () => {
    const { data, error } = await api.GET("/api/v1/saved-estimates/{estimate_id}/diary", {
      params: { path: { estimate_id: estimateId } },
    });
    if (error || !data) {
      setStatus("error");
      return;
    }
    setEntries(data);
    setStatus("success");
  }, [estimateId]);

  React.useEffect(() => {
    // Fetching on mount — synchronizes with the API, not derivable state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  async function handleDelete(id: string) {
    const { error } = await api.DELETE("/api/v1/site-diary/{entry_id}", {
      params: { path: { entry_id: id } },
    });
    if (!error) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ScrollText className="size-4.5 text-primary" />
          Site Diary
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Dated updates from the site &mdash; built for owners who can&apos;t be there in person.
        </p>
      </div>

      <DiaryEntryForm estimateId={estimateId} onPosted={refresh} />

      {status === "loading" && (
        <div className="flex justify-center py-8 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      )}

      {status === "error" && (
        <p className="text-sm text-muted-foreground">Couldn&apos;t load the site diary.</p>
      )}

      {status === "success" && entries.length === 0 && (
        <div className="rounded-xl border border-dashed border-border/70 bg-secondary/20 px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No updates yet. Post the first one above.
          </p>
        </div>
      )}

      {status === "success" && entries.length > 0 && (
        <ol className="space-y-4 border-l border-border/70 pl-5">
          {entries.map((entry) => (
            <li key={entry.id} className="relative">
              <span className="absolute top-1.5 -left-[27px] size-2.5 rounded-full border-2 border-background bg-primary" />
              <div className="rounded-xl border border-border/70 bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.10)] dark:border-white/8 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_12px_28px_-10px_rgba(0,0,0,0.55)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {entry.author_name} &middot; {formatDate(entry.created_at)}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button variant="ghost" size="icon-sm" aria-label="Delete update">
                          <Trash2 className="size-3.5" />
                        </Button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this update?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This diary entry will be permanently removed. This can&apos;t be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(entry.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <p className="mt-2 text-sm text-foreground">{entry.note}</p>
                {entry.has_photo && (
                  <AuthedImage
                    src={`${API_BASE_URL}/api/v1/site-diary/${entry.id}/photo`}
                    alt="Site update"
                    className="mt-3 max-h-80 w-full rounded-lg object-cover"
                  />
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
