'use client';

import React from 'react';
import { useTemporalStore } from '@/store/useEditorStore';
import styles from './modeler.module.css';

const ModelerToolbar = () => {
    const { undo, redo, futureStates, pastStates } = useTemporalStore();

    return (
        <div className={styles.toolbar}>
            <button className={styles.toolButton}>Save</button>
            <button className={styles.toolButton}>Sync</button>
            <button
                className={styles.toolButton}
                onClick={() => undo()}
                disabled={pastStates.length === 0}
                title="Undo (Ctrl+Z)"
            >
                Undo ({pastStates.length})
            </button>
            <button
                className={styles.toolButton}
                onClick={() => redo()}
                disabled={futureStates.length === 0}
                title="Redo (Ctrl+Shift+Z)"
            >
                Redo ({futureStates.length})
            </button>
        </div>
    );
};

export default ModelerToolbar;
