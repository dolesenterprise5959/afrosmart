import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { FOUNDER } from "@/lib/founder";
import { verifyAdmin } from "@/lib/auth/dal";

// Founder information is internal — visible to admin accounts only.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Founder (Admin)",
  robots: { index: false, follow: false },
};

const pillars = [
  { icon: "🛡️", title: "Trusted", text: "Verified sellers, secure messaging, and phone privacy that keeps your number hidden until you choose to share it." },
  { icon: "⚡", title: "Modern", text: "A fast, mobile-first marketplace built for Liberian networks and everyday devices." },
  { icon: "🌍", title: "Connected", text: "Bringing buyers and sellers together across Liberia — and, in time, across Africa." },
];

export default async function FounderPage() {
  await verifyAdmin(); // admins only — redirects everyone else

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <section className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="bg-gradient-to-br from-neutral-900 to-black px-6 py-8 text-white sm:px-8">
          <div className="flex items-center gap-4">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-white/10 text-2xl font-bold ring-1 ring-white/20">
              {FOUNDER.initials}
            </span>
            <div>
              <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{FOUNDER.name}</h1>
              <p className="mt-0.5 text-sm text-white/75 sm:text-base">{FOUNDER.title}</p>
              <span className="mt-2 inline-block">
                <VerifiedBadge kind="founder" />
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <p className="text-base leading-relaxed text-foreground">{FOUNDER.bio}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.title} className="rounded-2xl border border-border bg-surface p-4">
                <div className="text-xl">{p.icon}</div>
                <h2 className="mt-1 text-sm font-semibold">{p.title}</h2>
                <p className="mt-1 text-xs text-muted">{p.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="/marketplace" size="md">Explore the marketplace</Button>
            <Button href="/listing/new" variant="outline" size="md">Post a listing</Button>
          </div>
        </div>
      </section>

      <p className="mt-6 text-center text-sm text-muted">
        Questions or partnership ideas?{" "}
        <Link href="/contact" className="font-medium text-brand">Contact AfroSmart</Link>.
      </p>
    </div>
  );
}
