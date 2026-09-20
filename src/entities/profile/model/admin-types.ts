import type { ExperienceAdmin } from "@/entities/experience/model/admin-types";
import type { Media } from "@/entities/media/model/types";
import type { LocalizedText } from "@/shared/lib/localized-text";

/** Full admin-editable shape of Profile — a superset of the public entities/profile/model/types Profile. */
export type ProfileAdmin = {
  name: string;
  role: LocalizedText;
  about: LocalizedText;
  avatarId: string | null;
  avatar: Media | null;
  skills: string[];
  currentJobCompany: string | null;
  currentJobPosition: LocalizedText | null;
  currentJobFrom: string | null;
  currentJobDescription: LocalizedText | null;
  experience: ExperienceAdmin[];
};

export type ProfileUpdateInput = Partial<Omit<ProfileAdmin, "avatar">>;
