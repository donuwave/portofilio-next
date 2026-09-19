import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, parseJsonBody } from "@/lib/api";
import { experienceUpdateSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await parseJsonBody(request);
    const data = experienceUpdateSchema.parse(body);

    const existing = await prisma.experience.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Experience entry not found");

    const experience = await prisma.experience.update({ where: { id }, data });
    return NextResponse.json(experience);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const existing = await prisma.experience.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Experience entry not found");

    await prisma.experience.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleApiError(err);
  }
}
