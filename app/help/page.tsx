import type { Metadata } from "next";
import Link from "next/link";
import { ArticlePage } from "@/components/layout/ArticlePage";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Answers to common questions about buying and selling on AfroSmart.",
};

const faqs = [
  {
    q: "How do I sign in?",
    a: "AfroSmart uses your phone number. Enter it, receive a one-time SMS code, and you're in — no passwords to remember.",
  },
  {
    q: "How do I post a listing?",
    a: "Tap “+ Post a listing”, add photos, a clear title, price and description, choose a category and county, then publish.",
  },
  {
    q: "How does messaging work?",
    a: "Message a seller from any listing. Your phone number stays private until the conversation is unlocked and you choose to share it.",
  },
  {
    q: "What do the verified badges mean?",
    a: "Verified Seller, Business and Founder badges show that AfroSmart has reviewed the account. They build trust but are not a guarantee of a transaction.",
  },
  {
    q: "How do I stay safe?",
    a: "Meet in public places, inspect items before paying, and never send money in advance. See the Safety Center for the full guide.",
  },
  {
    q: "How do I report a problem?",
    a: "Use the report button on a listing or profile, or email safety@afrosmart.app. Our moderation team reviews every report.",
  },
];

export default function HelpPage() {
  return (
    <ArticlePage title="Help Center" subtitle="Quick answers to get you going.">
      <div className="space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="rounded-2xl border border-border bg-card p-4">
            <summary className="cursor-pointer text-sm font-semibold text-foreground">{f.q}</summary>
            <p className="mt-2 text-sm text-foreground/85">{f.a}</p>
          </details>
        ))}
      </div>

      <h2>Still need help?</h2>
      <p>
        Visit the <Link href="/safety">Safety Center</Link> or <Link href="/contact">contact us</Link>{" "}
        and we&apos;ll get back to you.
      </p>
    </ArticlePage>
  );
}
