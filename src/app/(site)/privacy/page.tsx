import type { Metadata } from "next";
import { getLocale } from "@/shared/i18n/get-locale";
import { localeAlternates } from "@/shared/i18n/metadata";
import { privacyContent } from "@/views/legal/content/privacy";
import { LegalView } from "@/views/legal/ui/legal-view";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: privacyContent[locale].title, alternates: localeAlternates("/privacy", locale) };
}

export default function PrivacyPage() {
  return <LegalView content={privacyContent} />;
}
