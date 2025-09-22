/*
  Warnings:

  - You are about to drop the column `entrepreneurshipId` on the `business_plans` table. All the data in the column will be lost.
  - Added the required column `userId` to the `business_plans` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."business_plans" DROP CONSTRAINT "business_plans_entrepreneurshipId_fkey";

-- DropIndex
DROP INDEX "public"."business_plans_entrepreneurshipId_idx";

-- DropIndex
DROP INDEX "public"."business_plans_entrepreneurshipId_key";

-- AlterTable
ALTER TABLE "public"."business_plans" DROP COLUMN "entrepreneurshipId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "business_plans_userId_idx" ON "public"."business_plans"("userId");

-- AddForeignKey
ALTER TABLE "public"."business_plans" ADD CONSTRAINT "business_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
