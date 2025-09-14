-- AlterTable
ALTER TABLE "public"."courses" ADD COLUMN     "institutionId" TEXT;

-- CreateIndex
CREATE INDEX "courses_institutionId_idx" ON "public"."courses"("institutionId");

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
