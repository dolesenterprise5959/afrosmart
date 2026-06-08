import type { MetadataRoute } from "next";

// Allow crawling of public marketplace pages; keep private/app routes (auth,
// account, messaging, admin, API) out of the index. Points crawlers at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/settings",
        "/messages",
        "/saved",
        "/welcome",
        "/verify",
        "/admin",
        "/listing/new",
      ],
    },
    sitemap: "https://afrosmart.app/sitemap.xml",
    host: "https://afrosmart.app",
  };
}
