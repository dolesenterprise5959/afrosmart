// Pure phone-number helpers (no Firebase), so they're usable on client + server
// and unit-testable in isolation.

/** Liberia country code; numbers are normalised to E.164 (+231…). */
export const LIBERIA_CC = "+231";

/** Normalise a user-typed Liberian phone number to E.164. */
export function toE164(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) return trimmed.replace(/\s+/g, "");
  // Drop a leading 0 (local format) before prefixing the country code.
  const local = trimmed.replace(/\D/g, "").replace(/^0+/, "");
  return `${LIBERIA_CC}${local}`;
}
