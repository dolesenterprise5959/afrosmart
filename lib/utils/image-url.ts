// Allowlist for user-supplied image URLs (profile photos, listing photos).
// Server actions receive these from the client, so without validation a user can
// store ANY https URL — an internal-metadata SSRF target or an attacker-hosted
// image rendered across the app. We restrict to the Firebase Storage hosts that
// our own uploaders (lib/firebase/storage-client.ts) actually produce, which also
// matches the CSP img-src allowlist in next.config.ts.

const ALLOWED_HOSTS = [
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
];

export function isAllowedImageUrl(url: unknown): boolean {
  if (typeof url !== "string" || url.length === 0) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  return ALLOWED_HOSTS.some(
    (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`),
  );
}
