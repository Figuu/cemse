-- AlterTable
ALTER TABLE "public"."business_plans" ADD COLUMN     "businessModelCanvas" JSONB,
ADD COLUMN     "completionPercentage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "financialProjections" JSONB,
ADD COLUMN     "lastUpdatedSection" TEXT,
ADD COLUMN     "tripleImpactAssessment" JSONB;

-- CreateIndex
CREATE INDEX "business_plans_completionPercentage_idx" ON "public"."business_plans"("completionPercentage");

-- CreateIndex
CREATE INDEX "business_plans_status_idx" ON "public"."business_plans"("status");
