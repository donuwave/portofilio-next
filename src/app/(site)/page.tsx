import type { Metadata } from "next";
import { getProfile } from "@/entities/profile/api/get-profile";
import { pickLocalized } from "@/shared/lib/localized-text";
import { HomeView } from "@/views/home/ui/home-view";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  if (!profile) return {};

  return {
    title: profile.name,
    description: pickLocalized(profile.role),
  };
}

export default function Home() {
  return <HomeView />;
}
