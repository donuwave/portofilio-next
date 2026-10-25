import type { LocalizedText } from "@/shared/lib/localized-text";
import type { Case } from "@/entities/case/model/types";

export type ProjectCover = {
  path: string;
} | null;

export type Project = {
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  tag: LocalizedText | null;
  cover: ProjectCover;
  techStack: string[];
};

export type RepoLink = { label: string; url: string };

export type ProjectDetail = Project & {
  demoVideo: { path: string } | null;
  repos: RepoLink[];
  cases: Case[];
};
