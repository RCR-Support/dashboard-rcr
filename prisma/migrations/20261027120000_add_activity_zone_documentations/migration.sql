CREATE TABLE "ActivityZoneDocumentation" (
  "id" TEXT NOT NULL,
  "activityId" TEXT NOT NULL,
  "zoneId" TEXT NOT NULL,
  "documentationId" TEXT NOT NULL,
  "quantity" INTEGER,
  "notes" TEXT,
  CONSTRAINT "ActivityZoneDocumentation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ActivityZoneDocumentation_activityId_zoneId_documentationId_key"
ON "ActivityZoneDocumentation"("activityId", "zoneId", "documentationId");

CREATE INDEX "ActivityZoneDocumentation_activityId_zoneId_idx"
ON "ActivityZoneDocumentation"("activityId", "zoneId");

CREATE INDEX "ActivityZoneDocumentation_documentationId_idx"
ON "ActivityZoneDocumentation"("documentationId");

ALTER TABLE "ActivityZoneDocumentation"
ADD CONSTRAINT "ActivityZoneDocumentation_activityId_fkey"
FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ActivityZoneDocumentation"
ADD CONSTRAINT "ActivityZoneDocumentation_zoneId_fkey"
FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ActivityZoneDocumentation"
ADD CONSTRAINT "ActivityZoneDocumentation_documentationId_fkey"
FOREIGN KEY ("documentationId") REFERENCES "Documentation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
