import { Home } from "lucide-react";

export function EstimateEmptyState() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-secondary/20 px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Home className="size-6" strokeWidth={1.75} />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Your estimate will appear here</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Fill in your plot details on the left and we&apos;ll break down the cost by structure,
        materials, and finishing &mdash; at today&apos;s rates.
      </p>
    </div>
  );
}
