import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export default async function AdminUsersPage() {
    const currentUser = await getCurrentUser();

    // Basic authorization: check if user has 'admin' group
    if (!currentUser || !currentUser.groups.some(g => g.name === 'admin')) {
        // In a real app, we'd show an unauthorized page
        return (
            <div style={{ padding: '2rem' }}>
                <h1>Access Denied</h1>
                <p>You do not have the required permissions to access this page.</p>
            </div>
        );
    }

    const users = await prisma.user.findMany({
        include: {
            roles: true,
            groups: true,
        },
    });

    return (
        <div style={{ padding: '2rem' }}>
            <h1>User Management</h1>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #ccc' }}>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Email</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Groups</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Roles</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '0.5rem' }}>{user.name}</td>
                            <td style={{ padding: '0.5rem' }}>{user.email}</td>
                            <td style={{ padding: '0.5rem' }}>
                                {user.groups.map(g => g.name).join(', ')}
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                                {user.roles.map(r => r.name).join(', ') || 'N/A'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
