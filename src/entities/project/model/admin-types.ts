import type { Case } from "@/entities/case/model/types";
import type { Media } from "@/entities/media/model/types";
import type { LocalizedText } from "@/shared/lib/localized-text";

export type ProjectStatus = "draft" | "published";

export type ProjectAdmin = {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  coverId: string | null;
  cover: Media | null;
  techStack: string[];
  status: ProjectStatus;
  order: number;
  cases?: Case[];
};

export type ProjectCreateInput = Omit<ProjectAdmin, "id" | "cover" | "cases">;
export type ProjectUpdateInput = Partial<ProjectCreateInput>;
