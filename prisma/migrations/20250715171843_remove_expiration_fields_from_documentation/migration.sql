/*
  Warnings:

  - You are about to drop the column `expirationDate` on the `Documentation` table. All the data in the column will be lost.
  - You are about to drop the column `expires` on the `Documentation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Documentation" DROP COLUMN "expirationDate",
DROP COLUMN "expires";
