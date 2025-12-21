/*
  Warnings:

  - Added the required column `packageId` to the `archi_relations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "archi_elements" ADD COLUMN     "folderId" TEXT;

-- AlterTable
ALTER TABLE "archi_relations" ADD COLUMN     "folderId" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "packageId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "archi_elements" ADD CONSTRAINT "archi_elements_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archi_relations" ADD CONSTRAINT "archi_relations_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "model_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archi_relations" ADD CONSTRAINT "archi_relations_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
