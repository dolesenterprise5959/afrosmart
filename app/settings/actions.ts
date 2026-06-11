"use server";

import { verifySession } from "@/lib/auth/dal";
import { adminDb } from "@/lib/firebase/admin";
import { setProfilePhoto } from "@/lib/firestore/users";
import { isAllowedImageUrl } from "@/lib/utils/image-url";

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

  // Cap lengths: server actions are callable directly, so an attacker could POST
  // a multi-MB string straight into the user doc without these bounds.
  const displayName = (input.displayName?.trim() ?? "").slice(0, 80);
  const county = (input.county?.trim() ?? "").slice(0, 60);
  const city = (input.city?.trim() ?? "").slice(0, 60);

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

/** Set or clear the signed-in user's profile photo. Pass null to remove it. */
export async function setProfilePhotoAction(
  photoURL: string | null,
): Promise<UpdateProfileResult> {
  const session = await verifySession();
  // Only accept URLs from our own Firebase Storage uploader — never an arbitrary
  // attacker-controlled host (SSRF / off-site image injection).
  if (photoURL && !isAllowedImageUrl(photoURL)) return { error: "Invalid photo URL." };
  await setProfilePhoto(session.uid, photoURL);
  return { ok: true };
}
