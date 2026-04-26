ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'CLINICIAN';

ALTER TABLE "User"
  ADD COLUMN "supabaseUserId" TEXT,
  ALTER COLUMN "passwordHash" DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "User_supabaseUserId_key" ON "User"("supabaseUserId");
