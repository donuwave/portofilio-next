import { apiFetch } from "@/shared/api/http";
import type { ProfileAdmin, ProfileUpdateInput } from "../model/admin-types";

export function fetchProfileAdmin(): Promise<ProfileAdmin> {
  return apiFetch<ProfileAdmin>("/api/profile");
}

export function updateProfileAdmin(data: ProfileUpdateInput): Promise<ProfileAdmin> {
  return apiFetch<ProfileAdmin>("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
