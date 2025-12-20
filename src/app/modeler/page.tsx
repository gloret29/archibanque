'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const EditorCanvas = dynamic(() => import('@/components/Modeling/EditorCanvas'), { ssr: false });
const ModelerToolbar = dynamic(() => import('./ModelerToolbar'), { ssr: false });
const PropertiesPanel = dynamic(() => import('@/components/Modeling/PropertiesPanel'), { ssr: false });
const ModelBrowser = dynamic(() => import('@/components/Modeling/ModelBrowser'), { ssr: false });
const Palette = dynamic(() => import('@/components/Modeling/Palette'), { ssr: false });
const ModelerTabs = dynamic(() => import('./ModelerTabs'), { ssr: false });
const PackageSelector = dynamic(() => import('@/components/Modeling/PackageSelector'), { ssr: false });

import styles from './modeler.module.css';
import { useEditorStore } from '@/store/useEditorStore';

export default function ModelerPage() {
    const [mounted, setMounted] = useState(false);
    const [sidebarTab, setSidebarTab] = useState<'browser' | 'palette'>('browser');

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
                        <div className={styles.logo}>
                            <span className={styles.logoIcon}>💎</span>
                            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: '#3366ff' }}>ArchiModeler</h1>
                        </div>
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
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>💎</span>
                        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: '#3366ff' }}>ArchiModeler</h1>
                    </div>
                    <div style={{ marginLeft: '20px' }}>
                        <PackageSelector />
                    </div>
                </div>

                <ModelerToolbar />

                <div className={styles.headerRight}>
                    <div className={styles.userProfile}>
                        <span style={{ fontSize: '12px', color: '#666', marginRight: '8px' }}>Expert Mode</span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3366ff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>JD</div>
                    </div>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left Sidebar: Repository / Palette */}
                <aside className={styles.sidebar} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '12px 14px', borderBottom: '1px solid #eee' }}>
                            <h3 style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: '#999', letterSpacing: '0.05em' }}>
                                {sidebarTab === 'browser' ? 'Model Browser' : 'ArchiMate Palette'}
                            </h3>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
                            {sidebarTab === 'browser' ? <ModelBrowser /> : <Palette />}
                        </div>
                    </div>

                    {/* Sidebar Tabs (at bottom) */}
                    <div style={{ height: '32px', display: 'flex', borderTop: '1px solid #e0e0e0', background: '#f7f7f7' }}>
                        <button
                            onClick={() => setSidebarTab('browser')}
                            style={{
                                flex: 1,
                                border: 'none',
                                background: sidebarTab === 'browser' ? '#fff' : 'transparent',
                                fontSize: '11px',
                                fontWeight: sidebarTab === 'browser' ? 700 : 400,
                                cursor: 'pointer',
                                borderRight: '1px solid #e0e0e0'
                            }}
                        >
                            Model Browser
                        </button>
                        <button
                            onClick={() => setSidebarTab('palette')}
                            style={{
                                flex: 1,
                                border: 'none',
                                background: sidebarTab === 'palette' ? '#fff' : 'transparent',
                                fontSize: '11px',
                                fontWeight: sidebarTab === 'palette' ? 700 : 400,
                                cursor: 'pointer'
                            }}
                        >
                            Palette
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', background: '#fff' }}>
                    <ModelerTabs />

                    <div style={{ flex: 1, position: 'relative' }}>
                        <EditorCanvas />
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

                {/* Right Sidebar: Properties */}
                <aside className={styles.properties}>
                    <PropertiesPanel />
                </aside>
            </div>
        </div>
    );
}

