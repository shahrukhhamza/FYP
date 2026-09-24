import { BadgeCheck } from "lucide-react";

export function SourcedBadge({ date }: { date: string }) {
  const formatted = new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
      <BadgeCheck className="size-3.5" />
      Rates sourced {formatted}
    </span>
  );
}
