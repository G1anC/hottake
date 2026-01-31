/*
  Warnings:

  - You are about to drop the column `listened` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "listened",
ADD COLUMN     "listened" TEXT[];
