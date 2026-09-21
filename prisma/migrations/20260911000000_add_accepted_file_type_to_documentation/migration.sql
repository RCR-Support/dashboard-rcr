DO $$ BEGIN
  CREATE TYPE "AcceptedFileType" AS ENUM ('PDF', 'IMAGE', 'DOCUMENT', 'ANY');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Documentation"
ADD COLUMN IF NOT EXISTS "acceptedFileType" "AcceptedFileType" NOT NULL DEFAULT 'PDF';