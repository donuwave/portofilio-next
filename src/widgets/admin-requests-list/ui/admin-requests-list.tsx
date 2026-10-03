"use client";

import { useEffect, useState } from "react";
import {
  deleteContactRequest,
  fetchContactRequests,
  setContactRequestRead,
} from "@/entities/contact-request/api/contact-request-api";
import type { ContactRequest } from "@/entities/contact-request/model/types";
import { ApiClientError } from "@/shared/api/http";
import { Button } from "@/shared/ui/button";

const dateFormat = new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" });

export function AdminRequestsList() {
  const [requests, setRequests] = useState<ContactRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContactRequests()
      .then(setRequests)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Не удалось загрузить заявки"));
  }, []);

  async function toggleRead(request: ContactRequest) {
    try {
      const updated = await setContactRequestRead(request.id, !request.read);
      setRequests((list) => list?.map((r) => (r.id === updated.id ? updated : r)) ?? null);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не удалось обновить заявку");
    }
  }

  async function remove(request: ContactRequest) {
    if (!confirm(`Удалить заявку от «${request.name}»?`)) return;
    try {
      await deleteContactRequest(request.id);
      setRequests((list) => list?.filter((r) => r.id !== request.id) ?? null);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не удалось удалить заявку");
    }
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!requests) return <p className="text-sm text-zinc-500">Загрузка…</p>;
  if (requests.length === 0) return <p className="text-sm text-zinc-500">Заявок пока нет. Они появятся здесь после отправки формы на сайте.</p>;

  return (
    <ul className="space-y-4">
      {requests.map((request) => (
        <li
          key={request.id}
          className={`rounded-lg border p-4 ${
            request.read ? "border-zinc-200 dark:border-zinc-800" : "border-zinc-900 dark:border-zinc-200"
          }`}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <span className="font-medium">{request.name}</span>
              <span className="ml-2 text-sm text-zinc-500">{request.contact}</span>
              {!request.read && <span className="ml-2 rounded bg-zinc-900 px-1.5 py-0.5 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900">новая</span>}
            </div>
            <time className="text-xs text-zinc-500">{dateFormat.format(new Date(request.createdAt))}</time>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm">{request.message}</p>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={() => toggleRead(request)}>
              {request.read ? "Отметить непрочитанной" : "Отметить прочитанной"}
            </Button>
            <Button variant="danger" onClick={() => remove(request)}>
              Удалить
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
