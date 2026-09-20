import type { Media } from "@/entities/media/model/types";
import type { LocalizedText } from "@/shared/lib/localized-text";

export type CaseAdmin = {
  id: string;
  projectId: string;
  title: LocalizedText;
  description: LocalizedText;
  order: number;
};

export type CaseCreateInput = Omit<CaseAdmin, "id" | "projectId">;
export type CaseUpdateInput = Partial<CaseCreateInput>;

/** A CaseMedia join row as returned with its Media included. */
export type CaseMediaEntry = {
  caseId: string;
  mediaId: string;
  order: number;
  media: Media;
};
