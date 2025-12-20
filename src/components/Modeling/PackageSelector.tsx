'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useEditorStore, ModelPackage, ArchimateFolder, ArchimateView } from '@/store/useEditorStore';
import { getModelPackages, createModelPackage, loadPackageData } from '@/actions/repository';
import { Package, Plus, ChevronDown, Loader2 } from 'lucide-react';

interface PackageSelectorProps {
    className?: string;
}

const PackageSelector = ({ className }: PackageSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const {
        packages,
        currentPackageId,
        setPackages,
        setCurrentPackage,
        addPackage,
        loadFromServer
    } = useEditorStore();

    const currentPackage = packages.find(p => p.id === currentPackageId);

    // Load packages on mount
    useEffect(() => {
        const loadPackages = async () => {
            try {
                const serverPackages = await getModelPackages();
                if (serverPackages.length > 0) {
                    const mapped: ModelPackage[] = serverPackages.map(p => ({
                        id: p.id,
                        name: p.name,
                        description: p.description || undefined,
                        createdAt: p.createdAt,
                        updatedAt: p.updatedAt
                    }));
                    setPackages(mapped);
                }
            } catch (err) {
                console.error('Failed to load packages:', err);
            }
        };
        loadPackages();
    }, [setPackages]);

    const handleSelectPackage = useCallback(async (packageId: string) => {
        setIsLoading(true);
        setIsOpen(false);
        try {
            const data = await loadPackageData(packageId);
            if (data) {
                setCurrentPackage(packageId);
                loadFromServer(
                    packageId,
                    data.folders as ArchimateFolder[],
                    data.views as ArchimateView[]
                );
            }
        } catch (err) {
            console.error('Failed to load package:', err);
        } finally {
            setIsLoading(false);
        }
    }, [setCurrentPackage, loadFromServer]);

    const handleCreatePackage = useCallback(async () => {
        if (!newName.trim()) return;

        setIsLoading(true);
        try {
            const pkg = await createModelPackage(newName, newDescription || undefined);
            const newPkg = addPackage(newName, newDescription);
            // Update with server ID
            setPackages([...packages.filter(p => p.id !== newPkg.id), {
                ...newPkg,
                id: pkg.id
            }]);
            setCurrentPackage(pkg.id);
            loadFromServer(pkg.id, [], []);
            setNewName('');
            setNewDescription('');
            setIsCreateOpen(false);
        } catch (err) {
            console.error('Failed to create package:', err);
        } finally {
            setIsLoading(false);
        }
    }, [newName, newDescription, addPackage, packages, setPackages, setCurrentPackage, loadFromServer]);

    return (
        <div className={className} style={{ position: 'relative' }}>
            {/* Current Package Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#333',
                    minWidth: '180px',
                    transition: 'all 0.2s'
                }}
            >
                {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <Package size={16} style={{ color: '#3366ff' }} />
                )}
                <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentPackage?.name || 'Select Package'}
                </span>
                <ChevronDown size={14} style={{ opacity: 0.5, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: '4px',
                        background: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        minWidth: '250px',
                        zIndex: 1000,
                        overflow: 'hidden'
                    }}
                >
                    {/* Package List */}
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {packages.map(pkg => (
                            <button
                                key={pkg.id}
                                onClick={() => handleSelectPackage(pkg.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    width: '100%',
                                    padding: '10px 14px',
                                    background: pkg.id === currentPackageId ? '#edf2ff' : 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    textAlign: 'left',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (pkg.id !== currentPackageId) {
                                        e.currentTarget.style.background = '#f5f5f5';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (pkg.id !== currentPackageId) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <Package size={16} style={{ color: pkg.id === currentPackageId ? '#3366ff' : '#999' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: pkg.id === currentPackageId ? 600 : 400, color: pkg.id === currentPackageId ? '#3366ff' : '#333' }}>
                                        {pkg.name}
                                    </div>
                                    {pkg.description && (
                                        <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                                            {pkg.description}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Create New button */}
                    <div style={{ borderTop: '1px solid #eee', padding: '8px' }}>
                        {!isCreateOpen ? (
                            <button
                                onClick={() => setIsCreateOpen(true)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    width: '100%',
                                    padding: '8px 10px',
                                    background: '#f8f9fa',
                                    border: '1px dashed #ccc',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    color: '#666',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Plus size={14} />
                                Create New Package
                            </button>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input
                                    type="text"
                                    placeholder="Package name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    style={{
                                        padding: '8px 10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '12px'
                                    }}
                                    autoFocus
                                />
                                <input
                                    type="text"
                                    placeholder="Description (optional)"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    style={{
                                        padding: '8px 10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '12px'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => { setIsCreateOpen(false); setNewName(''); setNewDescription(''); }}
                                        style={{
                                            flex: 1,
                                            padding: '6px',
                                            background: '#f5f5f5',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreatePackage}
                                        disabled={!newName.trim() || isLoading}
                                        style={{
                                            flex: 1,
                                            padding: '6px',
                                            background: '#3366ff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            cursor: 'pointer',
                                            opacity: !newName.trim() ? 0.5 : 1
                                        }}
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Click outside to close */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999
                    }}
                    onClick={() => { setIsOpen(false); setIsCreateOpen(false); }}
                />
            )}
        </div>
    );
};

export default PackageSelector;
