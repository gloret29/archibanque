import styles from './modeler.module.css';
import EditorCanvas from '@/components/Modeling/EditorCanvas';
import Palette from '@/components/Modeling/Palette';
import PropertiesPanel from '@/components/Modeling/PropertiesPanel';
import ModelerToolbar from './ModelerToolbar';
import { getCurrentUser } from '@/lib/session';

export default async function ModelerPage() {
    const user = await getCurrentUser();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logo}>ArchiModeler | Editor</div>
                <ModelerToolbar />
                <div className={styles.userInfo}>
                    {user?.name || 'Guest'}
                </div>
            </header>
            <div className={styles.content}>
                <aside className={styles.sidebar}>
                    <h3>Elements</h3>
                    <Palette />
                </aside>
                <main className={styles.canvasArea}>
                    <EditorCanvas />
                </main>
                <aside className={styles.properties}>
                    <h3>Properties</h3>
                    <PropertiesPanel />
                </aside>
            </div>
        </div>
    );
}
