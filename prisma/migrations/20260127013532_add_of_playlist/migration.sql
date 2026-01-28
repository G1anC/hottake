/*
  Warnings:

  - You are about to drop the column `Listened` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "Listened",
ADD COLUMN     "listened" TEXT[];
