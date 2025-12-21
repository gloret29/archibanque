import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST add attribute to data block
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, key, type, enumValues = [] } = body;

        // Get current max sortOrder
        const maxOrder = await prisma.dataBlockAttribute.aggregate({
            where: { blockId: id },
            _max: { sortOrder: true }
        });

        const attribute = await prisma.dataBlockAttribute.create({
            data: {
                name,
                key,
                type,
                enumValues,
                sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
                blockId: id
            }
        });

        return NextResponse.json(attribute, { status: 201 });
    } catch (error) {
        console.error('Error adding attribute:', error);
        return NextResponse.json({ error: 'Failed to add attribute' }, { status: 500 });
    }
}
