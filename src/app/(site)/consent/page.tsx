import type { Metadata } from "next";
import { getLocale } from "@/shared/i18n/get-locale";
import { localeAlternates } from "@/shared/i18n/metadata";
import { consentContent } from "@/views/legal/content/consent";
import { LegalView } from "@/views/legal/ui/legal-view";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: consentContent[locale].title, alternates: localeAlternates("/consent", locale) };
}

export default function ConsentPage() {
  return <LegalView content={consentContent} />;
}
