import { prisma } from "@/lib/prisma";
import type { LocalizedText } from "@/shared/lib/localized-text";
import type { Project } from "../model/types";

export async function getPublishedProjects(): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    where: { status: "published" },
    include: { cover: true },
    orderBy: { order: "asc" },
  });

  return projects.map((project) => ({
    slug: project.slug,
    title: project.title as unknown as LocalizedText,
    description: project.description as unknown as LocalizedText,
    tag: (project.tag as unknown as LocalizedText | null) ?? null,
    cover: project.cover ? { path: project.cover.path } : null,
    techStack: project.techStack,
  }));
}
