"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Download, Loader2, Save } from "lucide-react";

import { api, API_BASE_URL } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

type EstimateType = "house" | "renovation";
type SaveStatus = "idle" | "loading" | "success" | "error";

export function ReportActions({
  estimateType,
  defaultLabel,
  requestData,
  responseData,
}: {
  estimateType: EstimateType;
  defaultLabel: string;
  requestData: Record<string, unknown>;
  responseData: Record<string, unknown>;
}) {
  const { status: authStatus } = useAuth();

  const [pdfLoading, setPdfLoading] = React.useState(false);
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [label, setLabel] = React.useState(defaultLabel);
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("idle");

  async function handleDownloadPdf() {
    setPdfLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/reports/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estimate_type: estimateType,
          label: defaultLabel,
          request_data: requestData,
          response_data: responseData,
        }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tameer-${estimateType}-estimate.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveStatus("loading");
    const { error } = await api.POST("/api/v1/saved-estimates", {
      body: {
        estimate_type: estimateType,
        label,
        request_data: requestData,
        response_data: responseData,
      },
    });
    if (error) {
      setSaveStatus("error");
      return;
    }
    setSaveStatus("success");
    setTimeout(() => setSaveOpen(false), 1000);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button variant="outline" className="flex-1" onClick={handleDownloadPdf} disabled={pdfLoading}>
        {pdfLoading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Download PDF
      </Button>

      {authStatus === "authenticated" ? (
        <Dialog
          open={saveOpen}
          onOpenChange={(open) => {
            setSaveOpen(open);
            if (open) setSaveStatus("idle");
          }}
        >
          <DialogTrigger
            render={
              <Button variant="outline" className="flex-1">
                <Save className="size-4" />
                Save this estimate
              </Button>
            }
          />
          <DialogContent>
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>Save this estimate</DialogTitle>
                <DialogDescription>
                  Give it a name so you can find it later in My Estimates.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="estimate-label">Name</Label>
                <Input
                  id="estimate-label"
                  className="mt-1.5"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                  autoFocus
                />
                {saveStatus === "error" && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertDescription>Couldn&apos;t save this estimate. Try again.</AlertDescription>
                  </Alert>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saveStatus === "loading" || saveStatus === "success"}>
                  {saveStatus === "loading" && <Loader2 className="size-4 animate-spin" />}
                  {saveStatus === "success" && <Check className="size-4" />}
                  {saveStatus === "success" ? "Saved" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : (
        <Button variant="outline" className="flex-1" render={<Link href="/login" />}>
          <Save className="size-4" />
          Log in to save
        </Button>
      )}
    </div>
  );
}
