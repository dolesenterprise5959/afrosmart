import type { Metadata } from "next";
import Link from "next/link";
import { ArticlePage } from "@/components/layout/ArticlePage";

export const metadata: Metadata = {
  title: "About AfroSmart",
  description:
    "AfroSmart is Liberia's trusted digital marketplace — connecting buyers and sellers across Africa for vehicles, real estate, electronics, jobs and services.",
};

export default function AboutPage() {
  return (
    <ArticlePage title="About AfroSmart" subtitle="Buy. Sell. Connect Across Africa.">
      <p>
        AfroSmart is Liberia&apos;s digital marketplace for vehicles, real estate, electronics,
        phones, jobs, services and everyday local commerce. We make it simple, fast and safe for
        Liberians to buy and sell with people they can trust.
      </p>

      <h2>Our mission</h2>
      <p>
        To connect buyers and sellers across Liberia — and, over time, across Africa — through a
        trusted, secure and modern marketplace built for local networks and everyday devices.
      </p>

      <h2>What makes AfroSmart different</h2>
      <ul>
        <li><strong>Phone privacy.</strong> Your number stays hidden until you choose to share it with a buyer or seller.</li>
        <li><strong>Verified people.</strong> Verified Seller, Business and Founder badges help you know who you&apos;re dealing with.</li>
        <li><strong>Built for Liberia.</strong> A fast, mobile-first experience designed for real-world bandwidth and devices.</li>
        <li><strong>Safety first.</strong> In-app messaging, reporting tools and an active moderation team.</li>
      </ul>

      <h2>Get started</h2>
      <p>
        <Link href="/categories">Browse all categories</Link>, <Link href="/marketplace">explore the marketplace</Link>,
        or <Link href="/listing/new">post a listing</Link>.
      </p>
    </ArticlePage>
  );
}
