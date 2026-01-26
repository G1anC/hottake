/*
  Warnings:

  - You are about to drop the column `profilePicture` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_FavoriteReviews` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_FavoriteReviews" DROP CONSTRAINT "_FavoriteReviews_A_fkey";

-- DropForeignKey
ALTER TABLE "_FavoriteReviews" DROP CONSTRAINT "_FavoriteReviews_B_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "profilePicture",
ADD COLUMN     "bigFive" TEXT[],
ADD COLUMN     "hotTakes" TEXT[];

-- DropTable
DROP TABLE "_FavoriteReviews";
