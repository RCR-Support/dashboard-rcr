ALTER TABLE "application"
ADD COLUMN "lastSubmittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "application"
SET "lastSubmittedAt" = "createdAt";

ALTER TABLE "ApplicationAudit"
ADD COLUMN "assignedSheqId" TEXT;

CREATE INDEX "ApplicationAudit_assignedSheqId_idx"
ON "ApplicationAudit"("assignedSheqId");

ALTER TABLE "ApplicationAudit"
ADD CONSTRAINT "ApplicationAudit_assignedSheqId_fkey"
FOREIGN KEY ("assignedSheqId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
