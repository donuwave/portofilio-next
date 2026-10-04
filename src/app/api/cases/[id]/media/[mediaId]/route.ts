import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, parseJsonBody } from "@/lib/api";
import { caseMediaFramingSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string; mediaId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id: caseId, mediaId } = await params;
    const existing = await prisma.caseMedia.findUnique({
      where: { caseId_mediaId: { caseId, mediaId } },
    });
    if (!existing) throw new ApiError(404, "This media item is not attached to the case");

    const data = caseMediaFramingSchema.parse(await parseJsonBody(request));
    const item = await prisma.caseMedia.update({
      where: { caseId_mediaId: { caseId, mediaId } },
      data,
      include: { media: true },
    });
    return NextResponse.json(item);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id: caseId, mediaId } = await params;
    const existing = await prisma.caseMedia.findUnique({
      where: { caseId_mediaId: { caseId, mediaId } },
    });
    if (!existing) throw new ApiError(404, "This media item is not attached to the case");

    await prisma.caseMedia.delete({ where: { caseId_mediaId: { caseId, mediaId } } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleApiError(err);
  }
}
