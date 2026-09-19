import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api";

type Params = { params: Promise<{ id: string; mediaId: string }> };

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
