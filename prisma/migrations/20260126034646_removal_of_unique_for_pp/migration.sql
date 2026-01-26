-- DropIndex
DROP INDEX "User_image_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "image" DROP NOT NULL;
