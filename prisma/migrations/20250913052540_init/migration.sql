-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('YOUTH', 'COMPANIES', 'INSTITUTION', 'SUPERADMIN', 'INSTRUCTOR');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."InstitutionType" AS ENUM ('MUNICIPALITY', 'NGO', 'TRAINING_CENTER', 'FOUNDATION', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."EducationLevel" AS ENUM ('PRIMARY', 'SECONDARY', 'TECHNICAL', 'UNIVERSITY', 'POSTGRADUATE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CompanySize" AS ENUM ('MICRO', 'SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED', 'DRAFT');

-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('SENT', 'UNDER_REVIEW', 'PRE_SELECTED', 'REJECTED', 'HIRED');

-- CreateEnum
CREATE TYPE "public"."ContractType" AS ENUM ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'VOLUNTEER', 'FREELANCE');

-- CreateEnum
CREATE TYPE "public"."WorkModality" AS ENUM ('ON_SITE', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "public"."ExperienceLevel" AS ENUM ('NO_EXPERIENCE', 'ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL');

-- CreateEnum
CREATE TYPE "public"."CourseCategory" AS ENUM ('SOFT_SKILLS', 'BASIC_COMPETENCIES', 'JOB_PLACEMENT', 'ENTREPRENEURSHIP', 'TECHNICAL_SKILLS', 'DIGITAL_LITERACY', 'COMMUNICATION', 'LEADERSHIP');

-- CreateEnum
CREATE TYPE "public"."CourseLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "public"."LessonType" AS ENUM ('VIDEO', 'AUDIO', 'TEXT', 'QUIZ', 'EXERCISE', 'DOCUMENT', 'INTERACTIVE');

-- CreateEnum
CREATE TYPE "public"."BusinessStage" AS ENUM ('IDEA', 'STARTUP', 'GROWING', 'ESTABLISHED');

-- CreateEnum
CREATE TYPE "public"."NewsType" AS ENUM ('COMPANY', 'GOVERNMENT', 'NGO');

-- CreateEnum
CREATE TYPE "public"."NewsStatus" AS ENUM ('PUBLISHED', 'DRAFT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."NewsPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."YouthApplicationStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED', 'HIRED');

-- CreateEnum
CREATE TYPE "public"."CompanyInterestStatus" AS ENUM ('INTERESTED', 'CONTACTED', 'INTERVIEW_SCHEDULED', 'HIRED', 'NOT_INTERESTED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "refreshToken" TEXT,
    "refreshTokenExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "municipalityId" TEXT,
    "country" TEXT DEFAULT 'Bolivia',
    "birthDate" TIMESTAMP(3),
    "gender" TEXT,
    "documentType" TEXT,
    "documentNumber" TEXT,
    "educationLevel" "public"."EducationLevel",
    "currentInstitution" TEXT,
    "graduationYear" INTEGER,
    "isStudying" BOOLEAN,
    "skills" JSONB,
    "interests" JSONB,
    "socialLinks" JSONB,
    "workExperience" JSONB,
    "profileCompletion" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" TIMESTAMP(3),
    "parentalConsent" BOOLEAN NOT NULL DEFAULT false,
    "parentEmail" TEXT,
    "consentDate" TIMESTAMP(3),
    "achievements" JSONB,
    "addressLine" TEXT,
    "city" TEXT,
    "state" TEXT,
    "cityState" TEXT,
    "professionalSummary" TEXT,
    "extracurricularActivities" JSONB,
    "jobTitle" TEXT,
    "languages" JSONB,
    "projects" JSONB,
    "skillsWithLevel" JSONB,
    "websites" JSONB,
    "coverLetterContent" TEXT,
    "coverLetterRecipient" JSONB,
    "coverLetterSubject" TEXT,
    "coverLetterTemplate" TEXT DEFAULT 'professional',
    "academicAchievements" JSONB,
    "currentDegree" TEXT,
    "educationHistory" JSONB,
    "gpa" DOUBLE PRECISION,
    "universityEndDate" TIMESTAMP(3),
    "universityName" TEXT,
    "universityStartDate" TIMESTAMP(3),
    "universityStatus" TEXT,
    "targetPosition" TEXT,
    "targetCompany" TEXT,
    "relevantSkills" TEXT[],
    "cvUrl" TEXT,
    "coverLetterUrl" TEXT,
    "cvTemplate" TEXT,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "thumbnail" TEXT,
    "videoPreview" TEXT,
    "objectives" TEXT[],
    "prerequisites" TEXT[],
    "duration" INTEGER NOT NULL,
    "level" "public"."CourseLevel" NOT NULL,
    "category" "public"."CourseCategory" NOT NULL,
    "isMandatory" BOOLEAN DEFAULT false,
    "isActive" BOOLEAN DEFAULT true,
    "rating" DECIMAL(65,30) DEFAULT 0,
    "studentsCount" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DECIMAL(65,30) DEFAULT 0,
    "totalLessons" INTEGER NOT NULL DEFAULT 0,
    "totalQuizzes" INTEGER NOT NULL DEFAULT 0,
    "totalResources" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "certification" BOOLEAN DEFAULT true,
    "includedMaterials" TEXT[],
    "instructorId" TEXT,
    "institutionName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_modules" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "estimatedDuration" INTEGER NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "prerequisites" TEXT[],
    "certificateTemplate" TEXT,
    "hasCertificate" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "course_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lessons" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "contentType" "public"."LessonType" NOT NULL,
    "videoUrl" TEXT,
    "audioUrl" TEXT,
    "duration" INTEGER,
    "orderIndex" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isPreview" BOOLEAN NOT NULL DEFAULT false,
    "attachments" JSONB,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."job_offers" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "benefits" TEXT,
    "salaryMin" DECIMAL(65,30),
    "salaryMax" DECIMAL(65,30),
    "salaryCurrency" TEXT DEFAULT 'BOB',
    "contractType" "public"."ContractType" NOT NULL,
    "workSchedule" TEXT NOT NULL,
    "workModality" "public"."WorkModality" NOT NULL,
    "location" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT 'Cochabamba',
    "experienceLevel" "public"."ExperienceLevel" NOT NULL,
    "educationRequired" "public"."EducationLevel",
    "skillsRequired" TEXT[],
    "desiredSkills" TEXT[],
    "applicationDeadline" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "public"."JobStatus" NOT NULL DEFAULT 'ACTIVE',
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "applicationsCount" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "images" TEXT[],
    "logo" TEXT,

    CONSTRAINT "job_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."job_applications" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "jobOfferId" TEXT NOT NULL,
    "coverLetter" TEXT,
    "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'SENT',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "rating" INTEGER,
    "cvData" JSONB,
    "profileImage" TEXT,
    "coverLetterFile" TEXT,
    "cvFile" TEXT,
    "decisionReason" TEXT,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."youth_applications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cvFile" TEXT,
    "coverLetterFile" TEXT,
    "cvUrl" TEXT,
    "coverLetterUrl" TEXT,
    "status" "public"."YouthApplicationStatus" NOT NULL DEFAULT 'ACTIVE',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "applicationsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "youthProfileId" TEXT NOT NULL,

    CONSTRAINT "youth_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."entrepreneurships" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "businessStage" "public"."BusinessStage" NOT NULL,
    "logo" TEXT,
    "images" TEXT[],
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "municipality" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT 'Cochabamba',
    "socialMedia" JSONB,
    "founded" TIMESTAMP(3),
    "employees" INTEGER,
    "annualRevenue" DECIMAL(65,30),
    "businessModel" TEXT,
    "targetMarket" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DECIMAL(65,30) DEFAULT 0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entrepreneurships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."news_articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorType" "public"."NewsType" NOT NULL,
    "authorLogo" TEXT,
    "status" "public"."NewsStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "public"."NewsPriority" NOT NULL DEFAULT 'MEDIUM',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "category" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "targetAudience" TEXT[],
    "region" TEXT,
    "relatedLinks" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isEntrepreneurshipRelated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "downloadUrl" TEXT,
    "externalUrl" TEXT,
    "thumbnail" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publishedDate" TIMESTAMP(3) NOT NULL,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isEntrepreneurshipRelated" BOOLEAN NOT NULL DEFAULT false,
    "createdByUserId" TEXT NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "taxId" TEXT,
    "legalRepresentative" TEXT,
    "businessSector" TEXT,
    "companySize" "public"."CompanySize",
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "foundedYear" INTEGER,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "municipalityId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."institutions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "region" TEXT,
    "population" INTEGER,
    "mayorName" TEXT,
    "mayorEmail" TEXT,
    "mayorPhone" TEXT,
    "address" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "institutionType" "public"."InstitutionType" NOT NULL,
    "customType" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."municipalities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "region" TEXT,
    "population" INTEGER,
    "mayorName" TEXT,
    "mayorEmail" TEXT,
    "mayorPhone" TEXT,
    "address" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customType" TEXT,
    "institutionType" "public"."InstitutionType" NOT NULL DEFAULT 'MUNICIPALITY',
    "primaryColor" TEXT,
    "secondaryColor" TEXT,

    CONSTRAINT "municipalities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_enrollments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "progress" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "lastAccessedAt" TIMESTAMP(3),

    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lesson_progress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quizzes" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT,
    "courseId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "questions" JSONB NOT NULL,
    "timeLimit" INTEGER,
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "maxAttempts" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quiz_attempts" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" DECIMAL(65,30) NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."certificates" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "certificateUrl" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."module_certificates" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "certificateUrl" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "module_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lesson_resources" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "lesson_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."discussions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT,
    "courseId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discussions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_notes" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."business_plans" (
    "id" TEXT NOT NULL,
    "entrepreneurshipId" TEXT NOT NULL,
    "executiveSummary" TEXT,
    "marketAnalysis" TEXT,
    "financialProjections" JSONB,
    "marketingStrategy" TEXT,
    "operationsPlan" TEXT,
    "riskAnalysis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."job_questions" (
    "id" TEXT NOT NULL,
    "jobOfferId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "options" JSONB,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "job_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."job_question_answers" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "job_question_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."job_application_messages" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_application_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."youth_application_company_interests" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" "public"."CompanyInterestStatus" NOT NULL DEFAULT 'INTERESTED',
    "interestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contactedAt" TIMESTAMP(3),
    "interviewAt" TIMESTAMP(3),
    "hiredAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "youth_application_company_interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."youth_application_messages" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "youth_application_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."news_comments" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "public"."users"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "public"."profiles"("userId");

-- CreateIndex
CREATE INDEX "profiles_userId_idx" ON "public"."profiles"("userId");

-- CreateIndex
CREATE INDEX "profiles_municipalityId_idx" ON "public"."profiles"("municipalityId");

-- CreateIndex
CREATE INDEX "profiles_status_idx" ON "public"."profiles"("status");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "public"."courses"("slug");

-- CreateIndex
CREATE INDEX "courses_category_idx" ON "public"."courses"("category");

-- CreateIndex
CREATE INDEX "courses_level_idx" ON "public"."courses"("level");

-- CreateIndex
CREATE INDEX "courses_isMandatory_idx" ON "public"."courses"("isMandatory");

-- CreateIndex
CREATE INDEX "courses_isActive_idx" ON "public"."courses"("isActive");

-- CreateIndex
CREATE INDEX "courses_instructorId_idx" ON "public"."courses"("instructorId");

-- CreateIndex
CREATE INDEX "course_modules_courseId_idx" ON "public"."course_modules"("courseId");

-- CreateIndex
CREATE INDEX "course_modules_orderIndex_idx" ON "public"."course_modules"("orderIndex");

-- CreateIndex
CREATE INDEX "lessons_moduleId_idx" ON "public"."lessons"("moduleId");

-- CreateIndex
CREATE INDEX "lessons_orderIndex_idx" ON "public"."lessons"("orderIndex");

-- CreateIndex
CREATE INDEX "job_offers_companyId_idx" ON "public"."job_offers"("companyId");

-- CreateIndex
CREATE INDEX "job_offers_municipality_idx" ON "public"."job_offers"("municipality");

-- CreateIndex
CREATE INDEX "job_offers_contractType_idx" ON "public"."job_offers"("contractType");

-- CreateIndex
CREATE INDEX "job_offers_workModality_idx" ON "public"."job_offers"("workModality");

-- CreateIndex
CREATE INDEX "job_offers_isActive_idx" ON "public"."job_offers"("isActive");

-- CreateIndex
CREATE INDEX "job_offers_status_idx" ON "public"."job_offers"("status");

-- CreateIndex
CREATE INDEX "job_applications_applicantId_idx" ON "public"."job_applications"("applicantId");

-- CreateIndex
CREATE INDEX "job_applications_jobOfferId_idx" ON "public"."job_applications"("jobOfferId");

-- CreateIndex
CREATE INDEX "job_applications_status_idx" ON "public"."job_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_applicantId_jobOfferId_key" ON "public"."job_applications"("applicantId", "jobOfferId");

-- CreateIndex
CREATE INDEX "youth_applications_youthProfileId_idx" ON "public"."youth_applications"("youthProfileId");

-- CreateIndex
CREATE INDEX "youth_applications_status_idx" ON "public"."youth_applications"("status");

-- CreateIndex
CREATE INDEX "youth_applications_isPublic_idx" ON "public"."youth_applications"("isPublic");

-- CreateIndex
CREATE INDEX "youth_applications_createdAt_idx" ON "public"."youth_applications"("createdAt");

-- CreateIndex
CREATE INDEX "entrepreneurships_ownerId_idx" ON "public"."entrepreneurships"("ownerId");

-- CreateIndex
CREATE INDEX "entrepreneurships_category_idx" ON "public"."entrepreneurships"("category");

-- CreateIndex
CREATE INDEX "entrepreneurships_municipality_idx" ON "public"."entrepreneurships"("municipality");

-- CreateIndex
CREATE INDEX "entrepreneurships_businessStage_idx" ON "public"."entrepreneurships"("businessStage");

-- CreateIndex
CREATE INDEX "entrepreneurships_isActive_isPublic_idx" ON "public"."entrepreneurships"("isActive", "isPublic");

-- CreateIndex
CREATE INDEX "news_articles_authorId_idx" ON "public"."news_articles"("authorId");

-- CreateIndex
CREATE INDEX "news_articles_status_idx" ON "public"."news_articles"("status");

-- CreateIndex
CREATE INDEX "news_articles_category_idx" ON "public"."news_articles"("category");

-- CreateIndex
CREATE INDEX "news_articles_publishedAt_idx" ON "public"."news_articles"("publishedAt");

-- CreateIndex
CREATE INDEX "news_articles_targetAudience_idx" ON "public"."news_articles"("targetAudience");

-- CreateIndex
CREATE INDEX "resources_createdByUserId_idx" ON "public"."resources"("createdByUserId");

-- CreateIndex
CREATE INDEX "resources_type_idx" ON "public"."resources"("type");

-- CreateIndex
CREATE INDEX "resources_category_idx" ON "public"."resources"("category");

-- CreateIndex
CREATE INDEX "resources_isPublic_idx" ON "public"."resources"("isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "companies_email_key" ON "public"."companies"("email");

-- CreateIndex
CREATE INDEX "companies_municipalityId_idx" ON "public"."companies"("municipalityId");

-- CreateIndex
CREATE INDEX "companies_businessSector_idx" ON "public"."companies"("businessSector");

-- CreateIndex
CREATE INDEX "companies_isActive_idx" ON "public"."companies"("isActive");

-- CreateIndex
CREATE INDEX "companies_createdBy_idx" ON "public"."companies"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_municipalityId_key" ON "public"."companies"("name", "municipalityId");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_email_key" ON "public"."institutions"("email");

-- CreateIndex
CREATE INDEX "institutions_department_idx" ON "public"."institutions"("department");

-- CreateIndex
CREATE INDEX "institutions_isActive_idx" ON "public"."institutions"("isActive");

-- CreateIndex
CREATE INDEX "institutions_createdBy_idx" ON "public"."institutions"("createdBy");

-- CreateIndex
CREATE INDEX "institutions_institutionType_idx" ON "public"."institutions"("institutionType");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_name_department_key" ON "public"."institutions"("name", "department");

-- CreateIndex
CREATE UNIQUE INDEX "municipalities_email_key" ON "public"."municipalities"("email");

-- CreateIndex
CREATE INDEX "municipalities_department_idx" ON "public"."municipalities"("department");

-- CreateIndex
CREATE INDEX "municipalities_isActive_idx" ON "public"."municipalities"("isActive");

-- CreateIndex
CREATE INDEX "municipalities_createdBy_idx" ON "public"."municipalities"("createdBy");

-- CreateIndex
CREATE INDEX "municipalities_institutionType_idx" ON "public"."municipalities"("institutionType");

-- CreateIndex
CREATE UNIQUE INDEX "municipalities_name_department_key" ON "public"."municipalities"("name", "department");

-- CreateIndex
CREATE INDEX "course_enrollments_studentId_idx" ON "public"."course_enrollments"("studentId");

-- CreateIndex
CREATE INDEX "course_enrollments_courseId_idx" ON "public"."course_enrollments"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollments_studentId_courseId_key" ON "public"."course_enrollments"("studentId", "courseId");

-- CreateIndex
CREATE INDEX "lesson_progress_studentId_idx" ON "public"."lesson_progress"("studentId");

-- CreateIndex
CREATE INDEX "lesson_progress_lessonId_idx" ON "public"."lesson_progress"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_studentId_lessonId_key" ON "public"."lesson_progress"("studentId", "lessonId");

-- CreateIndex
CREATE INDEX "quizzes_lessonId_idx" ON "public"."quizzes"("lessonId");

-- CreateIndex
CREATE INDEX "quizzes_courseId_idx" ON "public"."quizzes"("courseId");

-- CreateIndex
CREATE INDEX "quiz_attempts_studentId_idx" ON "public"."quiz_attempts"("studentId");

-- CreateIndex
CREATE INDEX "quiz_attempts_quizId_idx" ON "public"."quiz_attempts"("quizId");

-- CreateIndex
CREATE INDEX "certificates_studentId_idx" ON "public"."certificates"("studentId");

-- CreateIndex
CREATE INDEX "certificates_courseId_idx" ON "public"."certificates"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_studentId_courseId_key" ON "public"."certificates"("studentId", "courseId");

-- CreateIndex
CREATE INDEX "module_certificates_studentId_idx" ON "public"."module_certificates"("studentId");

-- CreateIndex
CREATE INDEX "module_certificates_moduleId_idx" ON "public"."module_certificates"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "module_certificates_studentId_moduleId_key" ON "public"."module_certificates"("studentId", "moduleId");

-- CreateIndex
CREATE INDEX "lesson_resources_lessonId_idx" ON "public"."lesson_resources"("lessonId");

-- CreateIndex
CREATE INDEX "discussions_studentId_idx" ON "public"."discussions"("studentId");

-- CreateIndex
CREATE INDEX "discussions_lessonId_idx" ON "public"."discussions"("lessonId");

-- CreateIndex
CREATE INDEX "student_notes_studentId_idx" ON "public"."student_notes"("studentId");

-- CreateIndex
CREATE INDEX "student_notes_lessonId_idx" ON "public"."student_notes"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "business_plans_entrepreneurshipId_key" ON "public"."business_plans"("entrepreneurshipId");

-- CreateIndex
CREATE INDEX "job_questions_jobOfferId_idx" ON "public"."job_questions"("jobOfferId");

-- CreateIndex
CREATE INDEX "job_question_answers_applicationId_idx" ON "public"."job_question_answers"("applicationId");

-- CreateIndex
CREATE INDEX "job_question_answers_questionId_idx" ON "public"."job_question_answers"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "job_question_answers_applicationId_questionId_key" ON "public"."job_question_answers"("applicationId", "questionId");

-- CreateIndex
CREATE INDEX "job_application_messages_applicationId_idx" ON "public"."job_application_messages"("applicationId");

-- CreateIndex
CREATE INDEX "job_application_messages_senderId_idx" ON "public"."job_application_messages"("senderId");

-- CreateIndex
CREATE INDEX "youth_application_company_interests_applicationId_idx" ON "public"."youth_application_company_interests"("applicationId");

-- CreateIndex
CREATE INDEX "youth_application_company_interests_companyId_idx" ON "public"."youth_application_company_interests"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "youth_application_company_interests_applicationId_companyId_key" ON "public"."youth_application_company_interests"("applicationId", "companyId");

-- CreateIndex
CREATE INDEX "youth_application_messages_applicationId_idx" ON "public"."youth_application_messages"("applicationId");

-- CreateIndex
CREATE INDEX "youth_application_messages_senderId_idx" ON "public"."youth_application_messages"("senderId");

-- CreateIndex
CREATE INDEX "news_comments_articleId_idx" ON "public"."news_comments"("articleId");

-- CreateIndex
CREATE INDEX "news_comments_authorId_idx" ON "public"."news_comments"("authorId");

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "public"."municipalities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "public"."profiles"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_modules" ADD CONSTRAINT "course_modules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lessons" ADD CONSTRAINT "lessons_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_offers" ADD CONSTRAINT "job_offers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_applications" ADD CONSTRAINT "job_applications_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_applications" ADD CONSTRAINT "job_applications_jobOfferId_fkey" FOREIGN KEY ("jobOfferId") REFERENCES "public"."job_offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."youth_applications" ADD CONSTRAINT "youth_applications_youthProfileId_fkey" FOREIGN KEY ("youthProfileId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entrepreneurships" ADD CONSTRAINT "entrepreneurships_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."news_articles" ADD CONSTRAINT "news_articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resources" ADD CONSTRAINT "resources_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."companies" ADD CONSTRAINT "companies_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."companies" ADD CONSTRAINT "companies_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "public"."municipalities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."institutions" ADD CONSTRAINT "institutions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."municipalities" ADD CONSTRAINT "municipalities_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_enrollments" ADD CONSTRAINT "course_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_enrollments" ADD CONSTRAINT "course_enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lesson_progress" ADD CONSTRAINT "lesson_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lesson_progress" ADD CONSTRAINT "lesson_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quizzes" ADD CONSTRAINT "quizzes_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quizzes" ADD CONSTRAINT "quizzes_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."quizzes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certificates" ADD CONSTRAINT "certificates_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certificates" ADD CONSTRAINT "certificates_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."module_certificates" ADD CONSTRAINT "module_certificates_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."module_certificates" ADD CONSTRAINT "module_certificates_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."course_modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lesson_resources" ADD CONSTRAINT "lesson_resources_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."discussions" ADD CONSTRAINT "discussions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."discussions" ADD CONSTRAINT "discussions_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_notes" ADD CONSTRAINT "student_notes_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_notes" ADD CONSTRAINT "student_notes_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."business_plans" ADD CONSTRAINT "business_plans_entrepreneurshipId_fkey" FOREIGN KEY ("entrepreneurshipId") REFERENCES "public"."entrepreneurships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_questions" ADD CONSTRAINT "job_questions_jobOfferId_fkey" FOREIGN KEY ("jobOfferId") REFERENCES "public"."job_offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_question_answers" ADD CONSTRAINT "job_question_answers_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."job_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_question_answers" ADD CONSTRAINT "job_question_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."job_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_application_messages" ADD CONSTRAINT "job_application_messages_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."job_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."youth_application_company_interests" ADD CONSTRAINT "youth_application_company_interests_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."youth_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."youth_application_company_interests" ADD CONSTRAINT "youth_application_company_interests_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."youth_application_messages" ADD CONSTRAINT "youth_application_messages_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."youth_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."news_comments" ADD CONSTRAINT "news_comments_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."news_articles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."news_comments" ADD CONSTRAINT "news_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
