import { headers } from 'next/headers';
import { getOrCreateUser } from './auth';

export async function getCurrentUser() {
    const headerList = await headers();

    const remoteUser = headerList.get('remote-user');
    const remoteEmail = headerList.get('remote-email');
    const remoteGroups = headerList.get('remote-groups') || '';
    const remoteName = headerList.get('remote-name') || '';

    // For development (mocking)
    if (process.env.NODE_ENV === 'development' && !remoteEmail) {
        return await getOrCreateUser({
            email: 'admin@local.dev',
            name: 'Admin Local',
            groups: ['admin', 'architect'],
        });
    }

    if (!remoteEmail) return null;

    return await getOrCreateUser({
        email: remoteEmail,
        name: remoteName,
        groups: remoteGroups.split(',').map(g => g.trim()).filter(Boolean),
    });
}
