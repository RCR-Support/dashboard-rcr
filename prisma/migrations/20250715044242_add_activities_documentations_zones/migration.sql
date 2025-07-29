-- AlterTable
ALTER TABLE "User" ALTER COLUMN "deletedLogic" SET DEFAULT false;

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "requiredDriverLicense" TEXT,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documentation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "expires" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Documentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityDocumentation" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "documentationId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "isSpecific" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ActivityDocumentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ActivityApplications" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActivityApplications_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ZoneApplications" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ZoneApplications_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ActivityApplications_B_index" ON "_ActivityApplications"("B");

-- CreateIndex
CREATE INDEX "_ZoneApplications_B_index" ON "_ZoneApplications"("B");

-- CreateIndex
CREATE INDEX "Contract_companyId_idx" ON "Contract"("companyId");

-- CreateIndex
CREATE INDEX "Contract_useracId_idx" ON "Contract"("useracId");

-- AddForeignKey
ALTER TABLE "ActivityDocumentation" ADD CONSTRAINT "ActivityDocumentation_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityDocumentation" ADD CONSTRAINT "ActivityDocumentation_documentationId_fkey" FOREIGN KEY ("documentationId") REFERENCES "Documentation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityApplications" ADD CONSTRAINT "_ActivityApplications_A_fkey" FOREIGN KEY ("A") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityApplications" ADD CONSTRAINT "_ActivityApplications_B_fkey" FOREIGN KEY ("B") REFERENCES "application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ZoneApplications" ADD CONSTRAINT "_ZoneApplications_A_fkey" FOREIGN KEY ("A") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ZoneApplications" ADD CONSTRAINT "_ZoneApplications_B_fkey" FOREIGN KEY ("B") REFERENCES "application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
