import type { SellerType } from "@/lib/types";

// Pure seller-type helpers (usable on client + server). A seller counts as a
// business if their account is flagged business, verified as a business, or on
// the Business plan; otherwise they're an individual.
export function isBusinessSeller(p: {
  isBusiness?: boolean;
  verifiedType?: string | null;
  plan?: string;
}): boolean {
  return !!(p.isBusiness || p.verifiedType === "business" || p.plan === "business");
}

export function sellerType(p: { isBusiness?: boolean; verifiedType?: string | null; plan?: string }): SellerType {
  return isBusinessSeller(p) ? "business" : "individual";
}

export const sellerTypeLabel = (type: SellerType | undefined): string =>
  type === "business" ? "Business" : "Individual";
