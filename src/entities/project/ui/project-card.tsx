import Link from "next/link";
import { pickLocalized } from "@/shared/lib/localized-text";
import type { Project } from "../model/types";

export function ProjectCard({
  project,
  headingLevel: Heading = "h2",
}: {
  project: Project;
  headingLevel?: "h2" | "h3";
}) {
  const title = pickLocalized(project.title);
  const description = pickLocalized(project.description);
  const tag = project.tag ? pickLocalized(project.tag) : null;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block min-w-0 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#e2451f]"
    >
      {project.cover && (
        <div className="mb-6 overflow-hidden rounded-sm bg-[#201e1b]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.cover.path}
            alt={title}
            loading="lazy"
            className="aspect-[16/10] w-full object-cover"
          />
        </div>
      )}
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          {tag && <p className="mb-2 text-sm text-[#b8b1a3]">{tag}</p>}
          <Heading className="break-words font-display text-[clamp(1.375rem,2.1vw,2rem)] leading-[1.3] text-[#ece5d6] transition-colors group-hover:text-[#e2451f]">
            {title}
          </Heading>
        </div>
        <span aria-hidden="true" className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#484238] text-[#cfc8b8] transition-colors group-hover:border-[#e2451f] group-hover:bg-[#e2451f] group-hover:text-[#141312]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
            <path d="M6 18 18 6M6 6h12v12" />
          </svg>
        </span>
      </div>
      {description && <p className="mt-4 line-clamp-3 max-w-[62ch] text-base leading-[1.7] text-[#b8b1a3]">{description}</p>}
      {project.techStack.length > 0 && (
        <p className="mt-4 text-sm leading-relaxed text-[#8a8378]">{project.techStack.join(", ")}</p>
      )}
    </Link>
  );
}
