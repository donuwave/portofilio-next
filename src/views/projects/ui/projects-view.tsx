import { getPublishedProjects } from "@/entities/project/api/get-published-projects";
import { getDictionary, getLocale } from "@/shared/i18n/get-locale";
import { localizePath } from "@/shared/i18n/localize-path";
import { PageBackLink } from "@/shared/ui/page-back-link";
import { ProjectCard } from "@/entities/project/ui/project-card";

export async function ProjectsView() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const projects = await getPublishedProjects();

  return (
    <main className="mx-auto max-w-[88rem] px-6 pb-24 pt-28 sm:px-12">
      <PageBackLink href={localizePath("/", locale)}>{dict.projects.back}</PageBackLink>

      <h1 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-none text-[#ece5d6]">{dict.projects.featured}</h1>
      <p className="mt-6 max-w-[36rem] leading-[1.65] text-[#8a8378]">
        {dict.projects.intro}
      </p>

      {projects.length === 0 ? (
        <p className="mt-16 text-[#8a8378]">{dict.projects.empty}</p>
      ) : (
        <div className="mt-14 grid gap-x-12 gap-y-16 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} locale={locale} />
          ))}
        </div>
      )}
    </main>
  );
}
