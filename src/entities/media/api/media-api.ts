import { apiFetch } from "@/shared/api/http";
import type { Media, MediaType } from "../model/types";

export type MediaListParams = {
  type?: MediaType;
  search?: string;
  page?: number;
  pageSize?: number;
};

export type MediaListResult = {
  items: Media[];
  total: number;
  page: number;
  pageSize: number;
};

export function fetchMediaList(params: MediaListParams = {}): Promise<MediaListResult> {
  const query = new URLSearchParams();
  if (params.type) query.set("type", params.type);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));

  const qs = query.toString();
  return apiFetch<MediaListResult>(`/api/media${qs ? `?${qs}` : ""}`);
}

export function uploadMedia(file: File): Promise<Media> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<Media>("/api/media", { method: "POST", body: formData });
}

export function deleteMedia(id: string): Promise<void> {
  return apiFetch<void>(`/api/media/${id}`, { method: "DELETE" });
}
