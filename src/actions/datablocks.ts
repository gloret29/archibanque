'use server';

import { prisma } from '@/lib/prisma';

export async function loadDataBlocks() {
    try {
        const blocks = await prisma.dataBlock.findMany({
            include: {
                attributes: {
                    orderBy: { sortOrder: 'asc' }
                }
            }
        });
        return { success: true, data: blocks };
    } catch (error) {
        console.error('Failed to load data blocks:', error);
        return { success: false, error: String(error) };
    }
}

export async function syncDataBlocks(blocks: Array<{
    id: string;
    name: string;
    targetTypes?: string[];
    attributes?: Array<{
        id: string;
        name: string;
        key: string;
        type: string;
        enumValues?: string[];
    }>;
}>) {
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Get all existing IDs to handle deletions (Global Sync)
            // Note: In a real multi-user app, this might be too aggressive if we don't have optimistic locking.
            // But for now, we assume the client sends the full authoritative list.
            const existingBlocks = await tx.dataBlock.findMany({ select: { id: true } });
            const existingIds = existingBlocks.map(b => b.id);
            const incomingIds = blocks.map(b => b.id);

            const toDelete = existingIds.filter(id => !incomingIds.includes(id));

            // 2. Delete removed blocks
            if (toDelete.length > 0) {
                await tx.dataBlock.deleteMany({ where: { id: { in: toDelete } } });
            }

            // 3. Upsert blocks and attributes
            for (const block of blocks) {
                // Upsert Block
                await tx.dataBlock.upsert({
                    where: { id: block.id },
                    update: {
                        name: block.name,
                        targetTypes: block.targetTypes || []
                    },
                    create: {
                        id: block.id,
                        name: block.name,
                        targetTypes: block.targetTypes || []
                    }
                });

                // Handle Attributes
                const existingAttrs = await tx.dataBlockAttribute.findMany({
                    where: { blockId: block.id },
                    select: { id: true }
                });
                const existingAttrIds = existingAttrs.map(a => a.id);
                const attributes = block.attributes || [];
                const incomingAttrIds = attributes.map((a) => a.id);

                const attrsToDelete = existingAttrIds.filter(id => !incomingAttrIds.includes(id));

                if (attrsToDelete.length > 0) {
                    await tx.dataBlockAttribute.deleteMany({ where: { id: { in: attrsToDelete } } });
                }

                for (let i = 0; i < attributes.length; i++) {
                    const attr = attributes[i];
                    await tx.dataBlockAttribute.upsert({
                        where: { id: attr.id },
                        update: {
                            name: attr.name,
                            key: attr.key,
                            type: attr.type,
                            enumValues: attr.enumValues || [],
                            sortOrder: i
                        },
                        create: {
                            id: attr.id,
                            blockId: block.id,
                            name: attr.name,
                            key: attr.key,
                            type: attr.type,
                            enumValues: attr.enumValues || [],
                            sortOrder: i
                        }
                    });
                }
            }
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to sync data blocks:', error);
        return { success: false, error: String(error) };
    }
}
