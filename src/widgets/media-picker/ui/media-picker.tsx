"use client";

import { useState } from "react";
import { useMediaList } from "@/entities/media/lib/use-media-list";
import type { Media, MediaType } from "@/entities/media/model/types";
import { PickableMediaCard } from "@/features/pick-media/ui/pickable-media-card";
import { UploadMediaForm } from "@/features/upload-media/ui/upload-media-form";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";

const PAGE_SIZE = 12;

type MediaPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (media: Media) => void;
  type?: MediaType;
};

/**
 * Reusable media-selection modal — the Profile (avatar) and Projects (cover, case
 * gallery) sections mount this to pick an existing Media row or upload a new one.
 */
export function MediaPicker({ open, onClose, onSelect, type }: MediaPickerProps) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Media | null>(null);
  const { data, isLoading, error, reload } = useMediaList({ type, page, pageSize: PAGE_SIZE });

  if (!open) return null;

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <Modal title="Выбрать файл" onClose={onClose}>
      <div className="space-y-4">
        <UploadMediaForm
          onUploaded={(media) => {
            reload();
            setSelected(media);
          }}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {isLoading && <p className="text-sm text-zinc-500">Загрузка...</p>}
        {data && data.items.length === 0 && !isLoading && (
          <p className="text-sm text-zinc-500">Файлов пока нет.</p>
        )}

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {data?.items.map((media) => (
            <PickableMediaCard
              key={media.id}
              media={media}
              selected={selected?.id === media.id}
              onSelect={setSelected}
            />
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

        <div className="flex justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button
            disabled={!selected}
            onClick={() => {
              if (selected) {
                onSelect(selected);
                onClose();
              }
            }}
          >
            Выбрать
          </Button>
        </div>
      </div>
    </Modal>
  );
}
