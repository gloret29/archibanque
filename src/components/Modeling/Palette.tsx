'use client';

import React from 'react';
import { ARCHIMATE_METAMODEL, ArchimateLayer } from '@/lib/metamodel';
import styles from './palette.module.css';

const Palette = () => {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const layers: ArchimateLayer[] = ['strategy', 'business', 'application', 'technology', 'motivation', 'implementation', 'other'];

    return (
        <div className={styles.palette}>
            {layers.map(layer => (
                <div key={layer} className={styles.layerSection}>
                    <h4 className={styles.layerTitle}>{layer}</h4>
                    <div className={styles.elementList}>
                        {Object.values(ARCHIMATE_METAMODEL)
                            .filter(item => item.layer === layer)
                            .map(item => (
                                <div
                                    key={item.id}
                                    className={styles.paletteItem}
                                    style={{ backgroundColor: item.color }}
                                    onDragStart={(event) => onDragStart(event, item.id)}
                                    draggable
                                >
                                    {item.name}
                                </div>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Palette;
