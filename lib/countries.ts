// Country registry for phone sign-in. Liberia is the default; the others let
// the diaspora and nearby countries sign up by switching country. National-number
// length ranges drive validation. Add a row here to support a new country.

export interface Country {
  /** ISO 3166-1 alpha-2 code. */
  code: string;
  name: string;
  /** E.164 dialing prefix, e.g. "+231". */
  dialCode: string;
  flag: string;
  /** Example local number for the placeholder. */
  example: string;
  /** National significant number length range (after the dial code). */
  minLen: number;
  maxLen: number;
}

export const COUNTRIES: Country[] = [
  { code: "LR", name: "Liberia", dialCode: "+231", flag: "🇱🇷", example: "77 000 0000", minLen: 8, maxLen: 9 },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸", example: "201 555 0123", minLen: 10, maxLen: 10 },
  { code: "GH", name: "Ghana", dialCode: "+233", flag: "🇬🇭", example: "24 123 4567", minLen: 9, maxLen: 9 },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬", example: "803 123 4567", minLen: 8, maxLen: 10 },
  { code: "SL", name: "Sierra Leone", dialCode: "+232", flag: "🇸🇱", example: "76 123456", minLen: 8, maxLen: 9 },
  { code: "GN", name: "Guinea", dialCode: "+224", flag: "🇬🇳", example: "620 00 00 00", minLen: 8, maxLen: 9 },
  { code: "CI", name: "Côte d'Ivoire", dialCode: "+225", flag: "🇨🇮", example: "01 23 45 67 89", minLen: 8, maxLen: 10 },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧", example: "7400 123456", minLen: 9, maxLen: 10 },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦", example: "416 555 0123", minLen: 10, maxLen: 10 },
];

/** The default country (effortless Liberia experience). */
export const DEFAULT_COUNTRY = COUNTRIES[0];

export const findCountry = (code: string): Country | undefined =>
  COUNTRIES.find((c) => c.code.toLowerCase() === code.toLowerCase());
