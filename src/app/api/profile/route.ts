import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureProfile } from "@/lib/profile";
import { handleApiError, parseJsonBody } from "@/lib/api";
import { profileUpdateSchema } from "@/lib/validation";

export async function GET() {
  try {
    await ensureProfile();
    const profile = await prisma.profile.findUniqueOrThrow({
      where: { id: 1 },
      include: {
        avatar: true,
        experience: { orderBy: { order: "asc" } },
      },
    });
    return NextResponse.json(profile);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureProfile();
    const body = await parseJsonBody(request);
    const data = profileUpdateSchema.parse(body);

    const profile = await prisma.profile.update({
      where: { id: 1 },
      data: data as Prisma.ProfileUncheckedUpdateInput,
      include: {
        avatar: true,
        experience: { orderBy: { order: "asc" } },
      },
    });
    return NextResponse.json(profile);
  } catch (err) {
    return handleApiError(err);
  }
}
