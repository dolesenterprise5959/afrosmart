import type { MetadataRoute } from "next";
// Static-import the icons so they're bundled into /_next/static/media (which App
// Hosting serves reliably) — raw /public paths 404 on this deploy target.
import icon192 from "../public/icon-192.png";
import icon512 from "../public/icon-512.png";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AfroSmart — Buy. Sell. Connect Across Liberia",
    short_name: "AfroSmart",
    description: "Liberia's marketplace — buy, sell, and connect across the country.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: icon192.src, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: icon512.src, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: icon512.src, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
