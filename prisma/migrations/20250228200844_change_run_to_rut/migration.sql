/*
  Warnings:

  - You are about to drop the column `run` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "run",
ADD COLUMN     "rut" TEXT NOT NULL DEFAULT '';
