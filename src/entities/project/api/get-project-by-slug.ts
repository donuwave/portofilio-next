import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { LocalizedText } from "@/shared/lib/localized-text";
import type { ProjectDetail, RepoLink } from "../model/types";

// repos is a Json column: never trust its shape blindly.
function toRepoLinks(value: unknown): RepoLink[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) =>
    item && typeof item.label === "string" && typeof item.url === "string" ? [{ label: item.label, url: item.url }] : []
  );
}

// Deduped per-request: both generateMetadata and the page component call this.
export const getProjectBySlug = cache(async (slug: string): Promise<ProjectDetail | null> => {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      cover: true,
      demoVideo: true,
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
    tag: (project.tag as unknown as LocalizedText | null) ?? null,
    cover: project.cover ? { path: project.cover.path } : null,
    techStack: project.techStack,
    demoVideo: project.demoVideo ? { path: project.demoVideo.path } : null,
    repos: toRepoLinks(project.repos),
    cases: project.cases.map((caseEntry) => ({
      id: caseEntry.id,
      title: caseEntry.title as unknown as LocalizedText,
      description: caseEntry.description as unknown as LocalizedText,
      media: caseEntry.media.map((caseMedia) => ({
        id: caseMedia.media.id,
        type: caseMedia.media.type,
        path: caseMedia.media.path,
        zoom: caseMedia.zoom,
        x: caseMedia.offsetX,
        y: caseMedia.offsetY,
      })),
    })),
  };
});
