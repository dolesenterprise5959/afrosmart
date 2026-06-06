// Country registry — kept as data so the login/phone layer can support more
// African countries later. For now Liberia is the only (default) country shown.

export interface Country {
  /** ISO 3166-1 alpha-2 code. */
  code: string;
  name: string;
  /** E.164 dialing prefix, e.g. "+231". */
  dialCode: string;
  flag: string;
  /** Example local number for the placeholder. */
  example: string;
}

export const COUNTRIES: Country[] = [
  { code: "LR", name: "Liberia", dialCode: "+231", flag: "🇱🇷", example: "77 000 0000" },
];

/** The single visible country today. Swap/extend COUNTRIES to expand later. */
export const DEFAULT_COUNTRY = COUNTRIES[0];
