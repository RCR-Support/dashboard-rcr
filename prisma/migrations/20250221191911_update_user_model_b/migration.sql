/*
  Warnings:

  - You are about to drop the column `secondName` on the `User` table. All the data in the column will be lost.
  - Made the column `middleName` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "secondName",
ADD COLUMN     "secondLastName" TEXT,
ALTER COLUMN "middleName" SET NOT NULL;
