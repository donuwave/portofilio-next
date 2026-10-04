import type { Metadata } from "next";
import { getProfile } from "@/entities/profile/api/get-profile";
import { getLocale } from "@/shared/i18n/get-locale";
import { localeAlternates } from "@/shared/i18n/metadata";
import { pickLocalized } from "@/shared/lib/localized-text";
import { HomeView } from "@/views/home/ui/home-view";

export async function generateMetadata(): Promise<Metadata> {
  const [profile, locale] = await Promise.all([getProfile(), getLocale()]);
  if (!profile) return {};

  return {
    title: profile.name,
    description: pickLocalized(profile.role, locale),
    alternates: localeAlternates("/", locale),
  };
}

export default function Home() {
  return <HomeView />;
}
