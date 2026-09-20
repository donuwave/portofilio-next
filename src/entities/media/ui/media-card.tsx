import type { Media } from "../model/types";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export function MediaCard({ media }: { media: Media }) {
  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
      <div className="flex aspect-square items-center justify-center bg-zinc-100 dark:bg-zinc-800">
        {media.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media.path} alt={media.filename} className="h-full w-full object-cover" />
        ) : (
          <video src={media.path} className="h-full w-full object-cover" muted />
        )}
      </div>
      <div className="space-y-0.5 p-2">
        <p className="truncate text-sm" title={media.filename}>
          {media.filename}
        </p>
        <p className="text-xs text-zinc-500">{formatBytes(media.size)}</p>
      </div>
    </div>
  );
}
