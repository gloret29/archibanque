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
            elements: true,
            relations: true
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
            elements: true,
            relations: true
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

export async function deleteViewFromDB(viewId: string) {
    try {
        await prisma.archiView.delete({ where: { id: viewId } });
        revalidatePath('/modeler');
    } catch (error) {
        console.error(`Failed to delete view ${viewId}:`, error);
        throw error;
    }
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
            },
            elements: {
                orderBy: { name: 'asc' }
            },
            relations: true
        }
    });

    if (!pkg) return null;

    // Transform folders
    const folders = pkg.folders.map(f => ({
        id: f.id,
        name: f.name,
        parentId: f.parentId,
        type: f.type as 'folder' | 'view-folder' | 'element-folder'
    }));

    // Transform views
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

    // Transform elements with all properties
    const elements = pkg.elements.map(e => ({
        id: e.id,
        name: e.name,
        type: e.type,
        folderId: e.folderId,
        description: e.description || '',
        documentation: e.documentation || '',
        properties: (e.properties as Record<string, string>) || {},
        createdAt: e.createdAt,
        modifiedAt: e.modifiedAt,
        author: e.author || undefined
    }));

    // Transform relations (now with folderId and packageId)
    const relations = pkg.relations.map(r => ({
        id: r.id,
        type: r.type,
        name: r.name || '',
        sourceId: r.sourceId,
        targetId: r.targetId,
        folderId: r.folderId
    }));

    return { package: pkg, folders, views, elements, relations };
}

export async function saveRepositoryState(
    packageId: string,
    folders: { id: string, name: string, type: string, parentId: string | null }[],
    views: {
        id: string;
        name: string;
        nodes: unknown[];
        edges: unknown[];
        folderId?: string;
        description?: string;
        documentation?: string;
        createdAt?: Date;
        modifiedAt?: Date;
        author?: string;
    }[],
    elements: {
        id: string;
        name: string;
        type: string;
        folderId: string | null;
        description?: string;
        documentation?: string;
        properties?: Record<string, unknown>;
        createdAt?: Date;
        modifiedAt?: Date;
        author?: string;
    }[] = [],
    relations: {
        id: string;
        type: string;
        sourceId: string;
        targetId: string;
        folderId: string | null;
        name?: string;
        description?: string;
        documentation?: string;
        properties?: Record<string, unknown>;
        createdAt?: Date;
        modifiedAt?: Date;
        author?: string;
    }[] = []
) {
    console.log(`💾 Starting transactional save for package ${packageId}...`);

    await prisma.$transaction(async (tx) => {
        // 1. Ensure Package Exists
        await tx.modelPackage.upsert({
            where: { id: packageId },
            update: { updatedAt: new Date() },
            create: { id: packageId, name: 'Default Project' }
        });

        // 2. Sync Folders
        for (const f of folders) {
            await tx.folder.upsert({
                where: { id: f.id },
                update: { name: f.name, type: f.type, parentId: f.parentId },
                create: { id: f.id, name: f.name, type: f.type, parentId: f.parentId, packageId }
            });
        }

        // 3. Sync Elements
        for (const e of elements) {
            await tx.archiElement.upsert({
                where: { id: e.id },
                update: {
                    name: e.name,
                    type: e.type,
                    folderId: e.folderId,
                    description: e.description,
                    documentation: e.documentation,
                    modifiedAt: e.modifiedAt || new Date(),
                    properties: (e.properties || {}) as Prisma.InputJsonValue
                },
                create: {
                    id: e.id,
                    name: e.name,
                    type: e.type,
                    packageId,
                    folderId: e.folderId,
                    description: e.description,
                    documentation: e.documentation,
                    createdAt: e.createdAt || new Date(),
                    modifiedAt: e.modifiedAt || new Date(),
                    author: e.author,
                    properties: (e.properties || {}) as Prisma.InputJsonValue
                }
            });
        }

        // 4. Sync Relations
        for (const r of relations) {
            await tx.archiRelation.upsert({
                where: { id: r.id },
                update: {
                    type: r.type,
                    name: r.name,
                    folderId: r.folderId,
                    description: r.description,
                    documentation: r.documentation,
                    modifiedAt: r.modifiedAt || new Date()
                },
                create: {
                    id: r.id,
                    type: r.type,
                    name: r.name,
                    sourceId: r.sourceId,
                    targetId: r.targetId,
                    packageId,
                    folderId: r.folderId,
                    description: r.description,
                    documentation: r.documentation,
                    createdAt: r.createdAt || new Date(),
                    modifiedAt: r.modifiedAt || new Date(),
                    author: r.author
                }
            });
        }

        // 5. Sync Views
        for (const v of views) {
            await tx.archiView.upsert({
                where: { id: v.id },
                update: {
                    name: v.name,
                    layout: { nodes: v.nodes, edges: v.edges } as Prisma.InputJsonValue,
                    folderId: v.folderId,
                    description: v.description,
                    documentation: v.documentation,
                    modifiedAt: v.modifiedAt || new Date()
                },
                create: {
                    id: v.id,
                    name: v.name,
                    packageId,
                    layout: { nodes: v.nodes, edges: v.edges } as Prisma.InputJsonValue,
                    folderId: v.folderId,
                    description: v.description,
                    documentation: v.documentation,
                    createdAt: v.createdAt || new Date(),
                    modifiedAt: v.modifiedAt || new Date(),
                    author: v.author
                }
            });
        }
    });

    revalidatePath('/modeler');
    console.log(`✅ Transactional save complete for ${packageId}`);
}

