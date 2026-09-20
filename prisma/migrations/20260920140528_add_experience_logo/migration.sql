-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "logoId" TEXT;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
