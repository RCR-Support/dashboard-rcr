-- AlterTable
ALTER TABLE "Subcontract" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "Subcontract_userId_idx" ON "Subcontract"("userId");

-- AddForeignKey
ALTER TABLE "Subcontract" ADD CONSTRAINT "Subcontract_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
