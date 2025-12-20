'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
    Search,
    GitBranch,
    Download,
    Upload
} from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { exportPackageToGit } from '@/actions/git-sync';

const ModelerToolbar = () => {
    const temporalStore = useTemporalStore();
    const { saveToServer, isSaving, inferRelations, currentPackageId } = useEditorStore();
    const [mounted, setMounted] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    const handleExportToGit = useCallback(async () => {
        if (!currentPackageId || isExporting) return;

        setIsExporting(true);
        try {
            const result = await exportPackageToGit(currentPackageId);
            if (result.success) {
                alert(`Package exported successfully to: ${result.path}`);
            } else {
                alert(`Export failed: ${result.error}`);
            }
        } catch (error) {
            alert(`Export error: ${error}`);
        } finally {
            setIsExporting(false);
        }
    }, [currentPackageId, isExporting]);

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
            {renderButton(<Save size={16} />, "Save", () => alert("Local snapshot saved (Ctrl+S)"))}
            {renderButton(
                isSaving ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />,
                "Sync",
                () => saveToServer()
            )}

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
            {renderButton(<GitBranch size={16} />, "Infer", () => inferRelations(), false, "Derived Relations (A->B->C => A->C)")}

            <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 8px' }} />

            {renderButton(
                isExporting ? <Download size={16} className="animate-spin" /> : <Download size={16} />,
                "Export",
                handleExportToGit,
                !currentPackageId || isExporting,
                "Export to Git (JSON files)"
            )}
            {renderButton(
                <Upload size={16} />,
                "Import",
                () => alert("Import from Git: Select a package directory via file browser"),
                false,
                "Import from Git (JSON files)"
            )}
        </div>
    );
};

export default ModelerToolbar;

