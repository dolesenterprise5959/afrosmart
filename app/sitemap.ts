import type { MetadataRoute } from "next";
import { ALL_CATEGORIES, categoryHref } from "@/lib/categories";

// Canonical site origin (matches metadataBase in app/layout.tsx).
const SITE = "https://afrosmart.app";

type ChangeFreq = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

// Static sitemap of public, indexable routes — homepage, the marketplace, and
// every category's canonical landing page (each now has its own SEO metadata),
// plus the public info pages. Listing-level URLs are intentionally omitted here
// (they're reachable via category pages); they can be added as a dynamic,
// runtime-generated sitemap once there's real inventory.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const seen = new Set<string>();
  const out: MetadataRoute.Sitemap = [];

  const add = (path: string, priority: number, changeFrequency: ChangeFreq) => {
    const url = `${SITE}${path}`;
    if (seen.has(url)) return; // dedupe (cars→/vehicles, property→/properties)
    seen.add(url);
    out.push({ url, lastModified: now, changeFrequency, priority });
  };

  add("/", 1, "daily");
  add("/marketplace", 0.9, "daily");
  add("/categories", 0.8, "weekly");
  add("/vehicles", 0.8, "daily");
  add("/properties", 0.8, "daily");
  add("/services", 0.8, "weekly");

  // Every category's canonical landing page.
  for (const c of ALL_CATEGORIES) add(categoryHref(c.id), 0.7, "daily");

  // Public info pages.
  for (const p of ["/about", "/businesses", "/help", "/safety", "/pricing", "/contact", "/privacy", "/terms"]) {
    add(p, 0.4, "monthly");
  }

  return out;
}
