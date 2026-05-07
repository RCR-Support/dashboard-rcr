-- AlterTable: add document approval fields to DocumentationFile
ALTER TABLE "DocumentationFile" ADD COLUMN IF NOT EXISTS "approvalStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "DocumentationFile" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
ALTER TABLE "DocumentationFile" ADD COLUMN IF NOT EXISTS "reviewedBy" TEXT;
ALTER TABLE "DocumentationFile" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
