/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Activity` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[activityId,documentationId]` on the table `ActivityDocumentation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Documentation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('PDF', 'IMG', 'DOC', 'OTHER');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREACION', 'EDICION', 'APROBACION', 'RECHAZO', 'OBSERVACION', 'ELIMINACION');

-- CreateTable
CREATE TABLE "DocumentationFile" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "activityId" TEXT,
    "documentationId" TEXT,
    "url" TEXT NOT NULL,
    "type" "FileType" NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentationFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationAudit" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "changedById" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT,

    CONSTRAINT "ApplicationAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentationFile_applicationId_activityId_documentationId_idx" ON "DocumentationFile"("applicationId", "activityId", "documentationId");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_name_key" ON "Activity"("name");

-- CreateIndex
CREATE INDEX "ActivityDocumentation_activityId_documentationId_idx" ON "ActivityDocumentation"("activityId", "documentationId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityDocumentation_activityId_documentationId_key" ON "ActivityDocumentation"("activityId", "documentationId");

-- CreateIndex
CREATE UNIQUE INDEX "Documentation_name_key" ON "Documentation"("name");

-- AddForeignKey
ALTER TABLE "DocumentationFile" ADD CONSTRAINT "DocumentationFile_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentationFile" ADD CONSTRAINT "DocumentationFile_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentationFile" ADD CONSTRAINT "DocumentationFile_documentationId_fkey" FOREIGN KEY ("documentationId") REFERENCES "Documentation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationAudit" ADD CONSTRAINT "ApplicationAudit_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationAudit" ADD CONSTRAINT "ApplicationAudit_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
