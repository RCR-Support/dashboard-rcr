-- CreateEnum
CREATE TYPE "ProcessStatus" AS ENUM ('pendiente', 'enRevision', 'aprobado', 'rechazado', 'vencido');

-- AlterTable
ALTER TABLE "DocumentationFile" ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "application" ADD COLUMN     "processStatus" "ProcessStatus" NOT NULL DEFAULT 'pendiente';

-- CreateTable
CREATE TABLE "ApplicationQR" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ApplicationQR_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationQR_applicationId_key" ON "ApplicationQR"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationQR_token_key" ON "ApplicationQR"("token");

-- CreateIndex
CREATE INDEX "ApplicationQR_token_idx" ON "ApplicationQR"("token");

-- CreateIndex
CREATE INDEX "idx_ac_review" ON "application"("stateAc", "userAcId");

-- CreateIndex
CREATE INDEX "idx_sheq_review" ON "application"("stateSheq", "userSheqId");

-- CreateIndex
CREATE INDEX "idx_worker_run" ON "application"("workerRun");

-- CreateIndex
CREATE INDEX "idx_company_status" ON "application"("companyId", "status");

-- CreateIndex
CREATE INDEX "idx_contract_date" ON "application"("contractId", "createdAt");

-- AddForeignKey
ALTER TABLE "ApplicationQR" ADD CONSTRAINT "ApplicationQR_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
