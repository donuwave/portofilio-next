import { DEFAULT_LOCALE, LOCALES, type Locale } from "./config";

/** Prefixes an internal path with the locale; anchors, mailto: and external URLs pass through. */
export function localizePath(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE || !path.startsWith("/")) return path;
  const rest = path === "/" ? "" : path;
  // "/#contact" -> "/en#contact"
  return `/${locale}${rest.startsWith("/#") || rest.startsWith("/?") ? rest.slice(1) : rest}`;
}

/** Removes a leading locale segment, whatever locale it is. */
export function stripLocale(pathname: string): string {
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}

/** Fills `{name}` placeholders. Dictionaries hold plain strings (they cross into client components). */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}
