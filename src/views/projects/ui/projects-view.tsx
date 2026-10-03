import Link from "next/link";
import { getPublishedProjects } from "@/entities/project/api/get-published-projects";
import { ProjectCard } from "@/entities/project/ui/project-card";

export async function ProjectsView() {
  const projects = await getPublishedProjects();

  return (
    <main className="mx-auto max-w-[88rem] px-6 pb-24 pt-28 sm:px-12">
      <Link
        href="/"
        className="fixed left-6 top-6 z-10 font-hand text-xl text-[#8a8378] hover:text-[#ece5d6] sm:left-12 sm:top-8"
      >
        ← Назад
      </Link>

      <h1 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-none text-[#ece5d6]">Избранные работы</h1>
      <p className="mt-6 max-w-[36rem] leading-[1.65] text-[#8a8378]">
        Проекты, над которыми я работал. Внутри каждого — разбор задач и того, как они решены.
      </p>

      {projects.length === 0 ? (
        <p className="mt-16 text-[#8a8378]">Скоро здесь появятся проекты.</p>
      ) : (
        <div className="mt-14 grid gap-x-12 gap-y-16 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}
    </main>
  );
}
