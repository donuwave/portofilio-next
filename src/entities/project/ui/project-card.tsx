import Link from "next/link";
import { pickLocalized } from "@/shared/lib/localized-text";
import type { Project } from "../model/types";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const title = pickLocalized(project.title);
  const number = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block border-t border-[#2a2824] py-10 first:border-t-0 sm:py-14"
    >
      <div className="flex items-baseline gap-4 px-6 sm:px-12">
        <span className="font-hand text-2xl text-[#e2451f]">{number}</span>
        <h3 className="min-w-0 break-words font-display text-3xl leading-none text-[#ece5d6] transition-colors group-hover:text-[#e2451f] sm:text-5xl">
          {title}
        </h3>
      </div>
      <div className="mt-8 aspect-video overflow-hidden bg-[#1d1b18] sm:mx-12 sm:mt-8">
        {project.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.cover.path}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[#5c584f]">{title}</div>
        )}
      </div>
      {project.techStack.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3 px-6 sm:px-12">
          {project.techStack.map((tech) => (
            <span key={tech} className="text-xs tracking-wide text-[#8a8378]">
              {tech}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
