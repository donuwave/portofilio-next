"use client";

import { useState } from "react";
import { deleteMedia } from "@/entities/media/api/media-api";
import { ApiClientError } from "@/shared/api/http";
import { Button } from "@/shared/ui/button";

type UsageDetails = { cases?: number; projectCovers?: number; profileAvatar?: number };

function describeUsage(details: unknown): string {
  const d = (details ?? {}) as UsageDetails;
  const parts: string[] = [];
  if (d.cases) parts.push(`в кейсах: ${d.cases}`);
  if (d.projectCovers) parts.push(`в обложках проектов: ${d.projectCovers}`);
  if (d.profileAvatar) parts.push("в аватаре профиля");
  return parts.length > 0 ? parts.join(", ") : "в другом месте";
}

export function DeleteMediaButton({ mediaId, onDeleted }: { mediaId: string; onDeleted: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Удалить файл без возможности восстановления?")) return;

    setIsDeleting(true);
    setError(null);
    try {
      await deleteMedia(mediaId);
      onDeleted();
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 409) {
        setError(`Файл используется (${describeUsage(err.details)}) и не может быть удалён.`);
      } else {
        setError(err instanceof Error ? err.message : "Не удалось удалить файл");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button variant="danger" className="w-full" onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? "Удаление..." : "Удалить"}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
