import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ARCHIMATE_METAMODEL } from '@/lib/metamodel';

const prisma = new PrismaClient();

// GET app settings
export async function GET() {
    try {
        let settings = await prisma.appSettings.findUnique({
            where: { id: 'global' }
        });

        // If no settings exist, create default with all elements enabled
        if (!settings) {
            const allElementTypes = Object.keys(ARCHIMATE_METAMODEL);
            settings = await prisma.appSettings.create({
                data: {
                    id: 'global',
                    enabledElementTypes: allElementTypes
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// PUT update settings
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { enabledElementTypes } = body;

        const settings = await prisma.appSettings.upsert({
            where: { id: 'global' },
            update: { enabledElementTypes },
            create: {
                id: 'global',
                enabledElementTypes
            }
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
