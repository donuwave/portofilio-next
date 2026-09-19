import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, parseJsonBody } from "@/lib/api";
import { projectUpdateSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: { cover: true, cases: { orderBy: { order: "asc" } } },
    });
    if (!project) throw new ApiError(404, "Project not found");
    return NextResponse.json(project);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await parseJsonBody(request);
    const data = projectUpdateSchema.parse(body);

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Project not found");

    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await prisma.project.findUnique({ where: { slug: data.slug } });
      if (slugTaken) throw new ApiError(409, "Project with this slug already exists");
    }

    const project = await prisma.project.update({
      where: { id },
      data,
      include: { cover: true, cases: { orderBy: { order: "asc" } } },
    });
    return NextResponse.json(project);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Project not found");

    await prisma.project.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleApiError(err);
  }
}
