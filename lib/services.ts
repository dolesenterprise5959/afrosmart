// Which categories are "services" — drives the /services marketplace, the
// create-form service fields, and the public business-contact display.

import { CATEGORY_GROUPS } from "@/lib/categories";

const servicesGroup = CATEGORY_GROUPS.find((g) => g.id === "services");

/** Category ids treated as services (the Services group + taxi/motorbike). */
export const SERVICE_CATEGORY_IDS = new Set<string>([
  ...(servicesGroup?.categories.map((c) => c.id) ?? []),
  "taxi",
  "motorbike",
]);

export const isServiceCategory = (id: string): boolean => SERVICE_CATEGORY_IDS.has(id);

/** WhatsApp click-to-chat link from an E.164 number. */
export const whatsappLink = (e164: string): string =>
  `https://wa.me/${(e164 ?? "").replace(/[^\d]/g, "")}`;
