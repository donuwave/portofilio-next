import { prisma } from "@/lib/prisma";

const EMPTY_LOCALIZED = { ru: "", en: "" };

export async function ensureProfile() {
  return prisma.profile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "",
      role: EMPTY_LOCALIZED,
      about: EMPTY_LOCALIZED,
      skills: [],
    },
  });
}
