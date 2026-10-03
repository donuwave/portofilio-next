import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, parseJsonBody } from "@/lib/api";
import { contactRequestUpdateSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

async function findOrThrow(id: string) {
  const existing = await prisma.contactRequest.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Request not found");
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const data = contactRequestUpdateSchema.parse(await parseJsonBody(request));
    await findOrThrow(id);
    const updated = await prisma.contactRequest.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await findOrThrow(id);
    await prisma.contactRequest.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleApiError(err);
  }
}
