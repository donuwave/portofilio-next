import type { LocalizedText } from "@/shared/lib/localized-text";

export type Experience = {
  id: string;
  company: string;
  position: LocalizedText;
  dateFrom: string;
  dateTo: string | null;
  description: LocalizedText;
  url: string | null;
  logo: { path: string; zoom: number; x: number; y: number } | null;
};
