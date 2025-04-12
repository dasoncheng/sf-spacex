/*
  Warnings:

  - You are about to drop the column `ExpiresAt` on the `License` table. All the data in the column will be lost.
  - You are about to drop the column `IsUsed` on the `License` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "License" DROP COLUMN "ExpiresAt",
DROP COLUMN "IsUsed",
ADD COLUMN     "Duration" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "Status" INTEGER NOT NULL DEFAULT 0;
