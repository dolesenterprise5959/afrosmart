import type { Metadata } from "next";
import Link from "next/link";
import { ArticlePage } from "@/components/layout/ArticlePage";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the AfroSmart team — support, partnerships and press.",
};

const channels = [
  { label: "General support", value: "support@afrosmart.app", href: "mailto:support@afrosmart.app" },
  { label: "Business & partnerships", value: "business@afrosmart.app", href: "mailto:business@afrosmart.app" },
  { label: "Report a problem", value: "safety@afrosmart.app", href: "mailto:safety@afrosmart.app" },
];

export default function ContactPage() {
  return (
    <ArticlePage title="Contact Us" subtitle="We'd love to hear from you.">
      <p>
        Whether you need help with your account, want to partner with us, or have feedback to make
        AfroSmart better, reach out through any of the channels below.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        {channels.map((c) => (
          <a
            key={c.label}
            href={c.href}
            className="rounded-2xl border border-border bg-card p-4 no-underline transition-colors hover:border-brand"
          >
            <div className="text-sm font-semibold text-foreground">{c.label}</div>
            <div className="mt-1 break-all text-sm text-brand">{c.value}</div>
          </a>
        ))}
      </div>

      <h2>In the app</h2>
      <p>
        For listing-specific issues you can use the in-app message and report tools. See the{" "}
        <Link href="/help">Help Center</Link> for common questions and the{" "}
        <Link href="/safety">Safety Center</Link> for staying safe while buying and selling.
      </p>
    </ArticlePage>
  );
}
