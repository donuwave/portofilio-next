"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { uploadMedia } from "@/entities/media/api/media-api";
import type { Media } from "@/entities/media/model/types";
import { ApiClientError } from "@/shared/api/http";

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml,video/mp4,video/webm,video/quicktime";

export function UploadMediaForm({ onUploaded }: { onUploaded: (media: Media) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const media = await uploadMedia(file);
      onUploaded(media);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не удалось загрузить файл");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-1">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleChange}
        disabled={isUploading}
        className="text-sm"
      />
      {isUploading && <p className="text-xs text-zinc-500">Загрузка...</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
