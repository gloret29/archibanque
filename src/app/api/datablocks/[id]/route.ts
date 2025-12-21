import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET single data block
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const dataBlock = await prisma.dataBlock.findUnique({
            where: { id },
            include: {
                attributes: {
                    orderBy: { sortOrder: 'asc' }
                }
            }
        });

        if (!dataBlock) {
            return NextResponse.json({ error: 'Data block not found' }, { status: 404 });
        }

        return NextResponse.json(dataBlock);
    } catch (error) {
        console.error('Error fetching data block:', error);
        return NextResponse.json({ error: 'Failed to fetch data block' }, { status: 500 });
    }
}

// PUT update data block
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, targetTypes } = body;

        const dataBlock = await prisma.dataBlock.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(targetTypes !== undefined && { targetTypes })
            },
            include: {
                attributes: true
            }
        });

        return NextResponse.json(dataBlock);
    } catch (error) {
        console.error('Error updating data block:', error);
        return NextResponse.json({ error: 'Failed to update data block' }, { status: 500 });
    }
}

// DELETE data block
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.dataBlock.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting data block:', error);
        return NextResponse.json({ error: 'Failed to delete data block' }, { status: 500 });
    }
}
