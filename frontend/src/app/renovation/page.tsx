import type { Metadata } from "next";

import { RenovationForm } from "@/components/renovation/renovation-form";

export const metadata: Metadata = {
  title: "Renovation Estimator",
  description:
    "Estimate tiles, paint, flooring and labour for a room from simple dimensions — before you call a mistri.",
};

export default function RenovationPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Renovation Estimator
        </h1>
        <p className="mt-3 text-muted-foreground">
          Retiling a bathroom, repainting a room, or replastering a wall? Enter the room
          dimensions and we&apos;ll estimate the materials and labour &mdash; at today&apos;s
          rates.
        </p>
      </div>

      <RenovationForm />
    </section>
  );
}
