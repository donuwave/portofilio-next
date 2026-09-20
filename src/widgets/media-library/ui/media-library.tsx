"use client";

import { useState } from "react";
import { useMediaList } from "@/entities/media/lib/use-media-list";
import { MediaCard } from "@/entities/media/ui/media-card";
import type { MediaType } from "@/entities/media/model/types";
import { DeleteMediaButton } from "@/features/delete-media/ui/delete-media-button";
import { UploadMediaForm } from "@/features/upload-media/ui/upload-media-form";
import { Button } from "@/shared/ui/button";

const PAGE_SIZE = 24;

export function MediaLibrary() {
  const [type, setType] = useState<MediaType | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error, reload } = useMediaList({
    type,
    search: search || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Поиск по имени файла"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <select
            value={type ?? ""}
            onChange={(e) => {
              setType(e.target.value === "" ? undefined : (e.target.value as MediaType));
              setPage(1);
            }}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">Все типы</option>
            <option value="image">Изображения</option>
            <option value="video">Видео</option>
          </select>
        </div>
        <UploadMediaForm onUploaded={() => reload()} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {isLoading && <p className="text-sm text-zinc-500">Загрузка...</p>}
      {data && data.items.length === 0 && !isLoading && (
        <p className="text-sm text-zinc-500">Файлов пока нет.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {data?.items.map((media) => (
          <div key={media.id} className="space-y-2">
            <MediaCard media={media} />
            <DeleteMediaButton mediaId={media.id} onDeleted={reload} />
          </div>
        ))}
      </div>

      {data && data.total > PAGE_SIZE && (
        <div className="flex items-center gap-3">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Назад
          </Button>
          <span className="text-sm text-zinc-500">
            {page} / {totalPages}
          </span>
          <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Вперёд
          </Button>
        </div>
      )}
    </div>
  );
}
