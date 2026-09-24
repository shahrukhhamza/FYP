import type { Metadata } from "next";

import { EstimateForm } from "@/components/estimate/estimate-form";

export const metadata: Metadata = {
  title: "Instant Estimate",
  description:
    "Get an itemized construction cost estimate in seconds — no floor plan needed. Enter your plot size, city, storeys and finish level.",
};

export default function EstimatePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Instant Estimate</h1>
        <p className="mt-3 text-muted-foreground">
          No floor plan needed. Tell us your plot size, city, storeys and finish level, and
          we&apos;ll break the cost down by structure, materials, and finishing &mdash; priced at
          today&apos;s rates.
        </p>
      </div>

      <EstimateForm />
    </section>
  );
}
