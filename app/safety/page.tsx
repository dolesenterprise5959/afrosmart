import type { Metadata } from "next";
import Link from "next/link";
import { ArticlePage } from "@/components/layout/ArticlePage";

export const metadata: Metadata = {
  title: "Safety Center",
  description: "Tips to buy and sell safely on AfroSmart.",
};

export default function SafetyPage() {
  return (
    <ArticlePage title="Safety Center" subtitle="Simple habits to keep every deal safe.">
      <h2>When meeting</h2>
      <ul>
        <li>Meet in a public, well-lit place during the day.</li>
        <li>Bring a friend when you can, and tell someone where you&apos;re going.</li>
        <li>Inspect the item carefully before any money changes hands.</li>
      </ul>

      <h2>When paying</h2>
      <ul>
        <li>Pay in person, only after you&apos;ve seen and tested the item.</li>
        <li>Never send money in advance or pay for an item you haven&apos;t inspected.</li>
        <li>Be cautious of deals that seem too good to be true.</li>
      </ul>

      <h2>Protect your privacy</h2>
      <ul>
        <li>Keep conversations in AfroSmart messaging — your phone number stays hidden until you share it.</li>
        <li>Don&apos;t share bank details, codes or passwords with anyone.</li>
      </ul>

      <h2>Spotting scams</h2>
      <ul>
        <li>Pressure to pay quickly or move off the platform is a red flag.</li>
        <li>Requests for advance fees, &quot;shipping deposits&quot; or gift cards are scams.</li>
        <li>Look for <strong>Verified Seller</strong> and <strong>Verified Business</strong> badges.</li>
      </ul>

      <h2>Report a problem</h2>
      <p>
        Use the report button on any listing or profile, or email{" "}
        <a href="mailto:safety@afrosmart.app">safety@afrosmart.app</a>. Our moderation team reviews
        every report. See the <Link href="/help">Help Center</Link> for more.
      </p>
    </ArticlePage>
  );
}
