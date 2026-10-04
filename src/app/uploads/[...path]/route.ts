import { readFile, stat } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getUploadsDir } from "@/lib/media-storage";

export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

type Params = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, { params }: Params) {
  const { path: segments } = await params;

  // Uploaded filenames are always a single flat segment (see saveUploadedFile) —
  // taking the basename of the joined path defeats any "../" traversal attempt.
  const filename = path.basename(segments.join("/"));
  const uploadsDir = getUploadsDir();
  const filePath = path.join(uploadsDir, filename);

  if (!filePath.startsWith(uploadsDir)) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    await stat(filePath);
    const data = await readFile(filePath);
    const contentType = CONTENT_TYPES[path.extname(filename).toLowerCase()] ?? "application/octet-stream";

    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        // Filenames are randomly generated per upload and never reused or mutated.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        // An SVG can carry <script>; opened directly it would run on our origin. Sandbox it
        // (inside <img> scripts never run anyway).
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
