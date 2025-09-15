-- DropForeignKey
ALTER TABLE "public"."certificates" DROP CONSTRAINT "certificates_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."certificates" DROP CONSTRAINT "certificates_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."course_enrollments" DROP CONSTRAINT "course_enrollments_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."course_enrollments" DROP CONSTRAINT "course_enrollments_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."job_applications" DROP CONSTRAINT "job_applications_applicantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."job_applications" DROP CONSTRAINT "job_applications_jobOfferId_fkey";

-- DropForeignKey
ALTER TABLE "public"."job_offers" DROP CONSTRAINT "job_offers_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."job_question_answers" DROP CONSTRAINT "job_question_answers_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."job_question_answers" DROP CONSTRAINT "job_question_answers_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."job_questions" DROP CONSTRAINT "job_questions_jobOfferId_fkey";

-- DropForeignKey
ALTER TABLE "public"."lesson_progress" DROP CONSTRAINT "lesson_progress_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."lesson_progress" DROP CONSTRAINT "lesson_progress_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."module_certificates" DROP CONSTRAINT "module_certificates_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."module_certificates" DROP CONSTRAINT "module_certificates_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."quiz_attempts" DROP CONSTRAINT "quiz_attempts_quizId_fkey";

-- DropForeignKey
ALTER TABLE "public"."quiz_attempts" DROP CONSTRAINT "quiz_attempts_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."quizzes" DROP CONSTRAINT "quizzes_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."quizzes" DROP CONSTRAINT "quizzes_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."youth_application_company_interests" DROP CONSTRAINT "youth_application_company_interests_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."youth_application_company_interests" DROP CONSTRAINT "youth_application_company_interests_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."youth_applications" DROP CONSTRAINT "youth_applications_youthProfileId_fkey";

-- AddForeignKey
ALTER TABLE "public"."job_offers" ADD CONSTRAINT "job_offers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_applications" ADD CONSTRAINT "job_applications_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "public"."profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_applications" ADD CONSTRAINT "job_applications_jobOfferId_fkey" FOREIGN KEY ("jobOfferId") REFERENCES "public"."job_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."youth_applications" ADD CONSTRAINT "youth_applications_youthProfileId_fkey" FOREIGN KEY ("youthProfileId") REFERENCES "public"."profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_enrollments" ADD CONSTRAINT "course_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_enrollments" ADD CONSTRAINT "course_enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certificates" ADD CONSTRAINT "certificates_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certificates" ADD CONSTRAINT "certificates_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."module_certificates" ADD CONSTRAINT "module_certificates_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."module_certificates" ADD CONSTRAINT "module_certificates_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lesson_progress" ADD CONSTRAINT "lesson_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lesson_progress" ADD CONSTRAINT "lesson_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quizzes" ADD CONSTRAINT "quizzes_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quizzes" ADD CONSTRAINT "quizzes_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_questions" ADD CONSTRAINT "job_questions_jobOfferId_fkey" FOREIGN KEY ("jobOfferId") REFERENCES "public"."job_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_question_answers" ADD CONSTRAINT "job_question_answers_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_question_answers" ADD CONSTRAINT "job_question_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."job_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."youth_application_company_interests" ADD CONSTRAINT "youth_application_company_interests_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."youth_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."youth_application_company_interests" ADD CONSTRAINT "youth_application_company_interests_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
