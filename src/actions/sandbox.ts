'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Create a sandbox (copy) of a package for "To-Be" or "What-if" scenarios
 */
export async function createSandbox(
    sourcePackageId: string,
    sandboxName: string,
    description?: string
): Promise<{ success: boolean; packageId?: string; error?: string }> {
    try {
        // Get source package with all related data
        const source = await prisma.modelPackage.findUnique({
            where: { id: sourcePackageId },
            include: {
                folders: true,
                views: true,
                elements: {
                    include: {
                        outRels: true
                    }
                }
            }
        });

        if (!source) {
            return { success: false, error: 'Source package not found' };
        }

        const sandboxId = `sandbox_${Date.now()}`;

        // Create sandbox package
        const sandbox = await prisma.modelPackage.create({
            data: {
                id: sandboxId,
                name: sandboxName,
                description: description || `Sandbox of "${source.name}" created on ${new Date().toLocaleDateString()}`
            }
        });

        // Map old IDs to new IDs
        const folderIdMap = new Map<string, string>();
        const elementIdMap = new Map<string, string>();
        const viewIdMap = new Map<string, string>();

        // Copy folders (maintaining hierarchy)
        // First pass: create folders without parent references
        for (const folder of source.folders) {
            const newId = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            folderIdMap.set(folder.id, newId);

            await prisma.folder.create({
                data: {
                    id: newId,
                    name: folder.name,
                    type: folder.type,
                    packageId: sandbox.id
                }
            });
        }

        // Second pass: update parent references
        for (const folder of source.folders) {
            if (folder.parentId) {
                const newId = folderIdMap.get(folder.id);
                const newParentId = folderIdMap.get(folder.parentId);
                if (newId && newParentId) {
                    await prisma.folder.update({
                        where: { id: newId },
                        data: { parentId: newParentId }
                    });
                }
            }
        }

        // Copy elements
        for (const element of source.elements) {
            const newId = `elem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            elementIdMap.set(element.id, newId);

            await prisma.archiElement.create({
                data: {
                    id: newId,
                    name: element.name,
                    type: element.type,
                    externalId: element.externalId,
                    properties: element.properties as object || undefined,
                    packageId: sandbox.id
                }
            });
        }

        // Copy relations
        for (const element of source.elements) {
            for (const rel of element.outRels) {
                const newSourceId = elementIdMap.get(rel.sourceId);
                const newTargetId = elementIdMap.get(rel.targetId);

                if (newSourceId && newTargetId) {
                    await prisma.archiRelation.create({
                        data: {
                            id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            type: rel.type,
                            sourceId: newSourceId,
                            targetId: newTargetId,
                            packageId: sandbox.id
                        }
                    });
                }
            }
        }

        // Copy views (with updated node/edge IDs if needed)
        for (const view of source.views) {
            const newId = `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            viewIdMap.set(view.id, newId);
            const newFolderId = view.folderId ? folderIdMap.get(view.folderId) : null;

            await prisma.archiView.create({
                data: {
                    id: newId,
                    name: view.name,
                    layout: view.layout as object,
                    packageId: sandbox.id,
                    folderId: newFolderId
                }
            });
        }

        revalidatePath('/modeler');
        return { success: true, packageId: sandbox.id };
    } catch (error) {
        console.error('Sandbox creation error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Compare two packages and return differences
 */
export async function comparePackages(
    packageId1: string,
    packageId2: string
): Promise<{
    success: boolean;
    differences?: {
        elements: { added: string[]; removed: string[]; modified: string[] };
        relations: { added: string[]; removed: string[]; modified: string[] };
        views: { added: string[]; removed: string[]; modified: string[] };
    };
    error?: string;
}> {
    try {
        const [pkg1, pkg2] = await Promise.all([
            prisma.modelPackage.findUnique({
                where: { id: packageId1 },
                include: { elements: true, views: true }
            }),
            prisma.modelPackage.findUnique({
                where: { id: packageId2 },
                include: { elements: true, views: true }
            })
        ]);

        if (!pkg1 || !pkg2) {
            return { success: false, error: 'One or both packages not found' };
        }

        // Compare elements by externalId or name+type combination
        const pkg1Elements = new Map(pkg1.elements.map(e => [e.externalId || `${e.type}:${e.name}`, e]));
        const pkg2Elements = new Map(pkg2.elements.map(e => [e.externalId || `${e.type}:${e.name}`, e]));

        const elementsAdded: string[] = [];
        const elementsRemoved: string[] = [];
        const elementsModified: string[] = [];

        // Find added and modified elements
        for (const [key, elem] of pkg2Elements) {
            const original = pkg1Elements.get(key);
            if (!original) {
                elementsAdded.push(elem.name);
            } else if (JSON.stringify(original.properties) !== JSON.stringify(elem.properties)) {
                elementsModified.push(elem.name);
            }
        }

        // Find removed elements
        for (const [key, elem] of pkg1Elements) {
            if (!pkg2Elements.has(key)) {
                elementsRemoved.push(elem.name);
            }
        }

        // Compare views by name
        const pkg1Views = new Map(pkg1.views.map(v => [v.name, v]));
        const pkg2Views = new Map(pkg2.views.map(v => [v.name, v]));

        const viewsAdded: string[] = [];
        const viewsRemoved: string[] = [];
        const viewsModified: string[] = [];

        for (const [name, view] of pkg2Views) {
            const original = pkg1Views.get(name);
            if (!original) {
                viewsAdded.push(name);
            } else if (JSON.stringify(original.layout) !== JSON.stringify(view.layout)) {
                viewsModified.push(name);
            }
        }

        for (const [name] of pkg1Views) {
            if (!pkg2Views.has(name)) {
                viewsRemoved.push(name);
            }
        }

        return {
            success: true,
            differences: {
                elements: { added: elementsAdded, removed: elementsRemoved, modified: elementsModified },
                relations: { added: [], removed: [], modified: [] }, // TODO: implement relation comparison
                views: { added: viewsAdded, removed: viewsRemoved, modified: viewsModified }
            }
        };
    } catch (error) {
        console.error('Compare packages error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Merge changes from a sandbox back to the original package
 */
export async function mergeSandbox(
    sandboxId: string,
    targetPackageId: string,
    strategy: 'overwrite' | 'merge' = 'merge'
): Promise<{ success: boolean; conflicts?: string[]; error?: string }> {
    try {
        const [sandbox, target] = await Promise.all([
            prisma.modelPackage.findUnique({
                where: { id: sandboxId },
                include: { elements: true, views: true, folders: true }
            }),
            prisma.modelPackage.findUnique({
                where: { id: targetPackageId },
                include: { elements: true, views: true, folders: true }
            })
        ]);

        if (!sandbox || !target) {
            return { success: false, error: 'Package not found' };
        }

        const conflicts: string[] = [];

        if (strategy === 'overwrite') {
            // Simple overwrite: delete target content and copy from sandbox
            await prisma.archiView.deleteMany({ where: { packageId: targetPackageId } });
            await prisma.folder.deleteMany({ where: { packageId: targetPackageId } });
            await prisma.archiRelation.deleteMany({ where: { source: { packageId: targetPackageId } } });
            await prisma.archiElement.deleteMany({ where: { packageId: targetPackageId } });

            // Re-create from sandbox (simplified - in production would need proper ID remapping)
            for (const elem of sandbox.elements) {
                await prisma.archiElement.create({
                    data: {
                        name: elem.name,
                        type: elem.type,
                        externalId: elem.externalId,
                        properties: elem.properties as object || undefined,
                        packageId: targetPackageId
                    }
                });
            }

            for (const view of sandbox.views) {
                await prisma.archiView.create({
                    data: {
                        name: view.name,
                        layout: view.layout as object,
                        packageId: targetPackageId
                    }
                });
            }
        } else {
            // Merge strategy: detect conflicts
            const targetElements = new Map(target.elements.map(e => [e.externalId || `${e.type}:${e.name}`, e]));

            for (const elem of sandbox.elements) {
                const key = elem.externalId || `${elem.type}:${elem.name}`;
                const existing = targetElements.get(key);

                if (existing && JSON.stringify(existing.properties) !== JSON.stringify(elem.properties)) {
                    conflicts.push(`Element "${elem.name}" has different properties`);
                }
            }

            if (conflicts.length > 0) {
                return { success: false, conflicts };
            }

            // No conflicts - proceed with merge
            for (const elem of sandbox.elements) {
                const key = elem.externalId || `${elem.type}:${elem.name}`;
                if (!targetElements.has(key)) {
                    await prisma.archiElement.create({
                        data: {
                            name: elem.name,
                            type: elem.type,
                            externalId: elem.externalId,
                            properties: elem.properties as object || undefined,
                            packageId: targetPackageId
                        }
                    });
                }
            }
        }

        await prisma.modelPackage.update({
            where: { id: targetPackageId },
            data: { updatedAt: new Date() }
        });

        revalidatePath('/modeler');
        return { success: true };
    } catch (error) {
        console.error('Merge sandbox error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Delete a sandbox package
 */
export async function deleteSandbox(sandboxId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.archiView.deleteMany({ where: { packageId: sandboxId } });
        await prisma.folder.deleteMany({ where: { packageId: sandboxId } });
        await prisma.archiRelation.deleteMany({ where: { source: { packageId: sandboxId } } });
        await prisma.archiElement.deleteMany({ where: { packageId: sandboxId } });
        await prisma.modelPackage.delete({ where: { id: sandboxId } });

        revalidatePath('/modeler');
        return { success: true };
    } catch (error) {
        console.error('Delete sandbox error:', error);
        return { success: false, error: String(error) };
    }
}
