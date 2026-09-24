import type { components } from "@/lib/api/schema";
import { CATEGORY_COLORS, formatPkr } from "@/lib/labels";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type CategoryBreakdown = components["schemas"]["CategoryBreakdown"];

export function CategoryAccordion({ categories }: { categories: CategoryBreakdown[] }) {
  return (
    <Accordion>
      {categories.map((cat) => (
        <AccordionItem key={cat.category} value={cat.category}>
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[cat.category] ?? "var(--chart-5)" }}
              />
              {cat.label}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            {cat.materials && cat.materials.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Material</th>
                      <th className="pb-2 font-medium">Quantity</th>
                      <th className="pb-2 font-medium">Rate</th>
                      <th className="pb-2 text-right font-medium">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.materials.map((m) => (
                      <tr key={m.material} className="border-t border-border/50">
                        <td className="py-2 pr-2">{m.material}</td>
                        <td className="py-2 pr-2 text-muted-foreground">
                          {m.quantity.toLocaleString()} {m.unit}
                        </td>
                        <td className="py-2 pr-2 text-muted-foreground">{formatPkr(m.rate_pkr)}</td>
                        <td className="py-2 text-right font-medium">{formatPkr(m.cost_pkr)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Flat per-sqft benchmark for this category &mdash; not yet broken down by
                individual material.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
