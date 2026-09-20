import { apiFetch } from "@/shared/api/http";
import type { ProjectAdmin, ProjectCreateInput, ProjectUpdateInput } from "../model/admin-types";

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
