'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { ARCHIMATE_METAMODEL, ARCHIMATE_RELATIONS, RelationshipType } from '@/lib/metamodel';
import styles from '@/app/modeler/modeler.module.css';

const PropertiesPanel = () => {
    const {
        selectedNode, selectedEdge,
        deleteNode, deleteEdge,
        updateNodeData, updateEdgeData
    } = useEditorStore();

    if (!selectedNode && !selectedEdge) {
        return (
            <div className={styles.propsPlaceholder}>
                <p>Select an element or relationship to view properties</p>
            </div>
        );
    }

    if (selectedNode) {
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
                        onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
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
                    <p>Type: {nodeType}</p>
                    <p>Position: {Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)}</p>
                </div>
            </div>
        );
    }

    if (selectedEdge) {
        const relationType = (selectedEdge.data?.type as RelationshipType) || 'association';
        const meta = ARCHIMATE_RELATIONS[relationType];

        return (
            <div className={styles.propertiesContent}>
                <div className={styles.propHeader}>
                    <h4>{meta?.name || 'Relationship'}</h4>
                    <button
                        className={styles.deleteButton}
                        onClick={() => deleteEdge(selectedEdge.id)}
                    >
                        Delete
                    </button>
                </div>

                <div className={styles.propGroup}>
                    <label>Type</label>
                    <select
                        value={relationType}
                        onChange={(e) => updateEdgeData(selectedEdge.id, { type: e.target.value })}
                        className={styles.propInput}
                    >
                        {Object.values(ARCHIMATE_RELATIONS).map(rel => (
                            <option key={rel.id} value={rel.id}>{rel.name}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.propGroup}>
                    <label>ID</label>
                    <code className={styles.propCode}>{selectedEdge.id}</code>
                </div>

                <div className={styles.metadataSection}>
                    <h5>Connection</h5>
                    <p>Source: {selectedEdge.source}</p>
                    <p>Target: {selectedEdge.target}</p>
                </div>
            </div>
        );
    }

    return null;
};

export default PropertiesPanel;
