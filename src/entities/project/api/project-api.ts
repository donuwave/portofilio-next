import { apiFetch } from "@/shared/api/http";
import type { ProjectAdmin, ProjectCreateInput, ProjectUpdateInput, TechIconData } from "../model/admin-types";

export function fetchProjectsAdmin(): Promise<ProjectAdmin[]> {
  return apiFetch<ProjectAdmin[]>("/api/projects");
}

export function fetchProjectAdmin(id: string): Promise<ProjectAdmin> {
  return apiFetch<ProjectAdmin>(`/api/projects/${id}`);
}

export function createProject(data: ProjectCreateInput): Promise<ProjectAdmin> {
  return apiFetch<ProjectAdmin>("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function updateProject(id: string, data: ProjectUpdateInput): Promise<ProjectAdmin> {
  return apiFetch<ProjectAdmin>(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function deleteProject(id: string): Promise<void> {
  return apiFetch<void>(`/api/projects/${id}`, { method: "DELETE" });
}

/** The brand icon for each technology name (null where there is none). */
export function fetchTechIcons(names: string[]): Promise<Record<string, TechIconData | null>> {
  return apiFetch<Record<string, TechIconData | null>>(`/api/tech-icons?names=${encodeURIComponent(names.join(","))}`);
}
