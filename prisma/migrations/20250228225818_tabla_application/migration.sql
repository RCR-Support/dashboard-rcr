/*
  Warnings:

  - You are about to drop the column `IntialDate` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `cotractName` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `cotractNumber` on the `Contract` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rut]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contractNumber]` on the table `Contract` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contractName` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contractNumber` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initialDate` to the `Contract` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('primeraVez', 'renovacion');

-- CreateEnum
CREATE TYPE "License" AS ENUM ('a1', 'a2', 'a3', 'a4', 'a5', 'b', 'c', 'd');

-- CreateEnum
CREATE TYPE "StateAc" AS ENUM ('aprobado', 'pendiente', 'adjuntar');

-- CreateEnum
CREATE TYPE "StateSheq" AS ENUM ('aprobado', 'pendiente', 'rechazado');

-- DropIndex
DROP INDEX "Contract_cotractNumber_key";

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "rut" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "IntialDate",
DROP COLUMN "cotractName",
DROP COLUMN "cotractNumber",
ADD COLUMN     "contractName" TEXT NOT NULL,
ADD COLUMN     "contractNumber" TEXT NOT NULL,
ADD COLUMN     "initialDate" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "deletedAt" DROP NOT NULL;

-- CreateTable
CREATE TABLE "application" (
    "id" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'primeraVez',
    "workerName" TEXT NOT NULL,
    "workerPaternal" TEXT NOT NULL,
    "workerMaternal" TEXT NOT NULL,
    "workerRun" TEXT NOT NULL,
    "displayWorkerName" TEXT NOT NULL,
    "license" "License",
    "licenseExpiration" TIMESTAMP(3),
    "stateAc" "StateAc" NOT NULL,
    "stateSheq" "StateSheq" NOT NULL,
    "companyId" TEXT,
    "userId" TEXT,
    "contractId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_rut_key" ON "Company"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_contractNumber_key" ON "Contract"("contractNumber");

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
