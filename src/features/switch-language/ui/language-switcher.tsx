"use client";

import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "@/shared/i18n/config";
import { useDictionary, useLocale } from "@/shared/i18n/locale-provider";
import { localizePath, stripLocale } from "@/shared/i18n/localize-path";

/** RU / EN toggle: each option links to the same page under the other locale's URL. */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const current = useLocale();
  const dict = useDictionary();
  const basePath = stripLocale(pathname);

  return (
    <nav aria-label={dict.language.label} className={`flex items-center gap-2 text-sm tracking-[0.15em] ${className}`}>
      {LOCALES.map((locale: Locale, index) => (
        <span key={locale} className="flex items-center gap-2">
          {index > 0 && (
            <span aria-hidden="true" className="text-[#3a372f]">
              /
            </span>
          )}
          {locale === current ? (
            <span aria-current="true" className="text-[#ece5d6]">
              {dict.language[locale]}
            </span>
          ) : (
            // A plain <a> on purpose: the locale lives in layouts that a soft (client-side)
            // navigation keeps as they were, so only a full load swaps the language.
            <a
              href={localizePath(basePath, locale)}
              hrefLang={locale}
              lang={locale}
              className="text-[#8a8378] transition-colors hover:text-[#e2451f]"
            >
              {dict.language[locale]}
            </a>
          )}
        </span>
      ))}
    </nav>
  );
}
