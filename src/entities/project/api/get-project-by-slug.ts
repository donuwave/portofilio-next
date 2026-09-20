import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { LocalizedText } from "@/shared/lib/localized-text";
import type { ProjectDetail } from "../model/types";

// Deduped per-request: both generateMetadata and the page component call this.
export const getProjectBySlug = cache(async (slug: string): Promise<ProjectDetail | null> => {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      cover: true,
      cases: {
        orderBy: { order: "asc" },
        include: { media: { orderBy: { order: "asc" }, include: { media: true } } },
      },
    },
  });
  if (!project || project.status !== "published") return null;

  return {
    slug: project.slug,
    title: project.title as unknown as LocalizedText,
    description: project.description as unknown as LocalizedText,
    cover: project.cover ? { path: project.cover.path } : null,
    techStack: project.techStack,
    cases: project.cases.map((caseEntry) => ({
      id: caseEntry.id,
      title: caseEntry.title as unknown as LocalizedText,
      description: caseEntry.description as unknown as LocalizedText,
      media: caseEntry.media.map((caseMedia) => ({
        id: caseMedia.media.id,
        type: caseMedia.media.type,
        path: caseMedia.media.path,
      })),
    })),
  };
});
