'use client';

import React, { useState } from 'react';
import { useEditorStore, ArchimateFolder, ArchimateView } from '@/store/useEditorStore';
import {
    Folder,
    ChevronDown,
    ChevronRight,
    Layout,
    Plus
} from 'lucide-react';

interface TreeItemProps {
    folder: ArchimateFolder;
    level: number;
}

const TreeItem = ({ folder, level }: TreeItemProps) => {
    const [isOpen, setIsOpen] = useState(true);
    const { folders, views, setActiveView, activeViewId, addView } = useEditorStore();

    const childFolders = folders.filter(f => f.parentId === folder.id);
    const folderViews = views.filter(() => {
        // For now, if no folder logic is implemented in views, we put all views under f_views
        return folder.id === 'f_views';
    });

    const hasChildren = childFolders.length > 0 || folderViews.length > 0;

    return (
        <div style={{ marginLeft: level * 12 }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    color: '#333',
                    transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
                <div onClick={() => setIsOpen(!isOpen)} style={{ display: 'flex', alignItems: 'center', width: '20px' }}>
                    {hasChildren ? (
                        isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                    ) : null}
                </div>
                <Folder size={14} style={{ marginRight: '6px', color: '#7bb1f0' }} fill={folder.parentId ? "none" : "#7bb1f0"} />
                <span style={{ flex: 1 }}>{folder.name}</span>
                {folder.type === 'view-folder' && (
                    <button
                        onClick={(e) => { e.stopPropagation(); addView('New View'); }}
                        style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', opacity: 0.5 }}
                    >
                        <Plus size={12} />
                    </button>
                )}
            </div>

            {isOpen && (
                <div>
                    {childFolders.map((f: ArchimateFolder) => (
                        <TreeItem key={f.id} folder={f} level={level + 1} />
                    ))}
                    {folderViews.map((view: ArchimateView) => (
                        <div
                            key={view.id}
                            onClick={() => setActiveView(view.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '4px 8px 4px 34px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                background: view.id === activeViewId ? '#e8f0fe' : 'transparent',
                                color: view.id === activeViewId ? '#1a73e8' : '#555',
                                transition: 'background 0.2s',
                                marginLeft: level * 12
                            }}
                            onMouseEnter={(e) => {
                                if (view.id !== activeViewId) e.currentTarget.style.background = '#f0f0f0';
                            }}
                            onMouseLeave={(e) => {
                                if (view.id !== activeViewId) e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <Layout size={14} style={{ marginRight: '6px', opacity: 0.7 }} />
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{view.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ModelBrowser = () => {
    const { folders } = useEditorStore();
    const rootFolders = folders.filter((f: ArchimateFolder) => f.parentId === null);

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
            {rootFolders.map((f: ArchimateFolder) => (
                <TreeItem key={f.id} folder={f} level={0} />
            ))}
        </div>
    );
};

export default ModelBrowser;
