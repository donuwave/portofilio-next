import { apiFetch } from "@/shared/api/http";
import type { ExperienceAdmin, ExperienceCreateInput, ExperienceUpdateInput } from "../model/admin-types";

export function createExperience(data: ExperienceCreateInput): Promise<ExperienceAdmin> {
  return apiFetch<ExperienceAdmin>("/api/profile/experience", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function updateExperience(id: string, data: ExperienceUpdateInput): Promise<ExperienceAdmin> {
  return apiFetch<ExperienceAdmin>(`/api/profile/experience/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function deleteExperience(id: string): Promise<void> {
  return apiFetch<void>(`/api/profile/experience/${id}`, { method: "DELETE" });
}
