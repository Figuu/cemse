/*
  Warnings:

  - The values [GOVERNMENT,NGO] on the enum `NewsType` will be removed. If these variants are still used in the database, this will fail.
  - The values [INSTRUCTOR] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `executiveSummary` on the `business_plans` table. All the data in the column will be lost.
  - You are about to drop the column `financialProjections` on the `business_plans` table. All the data in the column will be lost.
  - You are about to drop the column `marketAnalysis` on the `business_plans` table. All the data in the column will be lost.
  - You are about to drop the column `marketingStrategy` on the `business_plans` table. All the data in the column will be lost.
  - You are about to drop the column `operationsPlan` on the `business_plans` table. All the data in the column will be lost.
  - You are about to drop the column `riskAnalysis` on the `business_plans` table. All the data in the column will be lost.
  - You are about to drop the column `certificateUrl` on the `certificates` table. All the data in the column will be lost.
  - You are about to drop the column `municipalityId` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `isCompleted` on the `course_enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `lastAccessedAt` on the `course_enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `required` on the `job_questions` table. All the data in the column will be lost.
  - You are about to drop the column `isCompleted` on the `lesson_progress` table. All the data in the column will be lost.
  - You are about to drop the column `certificateUrl` on the `module_certificates` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `municipalityId` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `maxAttempts` on the `quizzes` table. All the data in the column will be lost.
  - You are about to drop the column `hiredAt` on the `youth_application_company_interests` table. All the data in the column will be lost.
  - You are about to drop the column `interviewAt` on the `youth_application_company_interests` table. All the data in the column will be lost.
  - You are about to drop the `discussions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `job_application_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lesson_resources` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `municipalities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `news_comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_notes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `youth_application_messages` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[courseId,studentId]` on the table `certificates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,institutionId]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[moduleId,studentId]` on the table `module_certificates` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `content` to the `business_plans` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."MessageContextType" AS ENUM ('JOB_APPLICATION', 'YOUTH_APPLICATION', 'ENTREPRENEURSHIP', 'GENERAL');

-- CreateEnum
CREATE TYPE "public"."EntrepreneurshipConnectionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."EmployeeStatus" AS ENUM ('ACTIVE', 'TERMINATED', 'ON_LEAVE');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."NewsType_new" AS ENUM ('COMPANY', 'INSTITUTION', 'ADMIN');
ALTER TABLE "public"."news_articles" ALTER COLUMN "authorType" TYPE "public"."NewsType_new" USING ("authorType"::text::"public"."NewsType_new");
ALTER TYPE "public"."NewsType" RENAME TO "NewsType_old";
ALTER TYPE "public"."NewsType_new" RENAME TO "NewsType";
DROP TYPE "public"."NewsType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserRole_new" AS ENUM ('YOUTH', 'COMPANIES', 'INSTITUTION', 'SUPERADMIN');
ALTER TABLE "public"."users" ALTER COLUMN "role" TYPE "public"."UserRole_new" USING ("role"::text::"public"."UserRole_new");
ALTER TYPE "public"."UserRole" RENAME TO "UserRole_old";
ALTER TYPE "public"."UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."companies" DROP CONSTRAINT "companies_municipalityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."discussions" DROP CONSTRAINT "discussions_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."discussions" DROP CONSTRAINT "discussions_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."job_application_messages" DROP CONSTRAINT "job_application_messages_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."lesson_resources" DROP CONSTRAINT "lesson_resources_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."municipalities" DROP CONSTRAINT "municipalities_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."news_articles" DROP CONSTRAINT "news_articles_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."news_comments" DROP CONSTRAINT "news_comments_articleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."news_comments" DROP CONSTRAINT "news_comments_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_municipalityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."student_notes" DROP CONSTRAINT "student_notes_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."student_notes" DROP CONSTRAINT "student_notes_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."youth_application_messages" DROP CONSTRAINT "youth_application_messages_applicationId_fkey";

-- DropIndex
DROP INDEX "public"."certificates_studentId_courseId_key";

-- DropIndex
DROP INDEX "public"."companies_municipalityId_idx";

-- DropIndex
DROP INDEX "public"."companies_name_municipalityId_key";

-- DropIndex
DROP INDEX "public"."module_certificates_studentId_moduleId_key";

-- DropIndex
DROP INDEX "public"."profiles_municipalityId_idx";

-- AlterTable
ALTER TABLE "public"."business_plans" DROP COLUMN "executiveSummary",
DROP COLUMN "financialProjections",
DROP COLUMN "marketAnalysis",
DROP COLUMN "marketingStrategy",
DROP COLUMN "operationsPlan",
DROP COLUMN "riskAnalysis",
ADD COLUMN     "content" JSONB NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "public"."certificates" DROP COLUMN "certificateUrl",
ADD COLUMN     "certificateType" TEXT NOT NULL DEFAULT 'course',
ADD COLUMN     "fileUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."companies" DROP COLUMN "municipalityId",
ADD COLUMN     "institutionId" TEXT;

-- AlterTable
ALTER TABLE "public"."course_enrollments" DROP COLUMN "isCompleted",
DROP COLUMN "lastAccessedAt",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "public"."job_applications" ADD COLUMN     "employeeStatus" "public"."EmployeeStatus",
ADD COLUMN     "hiredAt" TIMESTAMP(3),
ADD COLUMN     "terminatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."job_question_answers" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."job_questions" DROP COLUMN "required",
ADD COLUMN     "isRequired" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."lesson_progress" DROP COLUMN "isCompleted",
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."module_certificates" DROP COLUMN "certificateUrl",
ADD COLUMN     "fileUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."profiles" DROP COLUMN "addressLine",
DROP COLUMN "email",
DROP COLUMN "municipalityId",
ADD COLUMN     "institutionId" TEXT;

-- AlterTable
ALTER TABLE "public"."quiz_attempts" ADD COLUMN     "timeSpent" INTEGER;

-- AlterTable
ALTER TABLE "public"."quizzes" DROP COLUMN "maxAttempts",
ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."youth_application_company_interests" DROP COLUMN "hiredAt",
DROP COLUMN "interviewAt";

-- DropTable
DROP TABLE "public"."discussions";

-- DropTable
DROP TABLE "public"."job_application_messages";

-- DropTable
DROP TABLE "public"."lesson_resources";

-- DropTable
DROP TABLE "public"."municipalities";

-- DropTable
DROP TABLE "public"."news_comments";

-- DropTable
DROP TABLE "public"."student_notes";

-- DropTable
DROP TABLE "public"."youth_application_messages";

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'text',
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "contextType" "public"."MessageContextType" NOT NULL,
    "contextId" TEXT,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."entrepreneurship_connections" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "addresseeId" TEXT NOT NULL,
    "status" "public"."EntrepreneurshipConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "entrepreneurship_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company_employees" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "position" TEXT,
    "hiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terminatedAt" TIMESTAMP(3),
    "status" "public"."EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "salary" DECIMAL(65,30),
    "contractType" "public"."ContractType",

    CONSTRAINT "company_employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "public"."messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_recipientId_idx" ON "public"."messages"("recipientId");

-- CreateIndex
CREATE INDEX "messages_contextType_contextId_idx" ON "public"."messages"("contextType", "contextId");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "public"."messages"("createdAt");

-- CreateIndex
CREATE INDEX "entrepreneurship_connections_requesterId_idx" ON "public"."entrepreneurship_connections"("requesterId");

-- CreateIndex
CREATE INDEX "entrepreneurship_connections_addresseeId_idx" ON "public"."entrepreneurship_connections"("addresseeId");

-- CreateIndex
CREATE INDEX "entrepreneurship_connections_status_idx" ON "public"."entrepreneurship_connections"("status");

-- CreateIndex
CREATE UNIQUE INDEX "entrepreneurship_connections_requesterId_addresseeId_key" ON "public"."entrepreneurship_connections"("requesterId", "addresseeId");

-- CreateIndex
CREATE INDEX "company_employees_companyId_idx" ON "public"."company_employees"("companyId");

-- CreateIndex
CREATE INDEX "company_employees_employeeId_idx" ON "public"."company_employees"("employeeId");

-- CreateIndex
CREATE INDEX "company_employees_status_idx" ON "public"."company_employees"("status");

-- CreateIndex
CREATE UNIQUE INDEX "company_employees_companyId_employeeId_key" ON "public"."company_employees"("companyId", "employeeId");

-- CreateIndex
CREATE INDEX "business_plans_entrepreneurshipId_idx" ON "public"."business_plans"("entrepreneurshipId");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_courseId_studentId_key" ON "public"."certificates"("courseId", "studentId");

-- CreateIndex
CREATE INDEX "companies_institutionId_idx" ON "public"."companies"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "company_name_institution_unique" ON "public"."companies"("name", "institutionId");

-- CreateIndex
CREATE INDEX "job_applications_hiredAt_idx" ON "public"."job_applications"("hiredAt");

-- CreateIndex
CREATE INDEX "job_applications_employeeStatus_idx" ON "public"."job_applications"("employeeStatus");

-- CreateIndex
CREATE INDEX "job_questions_orderIndex_idx" ON "public"."job_questions"("orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "module_certificates_moduleId_studentId_key" ON "public"."module_certificates"("moduleId", "studentId");

-- CreateIndex
CREATE INDEX "profiles_institutionId_idx" ON "public"."profiles"("institutionId");

-- CreateIndex
CREATE INDEX "youth_application_company_interests_status_idx" ON "public"."youth_application_company_interests"("status");

-- CreateIndex
CREATE INDEX "youth_application_company_interests_interestedAt_idx" ON "public"."youth_application_company_interests"("interestedAt");

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."news_articles" ADD CONSTRAINT "news_articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."companies" ADD CONSTRAINT "companies_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entrepreneurship_connections" ADD CONSTRAINT "entrepreneurship_connections_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entrepreneurship_connections" ADD CONSTRAINT "entrepreneurship_connections_addresseeId_fkey" FOREIGN KEY ("addresseeId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_employees" ADD CONSTRAINT "company_employees_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_employees" ADD CONSTRAINT "company_employees_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
