import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT update attribute
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; attrId: string }> }
) {
    try {
        const { attrId } = await params;
        const body = await request.json();
        const { name, key, type, enumValues } = body;

        const attribute = await prisma.dataBlockAttribute.update({
            where: { id: attrId },
            data: {
                ...(name !== undefined && { name }),
                ...(key !== undefined && { key }),
                ...(type !== undefined && { type }),
                ...(enumValues !== undefined && { enumValues })
            }
        });

        return NextResponse.json(attribute);
    } catch (error) {
        console.error('Error updating attribute:', error);
        return NextResponse.json({ error: 'Failed to update attribute' }, { status: 500 });
    }
}

// DELETE attribute
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; attrId: string }> }
) {
    try {
        const { attrId } = await params;
        await prisma.dataBlockAttribute.delete({ where: { id: attrId } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting attribute:', error);
        return NextResponse.json({ error: 'Failed to delete attribute' }, { status: 500 });
    }
}
