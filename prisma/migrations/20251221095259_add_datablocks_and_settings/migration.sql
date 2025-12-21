-- AlterTable
ALTER TABLE "archi_views" ADD COLUMN     "lockMessage" TEXT,
ADD COLUMN     "lockedAt" TIMESTAMP(3),
ADD COLUMN     "lockedBy" TEXT;

-- CreateTable
CREATE TABLE "data_blocks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetTypes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_block_attributes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "enumValues" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "blockId" TEXT NOT NULL,

    CONSTRAINT "data_block_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "enabledElementTypes" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "data_block_attributes" ADD CONSTRAINT "data_block_attributes_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "data_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
