import type { Metadata } from "next";
import Link from "next/link";
import { ArticlePage } from "@/components/layout/ArticlePage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of AfroSmart.",
};

export default function TermsPage() {
  return (
    <ArticlePage title="Terms of Service" subtitle="Last updated June 2026">
      <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-800">
        These are starter terms provided for transparency. Please have them reviewed by qualified
        legal counsel before relying on them for your business.
      </p>

      <h2>1. Using AfroSmart</h2>
      <p>
        AfroSmart is a marketplace that connects buyers and sellers. You must be able to form a
        binding contract to use it, and you agree to provide accurate information and keep your
        account secure.
      </p>

      <h2>2. Listings &amp; conduct</h2>
      <ul>
        <li>List only items and services you are legally allowed to sell.</li>
        <li>No illegal, stolen, counterfeit, dangerous or prohibited goods.</li>
        <li>No fraud, harassment, spam, or misrepresentation of items or prices.</li>
      </ul>

      <h2>3. Transactions</h2>
      <p>
        AfroSmart is a platform for connecting people; we are not a party to transactions between
        users and do not guarantee any listing, buyer or seller. Always follow the{" "}
        <Link href="/safety">Safety Center</Link> guidance when meeting and paying.
      </p>

      <h2>4. Verification &amp; badges</h2>
      <p>
        Verified Seller, Business and Founder badges indicate that AfroSmart has performed a level
        of review. Badges are a signal of trust, not a guarantee of any transaction.
      </p>

      <h2>5. Content</h2>
      <p>
        You retain ownership of the content you post and grant AfroSmart a licence to display it
        for the operation of the service. We may remove content or suspend accounts that violate
        these terms.
      </p>

      <h2>6. Disclaimer &amp; liability</h2>
      <p>
        The service is provided &quot;as is&quot;. To the extent permitted by law, AfroSmart is not
        liable for losses arising from transactions between users or from use of the platform.
      </p>

      <h2>7. Changes</h2>
      <p>
        We may update these terms; continued use after changes means you accept the updated terms.
        Questions? See <Link href="/contact">Contact</Link>.
      </p>
    </ArticlePage>
  );
}
