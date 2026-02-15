/*
  Warnings:

  - You are about to drop the column `tier` on the `tier_list_item` table. All the data in the column will be lost.
  - Added the required column `note` to the `tier_list_item` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "tier_list_item_userId_tier_idx";

-- AlterTable
ALTER TABLE "tier_list_item" DROP COLUMN "tier",
ADD COLUMN     "note" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "tier_list_item_userId_note_idx" ON "tier_list_item"("userId", "note");
