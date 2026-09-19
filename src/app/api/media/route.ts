import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api";
import { saveUploadedFile } from "@/lib/media-storage";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type");
    const search = searchParams.get("search");
    const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "50") || 50));

    if (typeParam && typeParam !== "image" && typeParam !== "video") {
      throw new ApiError(400, "type must be 'image' or 'video'");
    }
    const type = typeParam as "image" | "video" | null;

    const where: Prisma.MediaWhereInput = {
      ...(type ? { type } : {}),
      ...(search ? { filename: { contains: search, mode: "insensitive" } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.media.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, pageSize });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new ApiError(400, "Missing 'file' in form data");
    }

    let saved;
    try {
      saved = await saveUploadedFile(file);
    } catch (err) {
      throw new ApiError(400, err instanceof Error ? err.message : "Failed to save file");
    }

    const media = await prisma.media.create({ data: saved });
    return NextResponse.json(media, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
