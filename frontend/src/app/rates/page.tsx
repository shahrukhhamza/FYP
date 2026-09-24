import type { Metadata } from "next";

import { RatesTable } from "@/components/rates/rates-table";

export const metadata: Metadata = {
  title: "Daily Material Rates",
  description:
    "City-wise rates for cement, steel, bricks, sand, aggregate and paint, with a 14-day trend for each.",
};

export default function RatesPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Daily Material Rates
        </h1>
        <p className="mt-3 text-muted-foreground">
          City-wise rates for the materials that make up most of a construction budget, with a
          14-day trend so you know if it&apos;s a good time to buy or wait.
        </p>
      </div>

      <RatesTable />
    </section>
  );
}
