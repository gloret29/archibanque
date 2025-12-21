import { readFile } from 'fs/promises';
import { join } from 'path';
import { getCurrentUser } from '@/lib/session';
import { ManualContent } from '@/components/Manual/ManualContent';

export default async function ManualPage() {
    const user = await getCurrentUser();
    let markdownContent = '';
    
    try {
        const filePath = join(process.cwd(), 'MANUEL_UTILISATEUR.md');
        markdownContent = await readFile(filePath, 'utf-8');
    } catch (error) {
        markdownContent = '# Manuel Utilisateur\n\nLe fichier du manuel utilisateur est introuvable.';
    }

    return <ManualContent markdownContent={markdownContent} user={user} />;
}

