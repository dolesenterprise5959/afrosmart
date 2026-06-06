// Seller plan catalog — pricing-page metadata and plan helpers.

import type { SellerPlan } from "@/lib/types";

export interface PlanInfo {
  id: SellerPlan;
  name: string;
  /** Monthly price in Liberian Dollars; 0 for Free. */
  price: number;
  tagline: string;
  features: string[];
  highlight?: boolean;
}

export const PLANS: PlanInfo[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    tagline: "Everything you need to start selling.",
    features: [
      "Unlimited basic listings",
      "In-app buyer messaging",
      "Phone-privacy protection",
      "Ratings & reviews",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 1500,
    tagline: "Stand out and sell faster.",
    highlight: true,
    features: [
      "Everything in Free",
      "Featured placement on the homepage",
      "Priority in search results",
      "Verified Seller badge eligibility",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 5000,
    tagline: "For shops and companies at scale.",
    features: [
      "Everything in Premium",
      "Verified Business badge",
      "Business profile",
      "Listing performance analytics",
    ],
  },
];

export const planInfo = (id: SellerPlan): PlanInfo =>
  PLANS.find((p) => p.id === id) ?? PLANS[0];

/** Premium and Business sellers get featured/priority placement. */
export const isFeaturedEligible = (plan: SellerPlan | undefined): boolean =>
  plan === "premium" || plan === "business";
