-- CreateTable
CREATE TABLE "tier_list_item" (
    "id" SERIAL NOT NULL,
    "mbid" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "tier_list_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tier_list_item_userId_tier_idx" ON "tier_list_item"("userId", "tier");

-- CreateIndex
CREATE UNIQUE INDEX "tier_list_item_userId_mbid_key" ON "tier_list_item"("userId", "mbid");

-- AddForeignKey
ALTER TABLE "tier_list_item" ADD CONSTRAINT "tier_list_item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
