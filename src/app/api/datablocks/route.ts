import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all data blocks
export async function GET() {
    try {
        const dataBlocks = await prisma.dataBlock.findMany({
            include: {
                attributes: {
                    orderBy: { sortOrder: 'asc' }
                }
            }
        });
        return NextResponse.json(dataBlocks);
    } catch (error) {
        console.error('Error fetching data blocks:', error);
        return NextResponse.json({ error: 'Failed to fetch data blocks' }, { status: 500 });
    }
}

// POST create new data block
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, targetTypes = [], attributes = [] } = body;

        const dataBlock = await prisma.dataBlock.create({
            data: {
                name,
                targetTypes,
                attributes: {
                    create: attributes.map((attr: { name: string; key: string; type: string; enumValues?: string[] }, index: number) => ({
                        name: attr.name,
                        key: attr.key,
                        type: attr.type,
                        enumValues: attr.enumValues || [],
                        sortOrder: index
                    }))
                }
            },
            include: {
                attributes: true
            }
        });

        return NextResponse.json(dataBlock, { status: 201 });
    } catch (error) {
        console.error('Error creating data block:', error);
        return NextResponse.json({ error: 'Failed to create data block' }, { status: 500 });
    }
}
