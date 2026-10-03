import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/entities/project/api/get-project-by-slug";
import { ProjectTag } from "@/entities/project/ui/project-tag";
import { pickLocalized } from "@/shared/lib/localized-text";
import { CaseNav } from "@/widgets/project-cases/ui/case-nav";
import { ProjectCases } from "@/widgets/project-cases/ui/project-cases";

export async function ProjectDetailView({ slug }: { slug: string }) {
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const title = pickLocalized(project.title);
  const description = pickLocalized(project.description);
  const sections = [
    { id: "project-about", title: "О проекте" },
    ...(project.cases.length > 0
      ? [
          {
            id: "project-cases",
            title: "Кейсы",
            children: project.cases.map((caseItem) => ({
              id: `case-${caseItem.id}`,
              title: pickLocalized(caseItem.title),
            })),
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-[96rem] px-6 pb-28 pt-8 sm:px-12 lg:grid lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)] lg:gap-20 lg:pt-12">
      <aside className="lg:sticky lg:top-12 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
        <Link href="/projects" className="font-hand text-xl text-[#8a8378] transition-colors hover:text-[#ece5d6]">
          ← Назад
        </Link>

        <div className="mt-10">
          <ProjectTag tag={project.tag} />
          <h1 className="mt-4 break-words font-display text-[clamp(1.25rem,1.75vw,1.75rem)] leading-[1.15] text-[#ece5d6]">
            {title}
          </h1>
          {project.techStack.length > 0 && (
            <p className="mt-5 text-sm leading-relaxed text-[#8a8378]">{project.techStack.join(", ")}</p>
          )}
        </div>

        {project.cases.length > 0 && (
          <div className="mt-12 hidden lg:block">
            <p className="mb-3 text-sm text-[#8a8378]">Содержание</p>
            <CaseNav sections={sections} />
          </div>
        )}
      </aside>

      <main className="mt-14 min-w-0 lg:mt-0">
        {project.cover && (
          <div className="aspect-[16/10] overflow-hidden rounded-sm bg-[#1a1816]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.cover.path} alt={title} className="h-full w-full object-cover" />
          </div>
        )}

        <div id="project-about" className="mt-12 max-w-[44rem]">
          <h2 className="text-sm text-[#8a8378]">О проекте</h2>
          <p className="mt-4 whitespace-pre-line text-lg leading-[1.7] text-[#cfc8b8]">{description}</p>
        </div>

        <div className="mt-20">
          <ProjectCases cases={project.cases} />
        </div>
      </main>
    </div>
  );
}
