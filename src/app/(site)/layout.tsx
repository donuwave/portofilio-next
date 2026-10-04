import type { Metadata, Viewport } from "next";
import { Unbounded, Neucha } from "next/font/google";
import { CookieConsentProvider } from "@/features/cookie-consent/ui/cookie-consent";
import { LanguageSwitcher } from "@/features/switch-language/ui/language-switcher";
import { getDictionary, getLocale } from "@/shared/i18n/get-locale";
import { LocaleProvider } from "@/shared/i18n/locale-provider";
import { SmoothScrollProvider } from "@/shared/lib/smooth-scroll-provider";

// The public site is dark in every setting. Declaring it tells browsers not to "help":
// Chrome's auto dark mode recolours pages it thinks are light when the OS is dark, which
// showed up as a page background darker than the blocks laid on top of it.
export const viewport: Viewport = { colorScheme: "dark", themeColor: "#141312" };

// Dark-mode extensions (Dark Reader and the like) recolour pages that are already dark;
// this is the documented opt-out for Dark Reader.
export const metadata: Metadata = { other: { "darkreader-lock": "true" } };

// Pages read the profile/projects from the DB; without this `next build` bakes that data in
// and content edited in the admin would not show up until the next deploy.
export const dynamic = "force-dynamic";

const displayFont = Unbounded({
  variable: "--font-display",
  weight: ["700", "800", "900"],
  subsets: ["latin", "cyrillic"],
});

const handFont = Neucha({
  variable: "--font-hand",
  weight: "400",
  subsets: ["latin", "cyrillic"],
});

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const metrikaId = /^\d+$/.test(process.env.YANDEX_METRIKA_ID ?? "") ? Number(process.env.YANDEX_METRIKA_ID) : null;

  return (
    // Clip horizontal animation overflow without creating a nested scroller.
    // hidden + visible computes to hidden + auto; clip keeps Y visible.
    // before:* is a second, fixed copy of the page colour. Some Chrome setups on Mac fail to paint
    // the page background of the root layer (showing a darker colour) while fixed elements paint
    // correctly, so the colour is also laid down as a fixed layer under the content.
    <div data-site-root className={`isolate before:pointer-events-none before:fixed before:inset-0 before:-z-10 before:bg-[#141312] before:content-[''] ${displayFont.variable} ${handFont.variable} min-h-screen overflow-x-clip overflow-y-visible bg-[#141312] text-[#ece5d6] selection:bg-[#e2451f] selection:text-[#141312]`}>
      <LocaleProvider locale={locale} dict={getDictionary(locale)}>
        <CookieConsentProvider metrikaId={metrikaId}>
          <LanguageSwitcher className="fixed right-6 top-3 z-40 sm:right-12 sm:top-4" />
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </CookieConsentProvider>
      </LocaleProvider>
    </div>
  );
}
