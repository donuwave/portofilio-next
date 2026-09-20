import type { Experience } from "@/entities/experience/model/types";
import type { LocalizedText } from "@/shared/lib/localized-text";

export type ProfileAvatar = {
  path: string;
} | null;

export type Profile = {
  name: string;
  role: LocalizedText;
  about: LocalizedText;
  avatar: ProfileAvatar;
  skills: string[];
  currentJobCompany: string | null;
  currentJobPosition: LocalizedText | null;
  currentJobDescription: LocalizedText | null;
  experience: Experience[];
};
