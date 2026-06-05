"use server";

import { verifySession } from "@/lib/auth/dal";
import { adminDb } from "@/lib/firebase/admin";

export interface UpdateProfileResult {
  ok?: boolean;
  error?: string;
}

interface ProfilePayload {
  displayName: string;
  county: string;
  city: string;
  isBusiness: boolean;
}

// Update the signed-in user's own profile. Auth is re-verified server-side; the
// phone number is never touched here.
export async function updateProfileAction(
  input: ProfilePayload,
): Promise<UpdateProfileResult> {
  const session = await verifySession();

  const displayName = input.displayName?.trim() ?? "";
  const county = input.county?.trim() ?? "";
  const city = input.city?.trim() ?? "";

  if (displayName.length < 2) return { error: "Please enter your name." };

  await adminDb()
    .collection("users")
    .doc(session.uid)
    .set(
      { displayName, county, city, isBusiness: Boolean(input.isBusiness) },
      { merge: true },
    );

  return { ok: true };
}
