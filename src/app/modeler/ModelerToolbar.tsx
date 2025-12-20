'use client';

import React from 'react';
import styles from './modeler.module.css';

const ModelerToolbar = () => {
    // Temporarily disabled due to build-time SSR issues with Zundo
    return (
        <div className={styles.toolbar}>
            <button className={styles.toolButton}>Save</button>
            <button className={styles.toolButton}>Sync</button>
            <button className={styles.toolButton} disabled>Undo</button>
            <button className={styles.toolButton} disabled>Redo</button>
        </div>
    );
};

export default ModelerToolbar;
