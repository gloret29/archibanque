'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import styles from '@/app/modeler/modeler.module.css';

const ModelerTabs = () => {
    const { views, activeViewId, setActiveView, addView, deleteView } = useEditorStore();

    return (
        <div className={styles.tabBar}>
            <div className={styles.tabsList}>
                {views.map(view => (
                    <div
                        key={view.id}
                        className={`${styles.tabItem} ${view.id === activeViewId ? styles.activeTab : ''}`}
                        onClick={() => setActiveView(view.id)}
                    >
                        <span className={styles.tabIcon}>🎯</span>
                        <span className={styles.tabName}>{view.name}</span>
                        {views.length > 1 && (
                            <button
                                className={styles.closeTab}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteView(view.id);
                                }}
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}
                <button
                    className={styles.addTab}
                    onClick={() => addView(`View ${views.length + 1}`)}
                >
                    +
                </button>
            </div>
        </div>
    );
};

export default ModelerTabs;
