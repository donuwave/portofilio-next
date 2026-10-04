import { headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_HEADER, type Locale } from "./config";
import { dictionaries, type Dictionary } from "./dictionaries";

/** The locale of the current public request (see proxy.ts). Admin and API requests get the default. */
export async function getLocale(): Promise<Locale> {
  const value = (await headers()).get(LOCALE_HEADER);
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
