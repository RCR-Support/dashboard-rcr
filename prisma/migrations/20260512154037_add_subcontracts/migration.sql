/*
  Warnings:

  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubcontractStatus" AS ENUM ('pendiente', 'activo', 'inactivo');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'NEW_APPLICATION';
ALTER TYPE "NotificationType" ADD VALUE 'PENDING_DOCUMENTS';
ALTER TYPE "NotificationType" ADD VALUE 'CONTRACT_EXPIRING';
ALTER TYPE "NotificationType" ADD VALUE 'CREDENTIAL_READY';
ALTER TYPE "NotificationType" ADD VALUE 'NEW_USER';
ALTER TYPE "NotificationType" ADD VALUE 'SUBCONTRACT_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'SUBCONTRACT_LINKED';
ALTER TYPE "NotificationType" ADD VALUE 'SUBCONTRACT_APPLICATION';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "actionUrl" TEXT,
ADD COLUMN     "applicationId" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "application" ADD COLUMN     "subcontractId" TEXT;

-- CreateTable
CREATE TABLE "Subcontract" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "subCompanyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "SubcontractStatus" NOT NULL DEFAULT 'pendiente',

    CONSTRAINT "Subcontract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subcontract_contractId_idx" ON "Subcontract"("contractId");

-- CreateIndex
CREATE INDEX "Subcontract_subCompanyId_idx" ON "Subcontract"("subCompanyId");

-- CreateIndex
CREATE UNIQUE INDEX "Subcontract_contractId_subCompanyId_key" ON "Subcontract"("contractId", "subCompanyId");

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_subcontractId_fkey" FOREIGN KEY ("subcontractId") REFERENCES "Subcontract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subcontract" ADD CONSTRAINT "Subcontract_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subcontract" ADD CONSTRAINT "Subcontract_subCompanyId_fkey" FOREIGN KEY ("subCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
