import type { components } from "@/lib/api/schema";

// Human-readable labels for backend enum values. Keep in sync with
// backend/app/domain/estimation/types.py — these are display strings only,
// the values themselves come from the generated schema.

export const PLOT_SIZE_LABELS: Record<components["schemas"]["PlotSize"], string> = {
  "3_marla": "3 Marla",
  "5_marla": "5 Marla",
  "7_marla": "7 Marla",
  "10_marla": "10 Marla",
  "1_kanal": "1 Kanal",
  "2_kanal": "2 Kanal",
};

export const CITY_LABELS: Record<components["schemas"]["City"], string> = {
  islamabad: "Islamabad",
  rawalpindi: "Rawalpindi",
};

export const QUALITY_GRADE_LABELS: Record<components["schemas"]["QualityGrade"], string> = {
  economy: "Economy",
  standard: "Standard",
  premium: "Premium",
};

export const STOREYS_LABELS: Record<string, string> = {
  "1": "1 Storey",
  "1.5": "1.5 Storeys (Ground + mumty)",
  "2": "2 Storeys",
  "2.5": "2.5 Storeys",
  "3": "3 Storeys",
};

// Matches the category order used in the landing-page sample card, so the
// marketing page and the real estimate results use consistent colors.
export const CATEGORY_COLORS: Record<string, string> = {
  structure_steel: "var(--chart-1)",
  cement_masonry: "var(--chart-2)",
  electrical_plumbing: "var(--chart-3)",
  woodwork_doors: "var(--chart-4)",
  tiles_paint_finishing: "var(--chart-6)",
};

export function formatPkr(amount: number): string {
  if (amount >= 100_000) {
    return `PKR ${(amount / 100_000).toFixed(1)}L`;
  }
  return `PKR ${amount.toLocaleString("en-PK")}`;
}
