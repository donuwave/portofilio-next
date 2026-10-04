import type { Metadata } from "next";
import { indexingAllowed } from "@/lib/indexing";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "./config";
import { localizePath } from "./localize-path";

/**
 * canonical + hreflang links between the language versions of a page. They
 * must be absolute, which needs SITE_URL (see the root layout's metadataBase),
 * so without it nothing is emitted.
 */
export function localeAlternates(path: string, locale: Locale): Metadata["alternates"] {
  // A canonical URL on a page that says noindex would contradict itself.
  if (!process.env.SITE_URL || !indexingAllowed()) return undefined;
  return {
    canonical: localizePath(path, locale),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, localizePath(path, l)])),
      "x-default": localizePath(path, DEFAULT_LOCALE),
    },
  };
}
