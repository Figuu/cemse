-- AlterTable
ALTER TABLE "public"."profiles" ADD COLUMN     "coverLetterClosing" TEXT DEFAULT 'Atentamente,',
ADD COLUMN     "coverLetterCompanyName" TEXT,
ADD COLUMN     "coverLetterDate" TEXT,
ADD COLUMN     "coverLetterPosition" TEXT,
ADD COLUMN     "coverLetterRecipientName" TEXT,
ADD COLUMN     "coverLetterRecipientTitle" TEXT,
ADD COLUMN     "coverLetterSignature" TEXT;
