-- CreateTable
CREATE TABLE "model_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "model_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parentId" TEXT,
    "packageId" TEXT NOT NULL,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archi_elements" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "properties" JSONB,
    "packageId" TEXT NOT NULL,

    CONSTRAINT "archi_elements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archi_relations" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "properties" JSONB,

    CONSTRAINT "archi_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archi_views" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "layout" JSONB NOT NULL,
    "packageId" TEXT NOT NULL,
    "folderId" TEXT,

    CONSTRAINT "archi_views_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "model_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archi_elements" ADD CONSTRAINT "archi_elements_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "model_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archi_relations" ADD CONSTRAINT "archi_relations_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "archi_elements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archi_relations" ADD CONSTRAINT "archi_relations_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "archi_elements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archi_views" ADD CONSTRAINT "archi_views_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "model_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archi_views" ADD CONSTRAINT "archi_views_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
