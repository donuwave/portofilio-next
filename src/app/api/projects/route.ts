import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, parseJsonBody } from "@/lib/api";
import { projectCreateSchema, projectStatusSchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const status = statusParam ? projectStatusSchema.parse(statusParam) : undefined;

    const projects = await prisma.project.findMany({
      where: status ? { status } : undefined,
      include: { cover: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(projects);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const data = projectCreateSchema.parse(body);

    const existing = await prisma.project.findUnique({ where: { slug: data.slug } });
    if (existing) throw new ApiError(409, "Project with this slug already exists");

    const project = await prisma.project.create({ data, include: { cover: true } });
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
