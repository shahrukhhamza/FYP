import type { Metadata } from "next";

import { EstimateForm } from "@/components/estimate/estimate-form";
import { RoomEstimateForm } from "@/components/estimate/room-estimate-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Instant Estimate",
  description:
    "Get an itemized construction cost estimate in seconds — no floor plan needed. Enter your plot size, city, storeys and finish level, or describe your rooms directly for an exact-geometry estimate.",
};

export default function EstimatePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Instant Estimate</h1>
        <p className="mt-3 text-muted-foreground">
          No floor plan needed. Estimate by plot size, or describe your rooms directly for an
          estimate based on their exact dimensions &mdash; priced at today&apos;s rates.
        </p>
      </div>

      <Tabs defaultValue="plot">
        <TabsList className="mb-8">
          <TabsTrigger value="plot">By Plot Size</TabsTrigger>
          <TabsTrigger value="rooms">By Rooms</TabsTrigger>
        </TabsList>
        <TabsContent value="plot">
          <EstimateForm />
        </TabsContent>
        <TabsContent value="rooms">
          <RoomEstimateForm />
        </TabsContent>
      </Tabs>
    </section>
  );
}
