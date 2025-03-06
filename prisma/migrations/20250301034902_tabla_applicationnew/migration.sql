-- AlterTable
ALTER TABLE "application" ADD COLUMN     "userAcId" TEXT,
ADD COLUMN     "userSheqId" TEXT;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_userAcId_fkey" FOREIGN KEY ("userAcId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_userSheqId_fkey" FOREIGN KEY ("userSheqId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
