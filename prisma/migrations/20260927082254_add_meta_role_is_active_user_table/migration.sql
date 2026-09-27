/*
  Warnings:

  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserRoleEnum" AS ENUM ('user', 'admin', 'superAdmin');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "meta" JSONB,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRoleEnum" NOT NULL DEFAULT 'user';

-- CreateIndex
CREATE INDEX "users_role_is_active_idx" ON "users"("role", "is_active");
