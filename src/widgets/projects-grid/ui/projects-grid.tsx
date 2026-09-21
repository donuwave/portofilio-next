import { ProjectCard } from "@/entities/project/ui/project-card";
import type { Project } from "@/entities/project/model/types";
import { SectionLabel } from "@/shared/ui/section-label";

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  return (
    <section className="border-t border-[#2a2824]">
      <div className="px-6 py-10 sm:px-12">
        <SectionLabel>ПРОЕКТЫ</SectionLabel>
      </div>
      {projects.length === 0 ? (
        <p className="px-6 pb-20 text-[#8a8378] sm:px-12">Скоро здесь появятся проекты.</p>
      ) : (
        projects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)
      )}
    </section>
  );
}
