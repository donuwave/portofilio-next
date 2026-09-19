import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureProfile } from "@/lib/profile";
import { handleApiError, parseJsonBody } from "@/lib/api";
import { experienceCreateSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    await ensureProfile();
    const body = await parseJsonBody(request);
    const data = experienceCreateSchema.parse(body);

    const experience = await prisma.experience.create({
      data: { ...data, profileId: 1 },
    });
    return NextResponse.json(experience, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
