import { pickLocalized } from "@/shared/lib/localized-text";
import { ScribbleUnderline } from "@/shared/ui/scribble-underline";
import type { Project } from "../model/types";

export function ProjectHeader({ project }: { project: Project }) {
  const title = pickLocalized(project.title);
  const description = pickLocalized(project.description);

  return (
    <header className="px-6 pb-16 pt-28 sm:px-12 sm:pt-36">
      <h1 className="break-words font-display text-[13vw] leading-[0.85] text-[#ece5d6] sm:text-8xl">{title}</h1>
      <ScribbleUnderline className="mt-5 h-3 w-40 text-[#e2451f] sm:h-4 sm:w-56" />
      <p className="mt-8 max-w-xl text-[#b8b1a3]">{description}</p>
      {project.techStack.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {project.techStack.map((tech) => (
            <span key={tech} className="text-xs tracking-wide text-[#8a8378]">
              {tech}
            </span>
          ))}
        </div>
      )}
      {project.cover && (
        <div className="mt-14 aspect-video overflow-hidden bg-[#1d1b18]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.cover.path} alt={title} className="h-full w-full object-cover" />
        </div>
      )}
    </header>
  );
}
