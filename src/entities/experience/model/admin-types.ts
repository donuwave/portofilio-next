import type { Media } from "@/entities/media/model/types";
import type { LocalizedText } from "@/shared/lib/localized-text";

/** Full admin-editable shape of an Experience entry — a superset of the public entities/experience/model/types Experience. */
export type ExperienceAdmin = {
  id: string;
  company: string;
  position: LocalizedText;
  dateFrom: string;
  dateTo: string | null;
  description: LocalizedText;
  order: number;
  logoId: string | null;
  logo: Media | null;
};

export type ExperienceCreateInput = Omit<ExperienceAdmin, "id" | "logo">;
export type ExperienceUpdateInput = Partial<ExperienceCreateInput>;
