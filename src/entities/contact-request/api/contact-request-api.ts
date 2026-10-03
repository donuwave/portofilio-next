import { apiFetch } from "@/shared/api/http";
import type { ContactRequest, ContactRequestInput } from "../model/types";

export function submitContactRequest(data: ContactRequestInput): Promise<void> {
  return apiFetch<void>("/api/public/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function fetchContactRequests(): Promise<ContactRequest[]> {
  return apiFetch<ContactRequest[]>("/api/contact-requests");
}

export function setContactRequestRead(id: string, read: boolean): Promise<ContactRequest> {
  return apiFetch<ContactRequest>(`/api/contact-requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ read }),
  });
}

export function deleteContactRequest(id: string): Promise<void> {
  return apiFetch<void>(`/api/contact-requests/${id}`, { method: "DELETE" });
}
