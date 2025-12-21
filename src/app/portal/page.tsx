'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEditorStore, ArchimateView, ArchimateFolder, ModelElement, ModelRelation } from '@/store/useEditorStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Package, Layout, FileText, ChevronRight, User } from 'lucide-react';
import { ARCHIMATE_METAMODEL } from '@/lib/metamodel';
import styles from './portal.module.css';

const EditorCanvas = dynamic(() => import('@/components/Modeling/EditorCanvas'), { ssr: false });
const ModelBrowser = dynamic(() => import('@/components/Modeling/ModelBrowser'), { ssr: false });
const UserMenuWrapper = dynamic(() => import('@/components/UI/UserMenuWrapper').then(mod => ({ default: mod.UserMenuWrapper })), { ssr: false });

export default function PortalPage() {
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const {
        packages, currentPackageId, setCurrentPackage, setPackages,
        views, activeViewId, openView, selectedNode, elements, loadFromServer, relations
    } = useEditorStore();
    const { t } = useLanguage();

    useEffect(() => {
        setMounted(true);

        // Load packages list for the portal
        const initPortal = async () => {
            try {
                const { getModelPackages } = await import('@/actions/repository');
                const serverPackages = await getModelPackages();
                if (serverPackages.length > 0) {
                    setPackages(serverPackages.map(p => ({
                        id: p.id,
                        name: p.name,
                        description: p.description || undefined,
                        createdAt: p.createdAt,
                        updatedAt: p.updatedAt
                    })));
                }
            } catch (err) {
                console.error('Failed to init portal packages:', err);
            }
        };
        initPortal();
    }, [setPackages]);

    const handleSelectPackage = async (packageId: string) => {
        try {
            const { loadPackageData } = await import('@/actions/repository');
            const data = await loadPackageData(packageId);
            if (data) {
                setCurrentPackage(packageId);
                loadFromServer(
                    packageId,
                    data.folders as ArchimateFolder[],
                    data.views as ArchimateView[],
                    data.elements as ModelElement[],
                    data.relations as ModelRelation[]
                );
            }
        } catch (err) {
            console.error('Failed to load package data:', err);
        }
    };

    const filteredPackages = useMemo(() => {
        return packages.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [packages, searchQuery]);

    const activeView = useMemo(() => views.find(v => v.id === activeViewId), [views, activeViewId]);

    // Explicitly find the element in the repository based on the selected node on canvas
    const selectedElement = useMemo(() => {
        if (selectedNode?.data?.elementId) {
            return elements.find(e => e.id === selectedNode.data.elementId);
        }
        return null;
    }, [selectedNode, elements]);

    if (!mounted) return null;

    return (
        <div className={styles.portalContainer}>
            {/* Package Selection Landing Overlay (if no package selected) */}
            {!currentPackageId && (
                <div className={styles.landingOverlay}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.04em', color: '#3366ff' }}>Horizzon Portal</h1>
                        <p style={{ fontSize: '18px', opacity: 0.7 }}>Democratizing Architecture for Everyone</p>
                    </div>

                    <div className={styles.searchBar}>
                        <Search className={styles.searchIcon} size={20} />
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Find architecture domain, project, or IT area..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className={styles.packageGrid}>
                        {filteredPackages.map(pkg => (
                            <div key={pkg.id} className={styles.packageCard} onClick={() => handleSelectPackage(pkg.id)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#3366ff11', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3366ff' }}>
                                        <Package size={24} />
                                    </div>
                                    <h3 className={styles.packageTitle}>{pkg.name}</h3>
                                </div>
                                <p className={styles.packageDesc}>{pkg.description || 'Comprehensive view of the enterprise architecture domain and its components.'}</p>
                                <div className={styles.statRow}>
                                    <div className={styles.statBadge}>
                                        <Layout size={12} /> {views.filter(v => v.packageId === pkg.id).length} Views
                                    </div>
                                    <div className={styles.statBadge}>
                                        <FileText size={12} /> {elements.filter(e => e.packageId === pkg.id).length} Elements
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Portal Header */}
            <header className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <button
                        onClick={() => setCurrentPackage(null)}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        <span style={{ fontSize: '28px' }}>👁️</span>
                        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', color: '#3366ff' }}>Horizzon</h1>
                    </button>

                    {currentPackageId && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'var(--background-secondary, #f1f5f9)', borderRadius: '20px', fontSize: '13px', fontWeight: 500, border: '1px solid var(--border)' }}>
                            <Package size={14} />
                            <span>{packages.find(p => p.id === currentPackageId)?.name}</span>
                            <ChevronRight size={14} style={{ opacity: 0.5 }} />
                            <Layout size={14} />
                            <span>{activeView?.name || 'Select a view'}</span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Link href="/modeler" style={{ fontSize: '13px', color: '#3366ff', textDecoration: 'none', fontWeight: 600, padding: '8px 16px', borderRadius: '8px', background: '#3366ff11' }}>
                        Switch to Modeler
                    </Link>
                    <UserMenuWrapper />
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Sidebar: Simplified Model Browser */}
                <aside className={styles.sidebar}>
                    <ModelBrowser readOnly={true} />
                </aside>

                {/* Main Content: Diagram Viewer */}
                <main className={styles.mainArea}>
                    <div className={styles.canvasWrapper}>
                        {activeViewId ? (
                            <EditorCanvas readOnly={true} />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.3 }}>
                                <Layout size={80} strokeWidth={1} style={{ marginBottom: '24px' }} />
                                <p style={{ fontSize: '18px', fontWeight: 500 }}>Select an architecture view from the browser to explore</p>
                            </div>
                        )}
                    </div>
                </main>

                {/* Properties Side Sheet (Stakeholder focused) */}
                {selectedElement && (
                    <aside className={styles.propertiesPanel}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                background: ARCHIMATE_METAMODEL[selectedElement.type]?.color || '#888',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '24px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                {selectedElement.type.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>{selectedElement.name}</h2>
                                <span style={{ fontSize: '12px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                                    {ARCHIMATE_METAMODEL[selectedElement.type]?.name || selectedElement.type}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                            <section>
                                <h4 style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.5, marginBottom: '10px', letterSpacing: '0.05em', fontWeight: 700 }}>Description</h4>
                                <p style={{ fontSize: '15px', lineHeight: 1.6, margin: 0, color: 'var(--foreground)' }}>
                                    {selectedElement.description || 'No description available for this element.'}
                                </p>
                            </section>

                            <section>
                                <h4 style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.5, marginBottom: '10px', letterSpacing: '0.05em', fontWeight: 700 }}>Documentation</h4>
                                <div style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--foreground-secondary, #4b5563)' }}>
                                    {selectedElement.documentation || 'No additional documentation provided.'}
                                </div>
                            </section>

                            {selectedElement.properties && Object.keys(selectedElement.properties).length > 0 && (
                                <section>
                                    <h4 style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.5, marginBottom: '12px', letterSpacing: '0.05em', fontWeight: 700 }}>Business Attributes</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {Object.entries(selectedElement.properties).map(([key, value]) => (
                                            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--background-secondary, #f8fafc)', borderRadius: '8px', fontSize: '13px', border: '1px solid var(--border)' }}>
                                                <span style={{ fontWeight: 500, opacity: 0.6 }}>{key}</span>
                                                <span style={{ fontWeight: 600 }}>{String(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}
