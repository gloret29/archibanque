'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const EditorCanvas = dynamic(() => import('@/components/Modeling/EditorCanvas'), { ssr: false });
const ModelerToolbar = dynamic(() => import('./ModelerToolbar'), { ssr: false });
const PropertiesPanel = dynamic(() => import('@/components/Modeling/PropertiesPanel'), { ssr: false });
const ModelBrowser = dynamic(() => import('@/components/Modeling/ModelBrowser'), { ssr: false });
const Palette = dynamic(() => import('@/components/Modeling/Palette'), { ssr: false });
const ModelerTabs = dynamic(() => import('./ModelerTabs'), { ssr: false });
const PackageSelector = dynamic(() => import('@/components/Modeling/PackageSelector'), { ssr: false });
const ResizablePanel = dynamic(() => import('@/components/UI/ResizablePanel'), { ssr: false });

import styles from './modeler.module.css';
import { useEditorStore } from '@/store/useEditorStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useInitializeFromDB } from '@/hooks/useInitializeFromDB';
import { CloudCheck, CloudUpload, Loader2 } from 'lucide-react';

export default function ModelerPage() {
    const [mounted, setMounted] = useState(false);
    const [paletteHeight, setPaletteHeight] = useState(280);

    // Initialize data from DB (settings and dataBlocks)
    useInitializeFromDB();

    // Initialize Auto-save
    const { isSaving } = useAutoSave(2000);

    // Handle hydration
    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    // Only access store after mounting to avoid hydration issues
    const storeState = useEditorStore();
    const { views, activeViewId, currentPackageId, packages } = storeState;

    const activeView = mounted ? views.find(v => v.id === activeViewId) : null;
    const currentPackage = mounted ? packages.find(p => p.id === currentPackageId) : null;

    // Show loading skeleton during hydration
    if (!mounted) {
        return (
            <div className={styles.modelerContainer}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <Link href="/" className={styles.logo} style={{ textDecoration: 'none' }}>
                            <span className={styles.logoIcon}>💎</span>
                            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: '#3366ff' }}>ArchiModeler</h1>
                        </Link>
                    </div>
                </header>
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '14px', color: '#999' }}>Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.modelerContainer}>
            {/* Main Header / Ribbon area */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/" className={styles.logo} style={{ textDecoration: 'none' }}>
                        <span className={styles.logoIcon}>💎</span>
                        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: '#3366ff' }}>ArchiModeler</h1>
                    </Link>
                    <div style={{ marginLeft: '20px' }}>
                        <PackageSelector />
                    </div>
                </div>

                <ModelerToolbar />

                <div className={styles.headerRight}>
                    <div style={{
                        marginRight: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: isSaving ? '#3366ff' : '#22c55e',
                        fontSize: '12px',
                        fontWeight: 500
                    }}>
                        {isSaving ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <CloudCheck size={18} />
                                <span>Saved</span>
                            </>
                        )}
                    </div>
                    <div className={styles.userProfile}>
                        <span style={{ fontSize: '12px', color: '#666', marginRight: '8px' }}>Expert Mode</span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3366ff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>JD</div>
                    </div>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left Sidebar: Model Browser + Palette stacked - Resizable */}
                <ResizablePanel
                    direction="horizontal"
                    initialSize={260}
                    minSize={200}
                    maxSize={450}
                    handlePosition="end"
                    className={styles.sidebar}
                    style={{ display: 'flex', flexDirection: 'column', padding: 0 }}
                >
                    {/* Model Browser - Top section (flexible) */}
                    <div style={{ flex: 1, minHeight: '150px', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderBottom: '1px solid #e0e0e0' }}>
                        <ModelBrowser />
                    </div>

                    {/* Palette - Bottom section (resizable vertically) */}
                    <ResizablePanel
                        direction="vertical"
                        initialSize={paletteHeight}
                        minSize={150}
                        maxSize={500}
                        handlePosition="start"
                        style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                    >
                        <div style={{ padding: '8px 12px', borderBottom: '1px solid #eee', background: '#f8f9fa' }}>
                            <h3 style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: '#666', letterSpacing: '0.05em', fontWeight: 600 }}>
                                ArchiMate Palette
                            </h3>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <Palette />
                        </div>
                    </ResizablePanel>
                </ResizablePanel>

                {/* Main Content Area */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', background: '#fff', minWidth: 0 }}>
                    <ModelerTabs />

                    <div style={{ flex: 1, position: 'relative' }}>
                        {activeViewId ? (
                            <EditorCanvas />
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                background: '#f8f9fa',
                                color: '#888'
                            }}>
                                <span style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>📐</span>
                                <p style={{ fontSize: '16px', margin: 0, fontWeight: 500 }}>Ouvrir une vue</p>
                                <p style={{ fontSize: '13px', margin: '8px 0 0', color: '#aaa' }}>
                                    Double-cliquez sur une vue dans le Model Browser
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Status Bar */}
                    <footer style={{
                        height: '28px',
                        background: '#f7f7f7',
                        borderTop: '1px solid #e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 15px',
                        fontSize: '11px',
                        color: '#666',
                        gap: '20px'
                    }}>
                        <span>Working Copy: <strong>{currentPackage?.name || 'No Package'}</strong></span>
                        <span>Elements: {activeView?.nodes.length || 0}</span>
                        <span>Relations: {activeView?.edges.length || 0}</span>
                        <div style={{ marginLeft: 'auto' }}>Zoom: 100%</div>
                    </footer>
                </main>

                {/* Right Sidebar: Properties - Resizable */}
                <ResizablePanel
                    direction="horizontal"
                    initialSize={280}
                    minSize={200}
                    maxSize={450}
                    handlePosition="start"
                    className={styles.properties}
                >
                    <PropertiesPanel />
                </ResizablePanel>
            </div>
        </div>
    );
}



