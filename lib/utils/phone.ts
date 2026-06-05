// Pure phone-number helpers (no Firebase), so they're usable on client + server
// and unit-testable in isolation.

/** Liberia country code; numbers are normalised to E.164 (+231…). */
export const LIBERIA_CC = "+231";

/** Normalise a user-typed Liberian phone number to E.164. */
export function toE164(raw: string): string {
  // "00" is the international call prefix — treat it like "+".
  const s = raw.trim().replace(/^00/, "+");

  // Already international: keep the "+", strip everything else non-numeric.
  if (s.startsWith("+")) return "+" + s.slice(1).replace(/\D/g, "");

  let digits = s.replace(/\D/g, "");
  // User typed the country code without "+", e.g. "231770000001" — strip it so
  // we don't end up doubling it to "+231231…".
  if (digits.startsWith("231")) digits = digits.slice(3);
  // Drop the national trunk "0" (local format), e.g. "0770000001".
  digits = digits.replace(/^0+/, "");
  return `${LIBERIA_CC}${digits}`;
}
