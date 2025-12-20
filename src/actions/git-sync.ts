'use server';

import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

const GIT_EXPORT_DIR = process.env.GIT_EXPORT_DIR || './git-export';

interface ExportedElement {
    id: string;
    externalId?: string;
    name: string;
    type: string;
    properties?: Record<string, unknown>;
}

interface ExportedRelation {
    id: string;
    type: string;
    sourceId: string;
    targetId: string;
    properties?: Record<string, unknown>;
}

interface ExportedView {
    id: string;
    name: string;
    nodes: unknown[];
    edges: unknown[];
    folderId?: string;
}

interface ExportedFolder {
    id: string;
    name: string;
    type: string;
    parentId?: string;
}

interface ExportedPackage {
    id: string;
    name: string;
    description?: string;
    exportedAt: string;
    version: string;
    elements: ExportedElement[];
    relations: ExportedRelation[];
    views: ExportedView[];
    folders: ExportedFolder[];
}

/**
 * Export a package to Git-friendly JSON files
 */
export async function exportPackageToGit(packageId: string): Promise<{ success: boolean; path?: string; error?: string }> {
    try {
        const pkg = await prisma.modelPackage.findUnique({
            where: { id: packageId },
            include: {
                elements: {
                    include: {
                        outRels: true
                    }
                },
                views: true,
                folders: true
            }
        });

        if (!pkg) {
            return { success: false, error: 'Package not found' };
        }

        // Create export directory
        const packageDir = path.join(GIT_EXPORT_DIR, pkg.id);
        await fs.mkdir(packageDir, { recursive: true });

        // Prepare export data
        const exportData: ExportedPackage = {
            id: pkg.id,
            name: pkg.name,
            description: pkg.description || undefined,
            exportedAt: new Date().toISOString(),
            version: '1.0.0',
            elements: pkg.elements.map(e => ({
                id: e.id,
                externalId: e.externalId || undefined,
                name: e.name,
                type: e.type,
                properties: e.properties as Record<string, unknown> | undefined
            })),
            relations: pkg.elements.flatMap(e =>
                e.outRels.map(r => ({
                    id: r.id,
                    type: r.type,
                    sourceId: r.sourceId,
                    targetId: r.targetId,
                    properties: r.properties as Record<string, unknown> | undefined
                }))
            ),
            views: pkg.views.map(v => {
                const layout = v.layout as { nodes?: unknown[], edges?: unknown[] } | null;
                return {
                    id: v.id,
                    name: v.name,
                    nodes: layout?.nodes || [],
                    edges: layout?.edges || [],
                    folderId: v.folderId || undefined
                };
            }),
            folders: pkg.folders.map(f => ({
                id: f.id,
                name: f.name,
                type: f.type,
                parentId: f.parentId || undefined
            }))
        };

        // Write main package file
        const packageFilePath = path.join(packageDir, 'package.json');
        await fs.writeFile(packageFilePath, JSON.stringify(exportData, null, 2), 'utf-8');

        // Write individual element files for better diff
        const elementsDir = path.join(packageDir, 'elements');
        await fs.mkdir(elementsDir, { recursive: true });
        for (const element of exportData.elements) {
            const elementPath = path.join(elementsDir, `${element.id}.json`);
            await fs.writeFile(elementPath, JSON.stringify(element, null, 2), 'utf-8');
        }

        // Write individual view files
        const viewsDir = path.join(packageDir, 'views');
        await fs.mkdir(viewsDir, { recursive: true });
        for (const view of exportData.views) {
            const viewPath = path.join(viewsDir, `${view.id}.json`);
            await fs.writeFile(viewPath, JSON.stringify(view, null, 2), 'utf-8');
        }

        // Write relations file
        if (exportData.relations.length > 0) {
            const relationsPath = path.join(packageDir, 'relations.json');
            await fs.writeFile(relationsPath, JSON.stringify(exportData.relations, null, 2), 'utf-8');
        }

        // Write folders file
        if (exportData.folders.length > 0) {
            const foldersPath = path.join(packageDir, 'folders.json');
            await fs.writeFile(foldersPath, JSON.stringify(exportData.folders, null, 2), 'utf-8');
        }

        return { success: true, path: packageDir };
    } catch (error) {
        console.error('Export error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Import a package from Git-friendly JSON files
 */
export async function importPackageFromGit(packageDir: string): Promise<{ success: boolean; packageId?: string; error?: string }> {
    try {
        // Read main package file
        const packageFilePath = path.join(packageDir, 'package.json');
        const packageData = JSON.parse(await fs.readFile(packageFilePath, 'utf-8')) as ExportedPackage;

        // Create or update package
        const pkg = await prisma.modelPackage.upsert({
            where: { id: packageData.id },
            update: {
                name: packageData.name,
                description: packageData.description,
                updatedAt: new Date()
            },
            create: {
                id: packageData.id,
                name: packageData.name,
                description: packageData.description
            }
        });

        // Import folders
        for (const folder of packageData.folders) {
            await prisma.folder.upsert({
                where: { id: folder.id },
                update: {
                    name: folder.name,
                    type: folder.type,
                    parentId: folder.parentId
                },
                create: {
                    id: folder.id,
                    name: folder.name,
                    type: folder.type,
                    parentId: folder.parentId,
                    packageId: pkg.id
                }
            });
        }

        // Import elements
        for (const element of packageData.elements) {
            await prisma.archiElement.upsert({
                where: { id: element.id },
                update: {
                    name: element.name,
                    type: element.type,
                    externalId: element.externalId,
                    properties: element.properties as object
                },
                create: {
                    id: element.id,
                    name: element.name,
                    type: element.type,
                    externalId: element.externalId,
                    properties: element.properties as object,
                    packageId: pkg.id
                }
            });
        }

        // Import relations
        for (const relation of packageData.relations) {
            await prisma.archiRelation.upsert({
                where: { id: relation.id },
                update: {
                    type: relation.type,
                    sourceId: relation.sourceId,
                    targetId: relation.targetId,
                    properties: relation.properties as object
                },
                create: {
                    id: relation.id,
                    type: relation.type,
                    sourceId: relation.sourceId,
                    targetId: relation.targetId,
                    properties: relation.properties as object
                }
            });
        }

        // Import views
        for (const view of packageData.views) {
            const layout = { nodes: view.nodes, edges: view.edges } as object;
            await prisma.archiView.upsert({
                where: { id: view.id },
                update: {
                    name: view.name,
                    layout,
                    folderId: view.folderId
                },
                create: {
                    id: view.id,
                    name: view.name,
                    layout,
                    folderId: view.folderId,
                    packageId: pkg.id
                }
            });
        }

        return { success: true, packageId: pkg.id };
    } catch (error) {
        console.error('Import error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Get the sync status of a package
 */
export async function getPackageSyncStatus(packageId: string): Promise<{
    hasLocalChanges: boolean;
    lastExportedAt?: string;
    exportPath?: string;
}> {
    try {
        const packageDir = path.join(GIT_EXPORT_DIR, packageId);
        const packageFilePath = path.join(packageDir, 'package.json');

        try {
            const fileContent = await fs.readFile(packageFilePath, 'utf-8');
            const exportData = JSON.parse(fileContent) as ExportedPackage;

            // Get current package from DB
            const pkg = await prisma.modelPackage.findUnique({
                where: { id: packageId }
            });

            // Compare timestamps
            const hasLocalChanges = pkg ? pkg.updatedAt.toISOString() > exportData.exportedAt : false;

            return {
                hasLocalChanges,
                lastExportedAt: exportData.exportedAt,
                exportPath: packageDir
            };
        } catch {
            // No export file exists
            return { hasLocalChanges: true };
        }
    } catch {
        return { hasLocalChanges: true };
    }
}
