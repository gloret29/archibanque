'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface LockInfo {
    isLocked: boolean;
    lockedBy?: string;
    lockedAt?: Date;
    lockMessage?: string;
    isOwnLock?: boolean;
}

/**
 * Check out (lock) a view for editing
 */
export async function checkOutView(
    viewId: string,
    userId: string,
    message?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const view = await prisma.archiView.findUnique({
            where: { id: viewId }
        });

        if (!view) {
            return { success: false, error: 'View not found' };
        }

        // Check if already locked by someone else
        if (view.lockedBy && view.lockedBy !== userId) {
            return {
                success: false,
                error: `View is already checked out by another user since ${view.lockedAt?.toISOString()}`
            };
        }

        // Already locked by same user
        if (view.lockedBy === userId) {
            return { success: true };
        }

        // Acquire lock
        await prisma.archiView.update({
            where: { id: viewId },
            data: {
                lockedBy: userId,
                lockedAt: new Date(),
                lockMessage: message
            }
        });

        revalidatePath('/modeler');
        return { success: true };
    } catch (error) {
        console.error('Check out error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Check in (unlock) a view after editing
 */
export async function checkInView(
    viewId: string,
    userId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const view = await prisma.archiView.findUnique({
            where: { id: viewId }
        });

        if (!view) {
            return { success: false, error: 'View not found' };
        }

        // Check if locked by someone else
        if (view.lockedBy && view.lockedBy !== userId) {
            return {
                success: false,
                error: 'Cannot check in: View is locked by another user'
            };
        }

        // Not locked
        if (!view.lockedBy) {
            return { success: true };
        }

        // Release lock
        await prisma.archiView.update({
            where: { id: viewId },
            data: {
                lockedBy: null,
                lockedAt: null,
                lockMessage: null
            }
        });

        revalidatePath('/modeler');
        return { success: true };
    } catch (error) {
        console.error('Check in error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Force unlock a view (admin action)
 */
export async function forceUnlockView(
    viewId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.archiView.update({
            where: { id: viewId },
            data: {
                lockedBy: null,
                lockedAt: null,
                lockMessage: null
            }
        });

        revalidatePath('/modeler');
        return { success: true };
    } catch (error) {
        console.error('Force unlock error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Get lock info for a view
 */
export async function getViewLockInfo(
    viewId: string,
    currentUserId?: string
): Promise<LockInfo> {
    try {
        const view = await prisma.archiView.findUnique({
            where: { id: viewId },
            select: {
                lockedBy: true,
                lockedAt: true,
                lockMessage: true
            }
        });

        if (!view || !view.lockedBy) {
            return { isLocked: false };
        }

        return {
            isLocked: true,
            lockedBy: view.lockedBy,
            lockedAt: view.lockedAt || undefined,
            lockMessage: view.lockMessage || undefined,
            isOwnLock: currentUserId === view.lockedBy
        };
    } catch (error) {
        console.error('Get lock info error:', error);
        return { isLocked: false };
    }
}

/**
 * Get all locked views in a package
 */
export async function getPackageLockedViews(
    packageId: string
): Promise<Array<{ id: string; name: string; lockedBy: string; lockedAt: Date | null; lockMessage: string | null }>> {
    try {
        const lockedViews = await prisma.archiView.findMany({
            where: {
                packageId,
                lockedBy: { not: null }
            },
            select: {
                id: true,
                name: true,
                lockedBy: true,
                lockedAt: true,
                lockMessage: true
            }
        });

        return lockedViews.map(v => ({
            id: v.id,
            name: v.name,
            lockedBy: v.lockedBy!,
            lockedAt: v.lockedAt,
            lockMessage: v.lockMessage
        }));
    } catch (error) {
        console.error('Get package locked views error:', error);
        return [];
    }
}

/**
 * Check if user can edit a view (not locked or locked by same user)
 */
export async function canEditView(
    viewId: string,
    userId: string
): Promise<boolean> {
    try {
        const view = await prisma.archiView.findUnique({
            where: { id: viewId },
            select: { lockedBy: true }
        });

        if (!view) return false;

        // Can edit if not locked or locked by same user
        return !view.lockedBy || view.lockedBy === userId;
    } catch {
        return false;
    }
}
