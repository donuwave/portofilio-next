import type { Case } from "@/entities/case/model/types";
import type { Media } from "@/entities/media/model/types";
import type { LocalizedText } from "@/shared/lib/localized-text";

export type ProjectStatus = "draft" | "published";

export type RepoLink = { label: string; url: string };

export type ProjectAdmin = {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  tag: LocalizedText | null;
  coverId: string | null;
  cover: Media | null;
  demoVideoId: string | null;
  demoVideo: Media | null;
  repos: RepoLink[];
  techStack: string[];
  status: ProjectStatus;
  order: number;
  cases?: Case[];
};

export type ProjectCreateInput = Omit<ProjectAdmin, "id" | "cover" | "demoVideo" | "cases">;

/** An icon from /api/tech-icons (Simple Icons): `path` is the SVG path of a 24x24 viewBox. */
export type TechIconData = { title: string; slug: string; hex: string; path: string };
export type ProjectUpdateInput = Partial<ProjectCreateInput>;
