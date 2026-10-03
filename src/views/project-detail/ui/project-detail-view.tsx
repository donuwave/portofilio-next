import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/entities/project/api/get-project-by-slug";
import { ProjectHeader } from "@/entities/project/ui/project-header";
import { ProjectCases } from "@/widgets/project-cases/ui/project-cases";

export async function ProjectDetailView({ slug }: { slug: string }) {
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div>
      <Link
        href="/projects"
        className="fixed left-6 top-6 z-10 font-hand text-xl text-[#8a8378] hover:text-[#ece5d6] sm:left-12 sm:top-8"
      >
        ← Назад
      </Link>
      <ProjectHeader project={project} />
      <ProjectCases cases={project.cases} />
    </div>
  );
}
