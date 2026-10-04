import type { Metadata } from "next";
import { getProjectBySlug } from "@/entities/project/api/get-project-by-slug";
import { getLocale } from "@/shared/i18n/get-locale";
import { localeAlternates } from "@/shared/i18n/metadata";
import { pickLocalized } from "@/shared/lib/localized-text";
import { ProjectDetailView } from "@/views/project-detail/ui/project-detail-view";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [project, locale] = await Promise.all([getProjectBySlug(slug), getLocale()]);
  if (!project) return {};

  return {
    title: pickLocalized(project.title, locale),
    description: pickLocalized(project.description, locale),
    alternates: localeAlternates(`/projects/${slug}`, locale),
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  return <ProjectDetailView slug={slug} />;
}
