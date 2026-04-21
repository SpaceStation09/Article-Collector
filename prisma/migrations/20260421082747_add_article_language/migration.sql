-- CreateEnum
CREATE TYPE "public"."ArticleLanguage" AS ENUM ('ZH', 'EN');

-- AlterTable
ALTER TABLE "public"."Article" ADD COLUMN     "language" "public"."ArticleLanguage" NOT NULL DEFAULT 'ZH';
