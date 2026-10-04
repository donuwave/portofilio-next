import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/entities/project/api/get-project-by-slug";
import { ProjectTag } from "@/entities/project/ui/project-tag";
import { getDictionary, getLocale } from "@/shared/i18n/get-locale";
import { localizePath } from "@/shared/i18n/localize-path";
import { pickLocalized } from "@/shared/lib/localized-text";
import { PageBackLink } from "@/shared/ui/page-back-link";
import { SectionHeading } from "@/shared/ui/section-heading";
import { CaseNav } from "@/widgets/project-cases/ui/case-nav";
import { ProjectCases } from "@/widgets/project-cases/ui/project-cases";

export async function ProjectDetailView({ slug }: { slug: string }) {
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const title = pickLocalized(project.title, locale);
  const description = pickLocalized(project.description, locale);
  const sections = [
    { id: "project-about", title: dict.projects.aboutProject },
    ...(project.cases.length > 0
      ? [
          {
            id: "project-cases",
            title: dict.projects.cases,
            children: project.cases.map((caseItem) => ({
              id: `case-${caseItem.id}`,
              title: pickLocalized(caseItem.title, locale),
            })),
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-[96rem] px-6 pb-28 pt-24 sm:px-12 lg:grid lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)] lg:gap-20 lg:pt-28">
      <PageBackLink href={localizePath("/projects", locale)}>{dict.projects.back}</PageBackLink>

      <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto">
        <div>
          <ProjectTag tag={project.tag} locale={locale} />
          <h1 className="mt-4 break-words font-display text-[clamp(1.25rem,1.75vw,1.75rem)] leading-[1.15] text-[#ece5d6]">
            {title}
          </h1>
          {project.techStack.length > 0 && (
            <p className="mt-5 text-sm leading-relaxed text-[#8a8378]">{project.techStack.join(", ")}</p>
          )}
        </div>

        {project.cases.length > 0 && (
          <div className="mt-12 hidden lg:block">
            <p className="mb-3 text-sm text-[#8a8378]">{dict.projects.contents}</p>
            <CaseNav sections={sections} />
          </div>
        )}
      </aside>

      <main className="mt-14 min-w-0 lg:mt-0">
        <div id="project-about">
          <SectionHeading index={0} label={dict.projects.aboutProject} />

          {project.cover && (
            <div className="mt-10 aspect-[16/10] overflow-hidden rounded-sm bg-[#1a1816]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={project.cover.path} alt={title} className="h-full w-full object-cover" />
            </div>
          )}

          <p className="mt-10 max-w-[44rem] whitespace-pre-line text-lg leading-[1.7] text-[#cfc8b8]">{description}</p>
        </div>

        <div className="mt-28">
          <ProjectCases cases={project.cases} locale={locale} />
        </div>
      </main>
    </div>
  );
}
