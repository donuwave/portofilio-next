import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import { indexingAllowed, NOINDEX_HEADER } from "@/lib/indexing";
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

type ByteRange = { start: number; end: number };

/**
 * "bytes=0-1023", "bytes=500-" or "bytes=-500" -> an inclusive byte range. Returns "ignore" for a
 * header that is not a single byte range (the standard says to serve the whole file then) and
 * "unsatisfiable" for a well-formed range that lies outside the file (a 416).
 */
function parseRange(header: string, size: number): ByteRange | "ignore" | "unsatisfiable" {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (!match[1] && !match[2])) return "ignore";
  let start: number;
  let end: number;
  if (!match[1]) {
    // Suffix range: the last N bytes.
    start = Math.max(0, size - Number(match[2]));
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  }
  return start <= end && start < size ? { start, end } : "unsatisfiable";
}

export async function GET(request: Request, { params }: Params) {
  const { path: segments } = await params;

  // Uploaded filenames are always a single flat segment (see saveUploadedFile) —
  // taking the basename of the joined path defeats any "../" traversal attempt.
  const filename = path.basename(segments.join("/"));
  const uploadsDir = getUploadsDir();
  const filePath = path.join(uploadsDir, filename);

  if (!filePath.startsWith(uploadsDir)) {
    return new NextResponse(null, { status: 400 });
  }

  let size: number;
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return new NextResponse(null, { status: 404 });
    size = info.size;
  } catch {
    return new NextResponse(null, { status: 404 });
  }

  const headers: Record<string, string> = {
    "Content-Type": CONTENT_TYPES[path.extname(filename).toLowerCase()] ?? "application/octet-stream",
    // Filenames are randomly generated per upload and never reused or mutated.
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
    // An SVG can carry <script>; opened directly it would run on our origin. Sandbox it
    // (inside <img> scripts never run anyway).
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    ...(indexingAllowed() ? {} : { "X-Robots-Tag": NOINDEX_HEADER }),
  };

  // Video needs Range requests: without them browsers cannot seek, and Safari refuses to play.
  const parsed = request.headers.get("range") ? parseRange(request.headers.get("range")!, size) : "ignore";
  if (parsed === "unsatisfiable") {
    return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }
  const range = parsed === "ignore" ? null : parsed;

  // Streamed, never read into memory: a demo video can be over a hundred megabytes.
  const start = range?.start ?? 0;
  const end = range?.end ?? size - 1;
  const stream = Readable.toWeb(createReadStream(filePath, { start, end })) as ReadableStream;

  return new NextResponse(stream, {
    status: range ? 206 : 200,
    headers: {
      ...headers,
      "Content-Length": String(end - start + 1),
      ...(range ? { "Content-Range": `bytes ${start}-${end}/${size}` } : {}),
    },
  });
}
