-- AlterTable
ALTER TABLE "Subcontract"
ADD COLUMN "representativeEmail" TEXT,
ADD COLUMN "inviteToken" TEXT,
ADD COLUMN "inviteExpiresAt" TIMESTAMP(3),
ADD COLUMN "inviteAcceptedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Subcontract_inviteToken_key" ON "Subcontract"("inviteToken");

-- CreateIndex
CREATE INDEX "Subcontract_representativeEmail_idx" ON "Subcontract"("representativeEmail");