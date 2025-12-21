'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { ARCHIMATE_METAMODEL, ArchimateLayer } from '@/lib/metamodel';
import styles from './palette.module.css';

const Palette = () => {
    const { enabledElementTypes } = useEditorStore();

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const layers: ArchimateLayer[] = ['strategy', 'business', 'application', 'technology', 'physical', 'motivation', 'implementation', 'other'];

    return (
        <div className={styles.palette}>
            <div className={styles.paletteContent}>
                {layers.map(layer => {
                    const layerItems = Object.values(ARCHIMATE_METAMODEL)
                        .filter(item => item.layer === layer && enabledElementTypes.includes(item.id));

                    if (layerItems.length === 0) return null;

                    return (
                        <div key={layer} className={styles.layerSection}>
                            <h4 className={styles.layerTitle}>{layer}</h4>
                            <div className={styles.elementList}>
                                {layerItems.map(item => (
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
                    );
                })}
            </div>

            <div style={{ padding: '10px', borderTop: '1px solid #e0e0e0', marginTop: 'auto' }}>
                <Link href="/admin" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    color: '#666',
                    fontSize: '12px',
                    fontWeight: 500
                }}>
                    <Settings size={14} style={{ marginRight: '6px' }} />
                    Admin Settings
                </Link>
            </div>
        </div>
    );
};

export default Palette;
