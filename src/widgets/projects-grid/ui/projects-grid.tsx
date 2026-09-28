import { ProjectCard } from "@/entities/project/ui/project-card";
import type { Project } from "@/entities/project/model/types";
import { SectionHeading } from "@/shared/ui/section-heading";

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  return (
    <section>
      <div className="px-6 pt-24 pb-12 sm:px-12">
        <SectionHeading index={2} label="Проекты">
          Избранные работы
        </SectionHeading>
      </div>
      {projects.length === 0 ? (
        <p className="px-6 pb-20 text-[#8a8378] sm:px-12">Скоро здесь появятся проекты.</p>
      ) : (
        projects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)
      )}
    </section>
  );
}
