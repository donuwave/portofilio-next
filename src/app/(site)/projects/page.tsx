import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/shared/i18n/get-locale";
import { localeAlternates } from "@/shared/i18n/metadata";
import { ProjectsView } from "@/views/projects/ui/projects-view";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: getDictionary(locale).metadata.projectsTitle,
    alternates: localeAlternates("/projects", locale),
  };
}

export default function ProjectsPage() {
  return <ProjectsView />;
}
