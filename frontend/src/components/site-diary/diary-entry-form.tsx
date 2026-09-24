"use client";

import * as React from "react";
import { Camera, Loader2, Send } from "lucide-react";

import { API_BASE_URL } from "@/lib/api/client";
import { getToken } from "@/lib/auth/token";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DiaryEntryForm({
  estimateId,
  onPosted,
}: {
  estimateId: string;
  onPosted: () => void;
}) {
  const [note, setNote] = React.useState("");
  const [photo, setPhoto] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;

    setStatus("loading");
    setError(null);

    const form = new FormData();
    form.append("note", note.trim());
    if (photo) form.append("photo", photo);

    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/v1/saved-estimates/${estimateId}/diary`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setStatus("error");
      setError(body?.detail ?? "Couldn't post this update. Try again.");
      return;
    }

    setNote("");
    setPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setStatus("idle");
    onPosted();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border/70 bg-secondary/20 p-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Textarea
        placeholder="What happened on site today? (e.g. Foundation cast, west wing complete.)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        required
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            id="diary-photo"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="size-3.5" />
            {photo ? photo.name : "Add photo"}
          </Button>
          {photo && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setPhoto(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Remove
            </Button>
          )}
        </div>
        <Button type="submit" size="sm" disabled={status === "loading" || !note.trim()}>
          {status === "loading" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Send className="size-3.5" />
          )}
          Post update
        </Button>
      </div>
    </form>
  );
}
