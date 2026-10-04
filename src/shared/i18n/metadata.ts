import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "./config";
import { localizePath } from "./localize-path";

/**
 * canonical + hreflang links between the language versions of a page. They
 * must be absolute, which needs SITE_URL (see the root layout's metadataBase),
 * so without it nothing is emitted.
 */
export function localeAlternates(path: string, locale: Locale): Metadata["alternates"] {
  if (!process.env.SITE_URL) return undefined;
  return {
    canonical: localizePath(path, locale),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, localizePath(path, l)])),
      "x-default": localizePath(path, DEFAULT_LOCALE),
    },
  };
}
