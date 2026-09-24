import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calculator,
  Camera,
  MessageCircle,
  ScrollText,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EstimatePreviewCard } from "@/components/marketing/estimate-preview-card";

const MODULES = [
  {
    icon: Calculator,
    title: "Instant Estimate",
    description:
      "Plot size, storeys, city and finish level — get an itemized cost breakdown in seconds. No floor plan required.",
  },
  {
    icon: TrendingUp,
    title: "Daily Material Rates",
    description:
      "City-wise cement, steel, bricks, sand and paint rates, updated regularly with a price-trend indicator.",
  },
  {
    icon: Camera,
    title: "Renovation Estimator",
    description:
      "Estimate tiles, paint, flooring and labour for a room from simple dimensions — before you call a mistri.",
  },
  {
    icon: MessageCircle,
    title: "Buniyad Assistant",
    description:
      "Ask in Urdu or Roman Urdu whether a contractor's quote is fair, right inside the app.",
  },
  {
    icon: ScrollText,
    title: "Site Diary",
    description:
      "Dated photo updates from your contractor, cross-checked against your budget — built for owners building remotely.",
  },
  {
    icon: Users,
    title: "Verified Quotes",
    description:
      "Every estimate ends with a way to request quotes from verified dealers and contractors near you.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Tell us about your plot",
    description: "Plot size, city, storeys and the finish level you want — takes under a minute.",
  },
  {
    step: "02",
    title: "Get an itemized estimate",
    description:
      "A cost range broken down by structure, steel, cement, electrical, plumbing, tiles and labour, priced at today's rates.",
  },
  {
    step: "03",
    title: "Compare and request quotes",
    description: "See the trend, download your report, and get quotes from verified dealers and contractors.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,color-mix(in_oklch,var(--primary),transparent_88%),transparent_60%)]"
        />
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <Badge variant="outline" className="mb-5 gap-1.5 border-primary/20 bg-primary/5 text-primary">
              <Building2 className="size-3.5" />
              Fair pricing, starting in Islamabad &amp; Rawalpindi
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
              Know the fair price before you build, renovate, or buy materials.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Buniyad gives you an itemized construction cost estimate in seconds &mdash; no floor
              plan needed &mdash; plus daily material rates and a renovation estimator, so you
              always know if you&apos;re being overcharged.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="h-11 px-6 text-base" render={<Link href="/estimate" />}>
                Get Instant Estimate
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-6 text-base"
                render={<Link href="/rates" />}
              >
                See Today&apos;s Rates
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Every estimate is preliminary and clearly labelled &mdash; not a binding quotation.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <EstimatePreviewCard />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border/60 bg-secondary/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-5 text-center text-sm text-muted-foreground sm:px-6">
          <span>5 Marla &middot; 10 Marla &middot; 1 Kanal</span>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <span>CDA &middot; DHA &middot; Bahria Town bylaws</span>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <span>Rates refreshed daily</span>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <span>Urdu &amp; Roman Urdu supported</span>
        </div>
      </section>

      {/* Modules */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to build without getting overcharged
          </h2>
          <p className="mt-4 text-muted-foreground">
            Free tools for every stage &mdash; from planning to the last coat of paint.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((mod) => (
            <Card key={mod.title} className="gap-3 p-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <mod.icon className="size-5" strokeWidth={2} />
              </div>
              <h3 className="text-base font-semibold">{mod.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{mod.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
          </div>

          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative">
                <span className="font-heading text-5xl font-semibold text-primary/15">
                  {s.step}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="absolute top-3 -right-8 hidden size-5 text-border sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-brand px-6 py-14 text-center text-brand-foreground sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,color-mix(in_oklch,var(--accent),transparent_70%),transparent_60%)]"
          />
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Building or renovating? Know the fair price in under a minute.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-foreground/80">
            No signup required to get your first estimate.
          </p>
          <Button
            size="lg"
            className="mt-8 h-11 bg-white px-7 text-base text-brand hover:bg-white/90"
            render={<Link href="/estimate" />}
          >
            Get Instant Estimate
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>
    </>
  );
}
