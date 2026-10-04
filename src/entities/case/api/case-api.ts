import { apiFetch } from "@/shared/api/http";
import type { CaseAdmin, CaseCreateInput, CaseMediaEntry, CaseUpdateInput } from "../model/admin-types";

export function fetchCasesAdmin(projectId: string): Promise<CaseAdmin[]> {
  return apiFetch<CaseAdmin[]>(`/api/projects/${projectId}/cases`);
}

export function createCase(projectId: string, data: CaseCreateInput): Promise<CaseAdmin> {
  return apiFetch<CaseAdmin>(`/api/projects/${projectId}/cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function updateCase(id: string, data: CaseUpdateInput): Promise<CaseAdmin> {
  return apiFetch<CaseAdmin>(`/api/cases/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function deleteCase(id: string): Promise<void> {
  return apiFetch<void>(`/api/cases/${id}`, { method: "DELETE" });
}

export function fetchCaseMedia(caseId: string): Promise<CaseMediaEntry[]> {
  return apiFetch<CaseMediaEntry[]>(`/api/cases/${caseId}/media`);
}

export function addCaseMedia(caseId: string, mediaId: string): Promise<CaseMediaEntry> {
  return apiFetch<CaseMediaEntry>(`/api/cases/${caseId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mediaId }),
  });
}

export function removeCaseMedia(caseId: string, mediaId: string): Promise<void> {
  return apiFetch<void>(`/api/cases/${caseId}/media/${mediaId}`, { method: "DELETE" });
}

export function updateCaseMediaFraming(
  caseId: string,
  mediaId: string,
  framing: { zoom: number; offsetX: number; offsetY: number }
): Promise<CaseMediaEntry> {
  return apiFetch<CaseMediaEntry>(`/api/cases/${caseId}/media/${mediaId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(framing),
  });
}

export function reorderCaseMedia(caseId: string, mediaIds: string[]): Promise<CaseMediaEntry[]> {
  return apiFetch<CaseMediaEntry[]>(`/api/cases/${caseId}/media`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mediaIds }),
  });
}
