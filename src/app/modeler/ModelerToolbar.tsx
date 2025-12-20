'use client';

import React, { useEffect, useState } from 'react';
import { useTemporalStore } from '@/store/useEditorStore';
import styles from './modeler.module.css';
import {
    Save,
    RefreshCw,
    Undo2,
    Redo2,
    MousePointer2,
    Type,
    Grid,
    Search
} from 'lucide-react';

const ModelerToolbar = () => {
    const temporalStore = useTemporalStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    const renderButton = (icon: React.ReactNode, label: string, onClick?: () => void, disabled = false, title?: string) => (
        <button
            className={styles.toolButton}
            onClick={onClick}
            disabled={disabled}
            title={title}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                height: '42px',
                minWidth: '50px'
            }}
        >
            {icon}
            <span style={{ fontSize: '10px' }}>{label}</span>
        </button>
    );

    if (!mounted || !temporalStore) {
        return (
            <div className={styles.toolbar} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {renderButton(<Save size={16} />, "Save", undefined, true)}
                {renderButton(<RefreshCw size={16} />, "Sync", undefined, true)}
                <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 8px' }} />
                {renderButton(<Undo2 size={16} />, "Undo", undefined, true)}
                {renderButton(<Redo2 size={16} />, "Redo", undefined, true)}
            </div>
        );
    }

    const { undo, redo, futureStates, pastStates } = temporalStore;

    return (
        <div className={styles.toolbar} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {renderButton(<Save size={16} />, "Save")}
            {renderButton(<RefreshCw size={16} />, "Sync")}

            <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 8px' }} />

            {renderButton(<MousePointer2 size={16} />, "Select")}
            {renderButton(<Type size={16} />, "Label")}

            <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 8px' }} />

            {renderButton(
                <Undo2 size={16} />,
                "Undo",
                () => undo(),
                pastStates.length === 0,
                `Undo (${pastStates.length})`
            )}
            {renderButton(
                <Redo2 size={16} />,
                "Redo",
                () => redo(),
                futureStates.length === 0,
                `Redo (${futureStates.length})`
            )}

            <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 8px' }} />

            {renderButton(<Grid size={16} />, "Grid")}
            {renderButton(<Search size={16} />, "Find")}
        </div>
    );
};

export default ModelerToolbar;
