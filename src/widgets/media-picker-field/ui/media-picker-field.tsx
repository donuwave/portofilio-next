"use client";

import { useState } from "react";
import type { Media, MediaType } from "@/entities/media/model/types";
import { Button } from "@/shared/ui/button";
import { MediaPicker } from "@/widgets/media-picker/ui/media-picker";

type MediaPickerFieldProps = {
  value: Media | null;
  onChange: (media: Media | null) => void;
  type?: MediaType;
};

export function MediaPickerField({ value, onChange, type }: MediaPickerFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
        {value && value.type === "video" ? (
          <video src={value.path} muted preload="metadata" className="h-full w-full object-cover" />
        ) : value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.path} alt={value.filename} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-zinc-400">Нет файла</span>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={() => setPickerOpen(true)}>
          {value ? "Заменить" : "Выбрать"}
        </Button>
        {value && (
          <Button type="button" variant="secondary" onClick={() => onChange(null)}>
            Убрать
          </Button>
        )}
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onChange}
        type={type}
      />
    </div>
  );
}
