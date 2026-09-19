import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, parseJsonBody } from "@/lib/api";
import { caseUpdateSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const caseEntry = await prisma.case.findUnique({
      where: { id },
      include: { media: { include: { media: true }, orderBy: { order: "asc" } } },
    });
    if (!caseEntry) throw new ApiError(404, "Case not found");
    return NextResponse.json(caseEntry);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await parseJsonBody(request);
    const data = caseUpdateSchema.parse(body);

    const existing = await prisma.case.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Case not found");

    const caseEntry = await prisma.case.update({ where: { id }, data });
    return NextResponse.json(caseEntry);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const existing = await prisma.case.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Case not found");

    await prisma.case.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleApiError(err);
  }
}
