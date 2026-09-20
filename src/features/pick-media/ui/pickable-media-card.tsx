"use client";

import { MediaCard } from "@/entities/media/ui/media-card";
import type { Media } from "@/entities/media/model/types";

export function PickableMediaCard({
  media,
  selected,
  onSelect,
}: {
  media: Media;
  selected: boolean;
  onSelect: (media: Media) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(media)}
      className={`rounded-md text-left outline-none ${
        selected ? "ring-2 ring-zinc-900 dark:ring-zinc-100" : ""
      }`}
    >
      <MediaCard media={media} />
    </button>
  );
}
