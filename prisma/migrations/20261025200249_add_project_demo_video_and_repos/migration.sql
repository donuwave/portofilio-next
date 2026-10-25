-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "demoVideoId" TEXT,
ADD COLUMN     "repos" JSONB NOT NULL DEFAULT '[]';

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_demoVideoId_fkey" FOREIGN KEY ("demoVideoId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
