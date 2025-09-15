/*
  Warnings:

  - Made the column `benefits` on table `job_offers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."job_offers" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "isUrgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reportingTo" TEXT,
ADD COLUMN     "responsibilities" TEXT[],
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "state" TEXT,
ADD COLUMN     "tags" TEXT[],
ALTER COLUMN "benefits" SET NOT NULL;
