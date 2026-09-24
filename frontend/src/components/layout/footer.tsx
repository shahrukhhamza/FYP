import Link from "next/link";
import { Building2 } from "lucide-react";

const FOOTER_LINKS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { href: "/estimate", label: "Instant Estimate" },
      { href: "/rates", label: "Material Rates" },
      { href: "/renovation", label: "Renovation Estimator" },
      { href: "/assistant", label: "Assistant" },
    ],
  },
  {
    heading: "For Businesses",
    links: [
      { href: "/contractors", label: "For Contractors" },
      { href: "/dealers", label: "For Dealers & Suppliers" },
    ],
  },
  {
    heading: "About",
    links: [
      { href: "/about", label: "About Buniyad" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="size-4.5" strokeWidth={2.25} />
              </span>
              <span className="text-lg font-semibold tracking-tight">Buniyad</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Pakistan&apos;s trusted source for fair construction and renovation costs.
            </p>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.heading}>
              <h3 className="text-sm font-semibold text-foreground">{group.heading}</h3>
              <ul className="mt-3 flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Buniyad. All estimates are preliminary, not a binding quotation.</p>
          <p>A Final Year Project &mdash; Capital University of Science and Technology, Islamabad</p>
        </div>
      </div>
    </footer>
  );
}
