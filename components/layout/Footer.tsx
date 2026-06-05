import Link from "next/link";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { FOUNDER } from "@/lib/founder";

const cols: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Marketplace",
    links: [
      { href: "/marketplace", label: "Browse all" },
      { href: "/vehicles", label: "Vehicles" },
      { href: "/properties", label: "Real Estate" },
      { href: "/marketplace/electronics", label: "Electronics" },
      { href: "/listing/new", label: "Post a listing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About AfroSmart" },
      { href: "/founder", label: "Founder" },
      { href: "/verify", label: "Get verified" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    heading: "Help & Safety",
    links: [
      { href: "/help", label: "Help Center" },
      { href: "/safety", label: "Safety Center" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-card">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-brand-foreground">A</span>
              <span className="text-lg tracking-tight">Afro<span className="text-brand">Smart</span></span>
            </Link>
            <p className="mt-3 text-sm text-muted">Buy. Sell. Connect Across Africa.</p>
            <Link href="/founder" className="mt-4 inline-flex items-center gap-2 text-sm text-foreground hover:text-brand">
              <span className="font-medium">{FOUNDER.name}</span>
              <VerifiedBadge kind="founder" label="Founder" />
            </Link>
          </div>

          {cols.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="text-sm font-semibold">{col.heading}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-muted hover:text-brand">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AfroSmart. Liberia&apos;s digital marketplace.</p>
          <p>Made in Liberia 🇱🇷 · Connecting buyers &amp; sellers across Africa.</p>
        </div>
      </div>
    </footer>
  );
}
