"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useDictionary, useLocalizedPath } from "@/shared/i18n/locale-provider";

type Choice = "accepted" | "declined";

const STORAGE_KEY = "cookie-consent";

type YandexMetrika = (id: number, method: string, ...args: unknown[]) => void;
declare global {
  interface Window {
    ym?: YandexMetrika & { a?: unknown[]; l?: number };
  }
}

function readChoice(): Choice | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    return null;
  }
}

function writeChoice(choice: Choice) {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Storage blocked: the choice just won't be remembered.
  }
}

/** Loads Yandex Metrica's tag. Safe to call once; only ever runs after the visitor accepted. */
function loadMetrika(id: number) {
  if (window.ym) return;
  const queue = function (...args: unknown[]) {
    (queue.a = queue.a || []).push(args);
  } as unknown as NonNullable<Window["ym"]>;
  queue.l = Date.now();
  window.ym = queue;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://mc.yandex.ru/metrika/tag.js";
  document.head.appendChild(script);

  // No Webvisor (session recordings) on purpose — it needs far heavier consent.
  window.ym(id, "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true });
}

function clearMetrikaCookies() {
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (name.startsWith("_ym") || name === "yandexuid" || name === "ymex") {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  }
}

type CookieConsentContextValue = {
  /** False when no Metrica counter is configured: there are no cookies to ask about. */
  enabled: boolean;
  openSettings: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue>({ enabled: false, openSettings: () => {} });

export function useCookieConsent() {
  return useContext(CookieConsentContext);
}

/**
 * Yandex Metrica behind a cookie consent banner. Nothing is loaded and no
 * cookie is set until the visitor accepts; without a counter id it renders
 * nothing at all.
 */
export function CookieConsentProvider({ metrikaId, children }: { metrikaId: number | null; children: ReactNode }) {
  const dict = useDictionary();
  const localizedPath = useLocalizedPath();
  const pathname = usePathname();
  // undefined until the browser has been asked: avoids flashing the banner at people who already chose.
  const [choice, setChoice] = useState<Choice | null | undefined>(undefined);
  const [reopened, setReopened] = useState(false);
  const firstPath = useRef(pathname);

  useEffect(() => {
    // Reading localStorage has to wait for the browser; there is nothing to subscribe to.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice(readChoice());
  }, []);

  useEffect(() => {
    if (metrikaId && choice === "accepted") loadMetrika(metrikaId);
  }, [metrikaId, choice]);

  // Single-page navigations don't reload the tag, so report them by hand.
  useEffect(() => {
    if (!metrikaId || choice !== "accepted" || pathname === firstPath.current) return;
    firstPath.current = pathname;
    window.ym?.(metrikaId, "hit", window.location.href);
  }, [pathname, metrikaId, choice]);

  const decide = useCallback((next: Choice) => {
    const previous = readChoice();
    writeChoice(next);
    setChoice(next);
    setReopened(false);
    if (previous === "accepted" && next === "declined") {
      // A loaded tag can't be unloaded; drop its cookies and start clean.
      clearMetrikaCookies();
      window.location.reload();
    }
  }, []);

  const value = useMemo(
    () => ({ enabled: metrikaId !== null, openSettings: () => setReopened(true) }),
    [metrikaId]
  );

  const showBanner = metrikaId !== null && (choice === null || reopened);

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
      {showBanner && (
        <div
          role="dialog"
          aria-label={dict.footer.cookieSettings}
          className="fixed inset-x-4 bottom-4 z-[90] rounded-lg border border-[#3a372f] bg-[#1c1a17] p-5 text-sm leading-relaxed text-[#cfc8b8] shadow-2xl sm:inset-x-auto sm:left-6 sm:max-w-md"
        >
          <p>
            {dict.cookies.text}{" "}
            <Link href={localizedPath("/privacy")} className="underline underline-offset-4 hover:text-[#e2451f]">
              {dict.cookies.privacy}
            </Link>
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => decide("accepted")}
              className="rounded-full bg-[#ece5d6] px-5 py-2 font-medium text-[#141312] transition-colors hover:bg-[#e2451f] hover:text-[#ece5d6]"
            >
              {dict.cookies.accept}
            </button>
            <button
              type="button"
              onClick={() => decide("declined")}
              className="rounded-full border border-[#3a372f] px-5 py-2 text-[#ece5d6] transition-colors hover:border-[#e2451f] hover:text-[#e2451f]"
            >
              {dict.cookies.decline}
            </button>
          </div>
        </div>
      )}
    </CookieConsentContext.Provider>
  );
}
