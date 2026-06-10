// Validates a post-login `?next=` redirect target. Only same-origin, single-slash
// absolute paths are allowed — this blocks open-redirect phishing via protocol-
// relative (`//evil.com`), backslash (`/\evil.com`), or absolute (`https://evil.com`)
// URLs that a `router.replace(next)` would otherwise happily navigate to.

const DEFAULT_PATH = "/dashboard";

export function safeNextPath(
  raw: string | null | undefined,
  fallback: string = DEFAULT_PATH,
): string {
  if (typeof raw !== "string" || raw.length === 0) return fallback;

  // Must be an absolute path on this origin: exactly one leading slash.
  // Reject `//host` (protocol-relative) and `/\host` (browsers normalise `\`→`/`).
  if (raw[0] !== "/") return fallback;
  if (raw[1] === "/" || raw[1] === "\\") return fallback;

  // Reject embedded scheme/host smuggling and control characters.
  if (raw.includes("://") || /[\x00-\x1f\x7f]/.test(raw)) return fallback;

  return raw;
}
