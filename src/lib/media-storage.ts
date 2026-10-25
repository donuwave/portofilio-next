import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import type { MediaType } from "@prisma/client";

const ALLOWED_MIME_TYPES: Record<string, MediaType> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "image/avif": "image",
  "image/svg+xml": "image",
  "video/mp4": "video",
  "video/webm": "video",
  "video/quicktime": "video",
};

// Uploads pass through proxy.ts, which buffers request bodies in memory up to
// experimental.proxyClientMaxBodySize (next.config.ts, 160 MB). Keep these below that, or a body
// would be silently cut off and saved as a corrupt file.
export const MAX_UPLOAD_BYTES = { image: 25 * 1024 * 1024, video: 150 * 1024 * 1024 } as const;

export function getUploadsDir() {
  return path.resolve(process.cwd(), process.env.UPLOADS_DIR ?? "./data/uploads");
}

export function resolveMediaType(mimeType: string): MediaType | null {
  return ALLOWED_MIME_TYPES[mimeType] ?? null;
}

export async function saveUploadedFile(file: File) {
  const mediaType = resolveMediaType(file.type);
  if (!mediaType) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
  const maxBytes = MAX_UPLOAD_BYTES[mediaType];
  if (file.size > maxBytes) {
    throw new Error(`Файл слишком большой: максимум ${Math.round(maxBytes / 1024 / 1024)} МБ для ${mediaType === "video" ? "видео" : "изображений"}`);
  }

  const uploadsDir = getUploadsDir();
  await mkdir(uploadsDir, { recursive: true });

  // SVG is served from our origin, so never let the client-supplied name decide its extension.
  const ext = file.type === "image/svg+xml" ? ".svg" : path.extname(file.name) || defaultExtension(file.type);
  const generatedName = `${randomUUID()}${ext}`;
  const diskPath = path.join(uploadsDir, generatedName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(diskPath, buffer);

  return {
    type: mediaType,
    filename: file.name,
    path: `/uploads/${generatedName}`,
    size: buffer.byteLength,
    mimeType: file.type,
  };
}

export async function deleteUploadedFile(publicPath: string) {
  const uploadsDir = getUploadsDir();
  const filename = path.basename(publicPath);
  const diskPath = path.join(uploadsDir, filename);

  if (!diskPath.startsWith(uploadsDir)) {
    throw new Error("Refusing to delete file outside uploads directory");
  }

  await unlink(diskPath).catch((err) => {
    if (err.code !== "ENOENT") throw err;
  });
}

function defaultExtension(mimeType: string) {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
    "image/svg+xml": ".svg",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
  };
  return map[mimeType] ?? "";
}
