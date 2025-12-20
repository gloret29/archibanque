'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

export async function createModelPackage(name: string, description?: string) {
    const pkg = await prisma.modelPackage.create({
        data: { name, description }
    });
    revalidatePath('/modeler');
    return pkg;
}

export async function getModelPackages() {
    return await prisma.modelPackage.findMany({
        include: {
            folders: true,
            views: true,
            elements: true
        },
        orderBy: { updatedAt: 'desc' }
    });
}

export async function getPackageById(packageId: string) {
    return await prisma.modelPackage.findUnique({
        where: { id: packageId },
        include: {
            folders: true,
            views: true,
            elements: true
        }
    });
}

export async function updateModelPackage(packageId: string, name: string, description?: string) {
    const pkg = await prisma.modelPackage.update({
        where: { id: packageId },
        data: { name, description, updatedAt: new Date() }
    });
    revalidatePath('/modeler');
    return pkg;
}

export async function deleteModelPackage(packageId: string) {
    // Delete all related data first
    await prisma.archiView.deleteMany({ where: { packageId } });
    await prisma.folder.deleteMany({ where: { packageId } });
    await prisma.archiRelation.deleteMany({
        where: {
            source: { packageId }
        }
    });
    await prisma.archiElement.deleteMany({ where: { packageId } });

    await prisma.modelPackage.delete({ where: { id: packageId } });
    revalidatePath('/modeler');
}

export async function loadPackageData(packageId: string) {
    const pkg = await prisma.modelPackage.findUnique({
        where: { id: packageId },
        include: {
            folders: {
                orderBy: { name: 'asc' }
            },
            views: {
                orderBy: { name: 'asc' }
            }
        }
    });

    if (!pkg) return null;

    // Transform folders to match store format
    const folders = pkg.folders.map(f => ({
        id: f.id,
        name: f.name,
        parentId: f.parentId,
        type: f.type as 'folder' | 'view-folder' | 'element-folder'
    }));

    // Transform views to match store format
    const views = pkg.views.map(v => {
        const layout = v.layout as { nodes?: unknown[], edges?: unknown[] } | null;
        return {
            id: v.id,
            name: v.name,
            nodes: (layout?.nodes || []) as unknown[],
            edges: (layout?.edges || []) as unknown[],
            folderId: v.folderId || undefined
        };
    });

    return { package: pkg, folders, views };
}

export async function saveArchiView(viewId: string, name: string, packageId: string, layout: Prisma.InputJsonValue, folderId?: string) {
    return await prisma.archiView.upsert({
        where: { id: viewId },
        update: { name, layout, folderId },
        create: { id: viewId, name, packageId, layout, folderId }
    });
}

export async function saveRepositoryState(
    packageId: string,
    folders: { id: string, name: string, type: string, parentId: string | null }[],
    views: { id: string, name: string, nodes: unknown[], edges: unknown[], folderId?: string }[]
) {
    // 0. Ensure Package Exists
    await prisma.modelPackage.upsert({
        where: { id: packageId },
        update: { updatedAt: new Date() },
        create: { id: packageId, name: 'Default Project' }
    });

    // 1. Sync Folders
    for (const f of folders) {
        await prisma.folder.upsert({
            where: { id: f.id },
            update: { name: f.name, type: f.type, parentId: f.parentId },
            create: { id: f.id, name: f.name, type: f.type, parentId: f.parentId, packageId }
        });
    }

    // 2. Sync Views
    for (const v of views) {
        await prisma.archiView.upsert({
            where: { id: v.id },
            update: { name: v.name, layout: { nodes: v.nodes, edges: v.edges } as Prisma.InputJsonValue, folderId: v.folderId },
            create: { id: v.id, name: v.name, packageId, layout: { nodes: v.nodes, edges: v.edges } as Prisma.InputJsonValue, folderId: v.folderId }
        });
    }

    revalidatePath('/modeler');
}
