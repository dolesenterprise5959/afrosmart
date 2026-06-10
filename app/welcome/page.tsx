import { redirect } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { NameForm } from "@/components/onboarding/NameForm";
import { verifySession } from "@/lib/auth/dal";
import { ensureAccountDoc, hasCompletedOnboarding } from "@/lib/firestore/users";
import { safeNextPath } from "@/lib/utils/safe-redirect";

export const dynamic = "force-dynamic";

export default async function WelcomePage({ searchParams }: PageProps<"/welcome">) {
  const session = await verifySession(); // redirects to /login if not signed in
  await ensureAccountDoc(session.uid, session.phone);

  const sp = await searchParams;
  // Validate the redirect target: blocks open-redirect phishing (//evil.com etc.).
  const next = safeNextPath(typeof sp.next === "string" ? sp.next : null);
  // Prefill the referral code from a shared link (?ref=AF7K9QXM).
  const ref = typeof sp.ref === "string" ? sp.ref.toUpperCase().slice(0, 16) : "";

  // Returning users who already entered their name skip straight through.
  if (await hasCompletedOnboarding(session.uid)) redirect(next);

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-10">
      <div className="text-center">
        <div className="flex justify-center">
          <Logo href={null} full size="lg" />
        </div>
        <h1 className="mt-4 text-xl font-bold">Welcome to AfroSmart</h1>
        <p className="mt-1 text-sm text-muted">
          Your phone is verified — what should we call you? This is the name buyers and sellers will see.
        </p>
      </div>
      <NameForm next={next} defaultReferralCode={ref} />
    </div>
  );
}
