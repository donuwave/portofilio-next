import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getLocale } from "@/shared/i18n/get-locale";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daniil Tareev",
  // Needed to turn the relative hreflang/canonical URLs of the public pages into absolute ones.
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Runs synchronously, before the browser applies its own scroll
            restoration on reload/back-forward — without this, reloading
            while scrolled down (e.g. near the bottom of the pinned hero
            section) lands the browser at that old scroll position before
            any of our own JS has run. The hero's own setup then always
            establishes elements' *scroll=0* positions unconditionally
            (gsap.set, not scroll-aware), so ScrollTrigger's scrubbed
            timeline — which does account for the real scroll position —
            has to visibly ease everything from that wrong starting point
            to the correct one once it catches up, which is what read as
            the whole page "animating up" right after a reload. Forcing
            scrollRestoration to manual (and starting every load at the
            top) means there's only ever one, already-correct position to
            render from. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if('scrollRestoration' in history){history.scrollRestoration='manual';}window.scrollTo(0,0);}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
