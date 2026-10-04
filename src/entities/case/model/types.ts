import type { LocalizedText } from "@/shared/lib/localized-text";

export type CaseMediaItem = {
  id: string;
  type: "image" | "video";
  path: string;
  zoom: number;
  x: number;
  y: number;
};

export type Case = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  media: CaseMediaItem[];
};
