import type { Metadata } from "next";
import { getProjectBySlug } from "@/entities/project/api/get-project-by-slug";
import { pickLocalized } from "@/shared/lib/localized-text";
import { ProjectDetailView } from "@/views/project-detail/ui/project-detail-view";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: pickLocalized(project.title),
    description: pickLocalized(project.description),
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  return <ProjectDetailView slug={slug} />;
}
