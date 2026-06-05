import type { Metadata } from "next";
import Link from "next/link";
import { ArticlePage } from "@/components/layout/ArticlePage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How AfroSmart collects, uses and protects your information.",
};

export default function PrivacyPage() {
  return (
    <ArticlePage title="Privacy Policy" subtitle="Last updated June 2026">
      <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-800">
        This is a starter policy provided for transparency. Please have it reviewed by qualified
        legal counsel before relying on it for your business.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Account:</strong> your phone number (used for sign-in) and the profile details you provide.</li>
        <li><strong>Listings &amp; messages:</strong> content you post, including photos and the messages you exchange.</li>
        <li><strong>Usage:</strong> basic technical data such as device type and pages viewed, used to keep the service reliable and secure.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To operate the marketplace — showing listings, enabling messaging, and verifying accounts.</li>
        <li>To protect users through moderation, fraud prevention and safety enforcement.</li>
        <li>To improve AfroSmart and communicate important service updates.</li>
      </ul>

      <h2>Phone-number privacy</h2>
      <p>
        Your phone number is never shown publicly. It is only revealed to another user when a
        conversation is unlocked and you choose to share it.
      </p>

      <h2>Sharing</h2>
      <p>
        We do not sell your personal information. We share data only with service providers that
        help us run AfroSmart (such as hosting and authentication) and where required by law.
      </p>

      <h2>Your choices</h2>
      <p>
        You can edit your profile in <Link href="/settings">Settings</Link> and request account
        deletion by contacting <a href="mailto:support@afrosmart.app">support@afrosmart.app</a>.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy? Email <a href="mailto:support@afrosmart.app">support@afrosmart.app</a>{" "}
        or visit our <Link href="/contact">Contact</Link> page.
      </p>
    </ArticlePage>
  );
}
