import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, parseJsonBody } from "@/lib/api";
import { caseMediaAddSchema, caseMediaSetSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id: caseId } = await params;
    const items = await prisma.caseMedia.findMany({
      where: { caseId },
      include: { media: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(items);
  } catch (err) {
    return handleApiError(err);
  }
}

/** Replaces the full ordered list of media for a case (used by the admin drag-n-drop sorter). */
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id: caseId } = await params;
    const caseEntry = await prisma.case.findUnique({ where: { id: caseId } });
    if (!caseEntry) throw new ApiError(404, "Case not found");

    const body = await parseJsonBody(request);
    const { mediaIds } = caseMediaSetSchema.parse(body);

    const uniqueIds = Array.from(new Set(mediaIds));
    const foundCount = await prisma.media.count({ where: { id: { in: uniqueIds } } });
    if (foundCount !== uniqueIds.length) {
      throw new ApiError(400, "One or more mediaIds do not exist");
    }

    await prisma.$transaction([
      prisma.caseMedia.deleteMany({ where: { caseId, mediaId: { notIn: uniqueIds } } }),
      ...uniqueIds.map((mediaId, order) =>
        prisma.caseMedia.upsert({
          where: { caseId_mediaId: { caseId, mediaId } },
          create: { caseId, mediaId, order },
          update: { order },
        })
      ),
    ]);

    const items = await prisma.caseMedia.findMany({
      where: { caseId },
      include: { media: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(items);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id: caseId } = await params;
    const caseEntry = await prisma.case.findUnique({ where: { id: caseId } });
    if (!caseEntry) throw new ApiError(404, "Case not found");

    const body = await parseJsonBody(request);
    const { mediaId } = caseMediaAddSchema.parse(body);

    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) throw new ApiError(404, "Media not found");

    const last = await prisma.caseMedia.findFirst({
      where: { caseId },
      orderBy: { order: "desc" },
    });

    const item = await prisma.caseMedia.upsert({
      where: { caseId_mediaId: { caseId, mediaId } },
      create: { caseId, mediaId, order: (last?.order ?? -1) + 1 },
      update: {},
      include: { media: true },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
