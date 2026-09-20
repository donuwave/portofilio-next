import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { LocalizedText } from "@/shared/lib/localized-text";
import type { Profile } from "../model/types";

// Deduped per-request: both generateMetadata and the page component call this.
export const getProfile = cache(async (): Promise<Profile | null> => {
  const profile = await prisma.profile.findUnique({
    where: { id: 1 },
    include: { avatar: true },
  });
  if (!profile) return null;

  return {
    name: profile.name,
    role: profile.role as unknown as LocalizedText,
    about: profile.about as unknown as LocalizedText,
    avatar: profile.avatar ? { path: profile.avatar.path } : null,
    skills: profile.skills,
    currentJobCompany: profile.currentJobCompany,
    currentJobPosition: profile.currentJobPosition as unknown as LocalizedText | null,
    currentJobDescription: profile.currentJobDescription as unknown as LocalizedText | null,
  };
});
