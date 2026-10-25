import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api";
import { deleteUploadedFile } from "@/lib/media-storage";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) throw new ApiError(404, "Media not found");
    return NextResponse.json(media);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) throw new ApiError(404, "Media not found");

    const [caseUsageCount, projectCoverCount, projectDemoCount, profileAvatarCount, experienceLogoCount] = await Promise.all([
      prisma.caseMedia.count({ where: { mediaId: id } }),
      prisma.project.count({ where: { coverId: id } }),
      prisma.project.count({ where: { demoVideoId: id } }),
      prisma.profile.count({ where: { avatarId: id } }),
      prisma.experience.count({ where: { logoId: id } }),
    ]);

    const usages = caseUsageCount + projectCoverCount + projectDemoCount + profileAvatarCount + experienceLogoCount;
    if (usages > 0) {
      throw new ApiError(409, "Media is still in use and cannot be deleted", {
        cases: caseUsageCount,
        projectCovers: projectCoverCount,
        projectDemos: projectDemoCount,
        profileAvatar: profileAvatarCount,
        experienceLogos: experienceLogoCount,
      });
    }

    await prisma.media.delete({ where: { id } });
    await deleteUploadedFile(media.path);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleApiError(err);
  }
}
