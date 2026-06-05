"use server";

import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/dal";
import { createListing } from "@/lib/firestore/listings";
import { ensureUserProfile, isSuspended } from "@/lib/firestore/users";
import { checkRateLimit, rateLimitMessage } from "@/lib/firestore/ratelimit";
import { validateListingFields } from "@/lib/validation";
import type { CategoryId } from "@/lib/types";

export interface CreateListingResult {
  error?: string;
}

interface CreateListingPayload {
  title: string;
  description: string;
  price: string | number;
  category: string;
  county: string;
  city: string;
  photos: string[];
}

// Server-side create. Re-verifies the session (never trusts the client for the
// seller id) and validates all fields before writing to Firestore. On success
// it redirects to the new listing's page.
export async function createListingAction(
  input: CreateListingPayload,
): Promise<CreateListingResult> {
  const session = await verifySession();

  if (await isSuspended(session.uid)) {
    return { error: "Your account is suspended and cannot post listings." };
  }

  const limit = await checkRateLimit(session.uid, "listing");
  if (!limit.ok) {
    return { error: rateLimitMessage("listing", limit.retryAfterSec) };
  }

  const title = input.title?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  const price = Number(input.price);
  const category = input.category as CategoryId;
  const county = input.county?.trim() ?? "";
  const city = input.city?.trim() ?? "";
  const photos = Array.isArray(input.photos) ? input.photos.slice(0, 6) : [];

  const error = validateListingFields({ title, description, price, category, county, city });
  if (error) return { error };

  await ensureUserProfile(session.uid, { phone: session.phone, county, city });
  const id = await createListing(session.uid, {
    title,
    description,
    price,
    category,
    county,
    city,
    photos,
  });

  redirect(`/listing/${id}`);
}
