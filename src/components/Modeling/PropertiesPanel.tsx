'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { ARCHIMATE_METAMODEL } from '@/lib/metamodel';
import styles from '@/app/modeler/modeler.module.css';

const PropertiesPanel = () => {
    const { selectedNode, deleteNode } = useEditorStore();

    if (!selectedNode) {
        return (
            <div className={styles.propsPlaceholder}>
                <p>Select an element to view properties</p>
            </div>
        );
    }

    const nodeType = selectedNode.data.type as string;
    const meta = ARCHIMATE_METAMODEL[nodeType];

    return (
        <div className={styles.propertiesContent}>
            <div className={styles.propHeader}>
                <h4>{meta?.name || 'Element'}</h4>
                <button
                    className={styles.deleteButton}
                    onClick={() => deleteNode(selectedNode.id)}
                >
                    Delete
                </button>
            </div>

            <div className={styles.propGroup}>
                <label>Name</label>
                <input
                    type="text"
                    value={selectedNode.data.label as string}
                    onChange={() => {
                        // In a real app, we'd update the node data in the store
                        // For now, let's just show it's possible
                    }}
                    className={styles.propInput}
                />
            </div>

            <div className={styles.propGroup}>
                <label>ID</label>
                <code className={styles.propCode}>{selectedNode.id}</code>
            </div>

            <div className={styles.propGroup}>
                <label>Layer</label>
                <div
                    className={styles.layerBadge}
                    style={{ backgroundColor: meta?.color }}
                >
                    {meta?.layer || 'Other'}
                </div>
            </div>

            <div className={styles.metadataSection}>
                <h5>Metadata</h5>
                <p>Created: {new Date().toLocaleDateString()}</p>
                <p>Version: 1.0</p>
            </div>
        </div>
    );
};

export default PropertiesPanel;
