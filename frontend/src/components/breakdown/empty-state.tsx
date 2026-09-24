import { Home } from "lucide-react";

export function ResultEmptyState({
  title = "Your estimate will appear here",
  description = "Fill in the details on the left and we'll break down the cost by category, materials, and labour — at today's rates.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-secondary/20 px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Home className="size-6" strokeWidth={1.75} />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
