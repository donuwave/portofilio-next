"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries";
import { localizePath } from "./localize-path";

type LocaleContextValue = { locale: Locale; dict: Dictionary };

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ locale, dict, children }: LocaleContextValue & { children: ReactNode }) {
  return <LocaleContext.Provider value={{ locale, dict }}>{children}</LocaleContext.Provider>;
}

function useLocaleContext() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale/useDictionary must be used inside <LocaleProvider>");
  return value;
}

export function useLocale(): Locale {
  return useLocaleContext().locale;
}

export function useDictionary(): Dictionary {
  return useLocaleContext().dict;
}

/** Returns a function that turns an internal path into one for the current locale. */
export function useLocalizedPath() {
  const locale = useLocale();
  return (path: string) => localizePath(path, locale);
}
