import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/entities/project/api/get-project-by-slug";
import { DemoVideo } from "@/entities/project/ui/demo-video";
import { ProjectTag } from "@/entities/project/ui/project-tag";
import { RepoLinks } from "@/entities/project/ui/repo-links";
import { TechStack } from "@/entities/project/ui/tech-stack";
import { getDictionary, getLocale } from "@/shared/i18n/get-locale";
import { localizePath } from "@/shared/i18n/localize-path";
import { pickLocalized } from "@/shared/lib/localized-text";
import { Markdown } from "@/shared/ui/markdown";
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
  const hasCode = project.repos.length > 0;
  const sections = [
    { id: "project-about", title: dict.projects.aboutProject },
    ...(hasCode ? [{ id: "project-code", title: dict.projects.code }] : []),
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
            <div className="mt-5">
              <TechStack items={project.techStack} variant="chips" />
            </div>
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
        {project.demoVideo && (
          <div className="mb-16 lg:mb-24">
            <DemoVideo path={project.demoVideo.path} poster={project.cover?.path} label={dict.projects.demoVideoLabel} />
          </div>
        )}

        <div id="project-about">
          <SectionHeading index={0} label={dict.projects.aboutProject} />

          {project.cover && (
            <div className="mt-10 aspect-[16/10] overflow-hidden rounded-sm bg-[#1a1816]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={project.cover.path} alt={title} className="h-full w-full object-cover" />
            </div>
          )}

          <Markdown className="mt-10 max-w-[44rem]">{description}</Markdown>
        </div>

        {hasCode && (
          <div id="project-code" className="mt-28">
            <SectionHeading index={1} label={dict.projects.code} />
            <RepoLinks repos={project.repos} />
          </div>
        )}

        <div className="mt-28">
          <ProjectCases cases={project.cases} locale={locale} index={hasCode ? 2 : 1} />
        </div>
      </main>
    </div>
  );
}
