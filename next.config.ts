import type { NextConfig } from "next";

// Content-Security-Policy tuned for Firebase Web (Auth phone/reCAPTCHA, Firestore
// realtime, Storage). ENFORCED — validated against the live homepage + login
// (Firebase + reCAPTCHA boot) with zero Report-Only violations before flipping.
// Next hardening step: add nonces to drop 'unsafe-inline' from script-src.
const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline' covers Next's hydration bootstrap; harden with nonces later.
  "script-src 'self' 'unsafe-inline' https://www.gstatic.com https://www.google.com https://apis.google.com https://*.firebaseapp.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://*.googleusercontent.com https://www.gstatic.com",
  "font-src 'self' data:",
  // www.google.com covers the reCAPTCHA challenge XHRs in addition to the iframe.
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebasestorage.googleapis.com https://www.google.com",
  "frame-src 'self' https://*.firebaseapp.com https://www.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  // Enforced — these are safe and won't interfere with Firebase.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Enforced (validated Report-Only with zero violations — see comment above).
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  // NOTE: do NOT set `output: "standalone"` here — Firebase App Hosting (the live
  // deploy target) builds with its own Next.js adapter, and `standalone` makes it
  // skip serving the `public/` folder, so every public asset (hero banners,
  // category/placeholder images, ad creatives) 404s. The Dockerfile/Cloud Run path
  // (Option B in DEPLOYMENT_GUIDE) sets standalone itself when needed.
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    // Optimised listing photos (resized/WebP) — important on Liberian bandwidth.
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
  },
};

export default nextConfig;
