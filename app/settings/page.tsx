import { verifySession } from "@/lib/auth/dal";
import { getPublicProfile } from "@/lib/firestore/users";
import { SettingsForm } from "@/components/settings/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await verifySession();
  const profile = await getPublicProfile(session.uid);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="text-xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-muted">Manage your profile and account.</p>

      <SettingsForm
        initial={{
          displayName: profile?.displayName ?? "",
          photoURL: profile?.photoURL,
          county: profile?.county ?? "",
          city: profile?.city ?? "",
          isBusiness: profile?.isBusiness ?? false,
          phone: session.phone,
        }}
      />
    </div>
  );
}
