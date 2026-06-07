"use server";

import { verifySession } from "@/lib/auth/dal";
import { getListing, setListingStatus, updateListingFields } from "@/lib/firestore/listings";
import { validateListingFields } from "@/lib/validation";
import type { ListingStatus } from "@/lib/types";

// NOTE: "use server" modules may only export async functions — keep types/helpers
// unexported (see ManageResult in @/lib/listing-manage).

async function ownGuard(id: string): Promise<{ uid: string } | { error: string }> {
  const session = await verifySession();
  const listing = await getListing(id);
  if (!listing) return { error: "Listing not found." };
  if (listing.sellerId !== session.uid) return { error: "You can only manage your own listings." };
  return { uid: session.uid };
}

async function changeStatus(id: string, status: ListingStatus): Promise<{ ok?: boolean; error?: string }> {
  const g = await ownGuard(id);
  if ("error" in g) return { error: g.error };
  await setListingStatus(id, status);
  return { ok: true };
}

export async function markSold(id: string) { return changeStatus(id, "sold"); }
export async function markAvailable(id: string) { return changeStatus(id, "active"); }
export async function pauseListing(id: string) { return changeStatus(id, "paused"); }
export async function unpauseListing(id: string) { return changeStatus(id, "active"); }
/** Soft delete — preserves history; hidden from the seller's list + all browsing. */
export async function deleteListing(id: string) { return changeStatus(id, "removed"); }

export async function updateListing(
  id: string,
  input: { title: string; description: string; price: string | number; currency: string; county: string; city: string },
): Promise<{ ok?: boolean; error?: string }> {
  const g = await ownGuard(id);
  if ("error" in g) return { error: g.error };
  const title = input.title.trim();
  const description = input.description.trim();
  const price = Number(input.price);
  const county = input.county.trim();
  const city = input.city.trim();
  const currency = input.currency === "USD" ? "USD" : "LRD";
  // category isn't edited here — pass a valid placeholder so its check passes.
  const err = validateListingFields({ title, description, price, category: "general", county, city });
  if (err) return { error: err };
  await updateListingFields(id, { title, description, price, currency, county, city });
  return { ok: true };
}
