import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, parseJsonBody } from "@/lib/api";
import { caseCreateSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const cases = await prisma.case.findMany({
      where: { projectId: id },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(cases);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id: projectId } = await params;
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new ApiError(404, "Project not found");

    const body = await parseJsonBody(request);
    const data = caseCreateSchema.parse(body);

    const caseEntry = await prisma.case.create({
      data: { ...data, projectId },
    });
    return NextResponse.json(caseEntry, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
