import styles from './modeler.module.css';
import EditorCanvas from '@/components/Modeling/EditorCanvas';
import Palette from '@/components/Modeling/Palette';
import { getCurrentUser } from '@/lib/session';

export default async function ModelerPage() {
    const user = await getCurrentUser();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logo}>ArchiModeler | Editor</div>
                <div className={styles.toolbar}>
                    <button className={styles.toolButton}>Save</button>
                    <button className={styles.toolButton}>Sync</button>
                </div>
                <div className={styles.userInfo}>
                    {user?.name || 'Guest'}
                </div>
            </header>
            <div className={styles.content}>
                <aside className={styles.sidebar}>
                    <Palette />
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
