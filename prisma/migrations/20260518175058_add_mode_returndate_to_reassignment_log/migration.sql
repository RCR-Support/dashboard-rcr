-- AlterTable
ALTER TABLE "ReassignmentLog" ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'temporal',
ADD COLUMN     "returnDate" TIMESTAMP(3);
