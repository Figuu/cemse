-- CreateEnum
CREATE TYPE "public"."PostType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'LINK', 'POLL', 'EVENT', 'QUESTION', 'ACHIEVEMENT', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "public"."ResourceType" AS ENUM ('ARTICLE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'TOOL', 'TEMPLATE', 'GUIDE', 'CHECKLIST', 'WEBINAR', 'COURSE');

-- AlterTable
ALTER TABLE "public"."business_plans" ADD COLUMN     "marketAnalysis" JSONB;

-- AlterTable
ALTER TABLE "public"."companies" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "public"."resources" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PUBLISHED';

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;

-- CreateTable
CREATE TABLE "public"."questions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "difficulty" TEXT DEFAULT 'medium',
    "points" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."answers" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."entrepreneurship_posts" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "public"."PostType" NOT NULL DEFAULT 'TEXT',
    "images" TEXT[],
    "tags" TEXT[],
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entrepreneurship_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post_likes" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post_comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."entrepreneurship_resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "public"."ResourceType" NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "url" TEXT,
    "fileUrl" TEXT,
    "imageUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entrepreneurship_resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "questions_category_idx" ON "public"."questions"("category");

-- CreateIndex
CREATE INDEX "questions_isActive_idx" ON "public"."questions"("isActive");

-- CreateIndex
CREATE INDEX "answers_questionId_idx" ON "public"."answers"("questionId");

-- CreateIndex
CREATE INDEX "answers_isCorrect_idx" ON "public"."answers"("isCorrect");

-- CreateIndex
CREATE INDEX "entrepreneurship_posts_authorId_idx" ON "public"."entrepreneurship_posts"("authorId");

-- CreateIndex
CREATE INDEX "entrepreneurship_posts_type_idx" ON "public"."entrepreneurship_posts"("type");

-- CreateIndex
CREATE INDEX "entrepreneurship_posts_isPublic_idx" ON "public"."entrepreneurship_posts"("isPublic");

-- CreateIndex
CREATE INDEX "entrepreneurship_posts_createdAt_idx" ON "public"."entrepreneurship_posts"("createdAt");

-- CreateIndex
CREATE INDEX "post_likes_postId_idx" ON "public"."post_likes"("postId");

-- CreateIndex
CREATE INDEX "post_likes_userId_idx" ON "public"."post_likes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "post_likes_postId_userId_key" ON "public"."post_likes"("postId", "userId");

-- CreateIndex
CREATE INDEX "post_comments_postId_idx" ON "public"."post_comments"("postId");

-- CreateIndex
CREATE INDEX "post_comments_authorId_idx" ON "public"."post_comments"("authorId");

-- CreateIndex
CREATE INDEX "post_comments_parentId_idx" ON "public"."post_comments"("parentId");

-- CreateIndex
CREATE INDEX "post_comments_createdAt_idx" ON "public"."post_comments"("createdAt");

-- CreateIndex
CREATE INDEX "entrepreneurship_resources_authorId_idx" ON "public"."entrepreneurship_resources"("authorId");

-- CreateIndex
CREATE INDEX "entrepreneurship_resources_type_idx" ON "public"."entrepreneurship_resources"("type");

-- CreateIndex
CREATE INDEX "entrepreneurship_resources_category_idx" ON "public"."entrepreneurship_resources"("category");

-- CreateIndex
CREATE INDEX "entrepreneurship_resources_isPublic_idx" ON "public"."entrepreneurship_resources"("isPublic");

-- CreateIndex
CREATE INDEX "entrepreneurship_resources_isFeatured_idx" ON "public"."entrepreneurship_resources"("isFeatured");

-- AddForeignKey
ALTER TABLE "public"."answers" ADD CONSTRAINT "answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entrepreneurship_posts" ADD CONSTRAINT "entrepreneurship_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_likes" ADD CONSTRAINT "post_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."entrepreneurship_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_likes" ADD CONSTRAINT "post_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_comments" ADD CONSTRAINT "post_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."entrepreneurship_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_comments" ADD CONSTRAINT "post_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_comments" ADD CONSTRAINT "post_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."post_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entrepreneurship_resources" ADD CONSTRAINT "entrepreneurship_resources_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
