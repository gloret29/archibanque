import styles from './modeler.module.css';
import EditorCanvas from '@/components/Modeling/EditorCanvas';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function ModelerPage() {
    const user = await getCurrentUser();

    if (!user) {
        // In production, Authelia handles this, but for extra safety:
        // redirect('/');
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logo}>ArchiModeler | Editor</div>
                <div className={styles.toolbar}>
                    {/* Toolbar items will go here: Save, Undo, Redo, etc. */}
                    <button className={styles.toolButton}>Save</button>
                </div>
                <div className={styles.userInfo}>
                    {user?.name}
                </div>
            </header>
            <div className={styles.content}>
                <aside className={styles.sidebar}>
                    <h3>Repository</h3>
                    <div className={styles.treePlaceholder}>
                        {/* Folder tree exploration */}
                        <p>Main Model</p>
                        <ul>
                            <li>Strategy</li>
                            <li>Business</li>
                            <li>Application</li>
                            <li>Technology</li>
                        </ul>
                    </div>
                </aside>
                <main className={styles.canvasArea}>
                    <EditorCanvas />
                </main>
                <aside className={styles.properties}>
                    <h3>Properties</h3>
                    <div className={styles.propsPlaceholder}>
                        <p>Select an element to view properties</p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
