export const LOCALES = ["ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** Served without a URL prefix; every other locale lives under `/<locale>`. */
export const DEFAULT_LOCALE: Locale = "ru";

/** Set by proxy.ts on every public request so server code can learn the locale. */
export const LOCALE_HEADER = "x-locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}
