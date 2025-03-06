/*
  Warnings:

  - Added the required column `useracId` to the `Contract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "useracId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_useracId_fkey" FOREIGN KEY ("useracId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
