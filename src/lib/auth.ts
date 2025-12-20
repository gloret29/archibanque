import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AutheliaUser {
    email: string;
    name?: string;
    groups: string[];
}

export async function getOrCreateUser(authData: AutheliaUser) {
    const { email, name, groups } = authData;

    // Find user with roles and groups
    let user = await prisma.user.findUnique({
        where: { email },
        include: {
            roles: true,
            groups: true,
        },
    });

    if (!user) {
        // JIT Provisioning
        console.log(`JIT Provisioning for user: ${email}`);
        user = await prisma.user.create({
            data: {
                email,
                name: name || email.split('@')[0],
                groups: {
                    connectOrCreate: groups.map((g) => ({
                        where: { name: g },
                        create: { name: g },
                    })),
                },
            },
            include: {
                roles: true,
                groups: true,
            },
        });
    } else {
        // Update groups if they changed (optional, but good for sync)
        // For now we just return the user
    }

    return user;
}
