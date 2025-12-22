'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useEditorStore, ArchimateFolder, ArchimateView, ModelElement, ModelRelation } from '@/store/useEditorStore';
import { ARCHIMATE_METAMODEL, ArchimateLayer } from '@/lib/metamodel';
import {
    Folder,
    FolderOpen,
    ChevronDown,
    ChevronRight,
    Layout,
    Plus,
    Edit2,
    Trash2,
    MoreHorizontal,
    FolderPlus,
    Box,
    Check,
    X,
    GripVertical,
    ArrowRightLeft
} from 'lucide-react';
import styles from './model-browser.module.css';

interface ModelBrowserProps {
    readOnly?: boolean;
}

interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    type: 'folder' | 'view' | 'element' | 'relation' | null;
    targetId: string | null;
    parentId: string | null;
}

interface TreeNodeProps {
    folder: ArchimateFolder;
    level: number;
    onContextMenu: (e: React.MouseEvent, type: 'folder' | 'view' | 'element' | 'relation', id: string, parentId: string | null) => void;
    draggedItem: { type: string; id: string } | null;
    onDragStart: (e: React.DragEvent, type: string, id: string) => void;
    onDragEnd: () => void;
    onDrop: (targetFolderId: string) => void;
}

const TreeNode = ({ folder, level, onContextMenu, draggedItem, onDragStart, onDragEnd, onDrop }: TreeNodeProps) => {
    const [isOpen, setIsOpen] = useState(level < 2);
    const [isDragOver, setIsDragOver] = useState(false);
    const {
        folders, views, elements, relations,
        openView, activeViewId, selectObject,
        selectedObject
    } = useEditorStore();

    const isSelected = selectedObject?.type === 'folder' && selectedObject?.id === folder.id;

    const childFolders = useMemo(() => folders.filter(f => f.parentId === folder.id), [folders, folder.id]);
    const folderViews = useMemo(() => views.filter(v => v.folderId === folder.id || (!v.folderId && folder.type === 'view-folder')), [views, folder.id, folder.type]);
    const folderElements = useMemo(() => elements.filter(e => e.folderId === folder.id), [elements, folder.id]);
    const folderRelations = useMemo(() => relations.filter(r => r.folderId === folder.id), [relations, folder.id]);

    const hasChildren = childFolders.length > 0 || folderViews.length > 0 || folderElements.length > 0 || folderRelations.length > 0;

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        onDrop(folder.id);
    };

    const getElementIcon = (type: string) => {
        const meta = ARCHIMATE_METAMODEL[type];
        return meta?.color || '#888';
    };

    return (
        <div className={styles.treeNode}>
            {/* Folder Row */}
            <div
                className={`${styles.treeRow} ${isDragOver ? styles.dragOver : ''} ${isSelected ? styles.active : ''}`}
                style={{ paddingLeft: level * 10 }}
                onClick={() => selectObject('folder', folder.id)}
                onContextMenu={(e) => onContextMenu(e, 'folder', folder.id, folder.parentId)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                draggable
                onDragStart={(e) => onDragStart(e, 'folder', folder.id)}
                onDragEnd={onDragEnd}
            >
                <span className={styles.dragHandle}>
                    <GripVertical size={12} />
                </span>
                <span
                    className={styles.expandIcon}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                >
                    {hasChildren ? (
                        isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                    ) : <span style={{ width: 14 }} />}
                </span>
                <span className={styles.folderIcon}>
                    {isOpen ? (
                        <FolderOpen size={14} fill="#7bb1f0" />
                    ) : (
                        <Folder size={14} fill={folder.parentId ? 'none' : '#7bb1f0'} />
                    )}
                </span>
                <span className={styles.nodeName}>{folder.name}</span>
            </div>

            {/* Children */}
            {isOpen && (
                <div className={styles.children}>
                    {/* Child Folders */}
                    {childFolders.map(f => (
                        <TreeNode
                            key={f.id}
                            folder={f}
                            level={level + 1}
                            onContextMenu={onContextMenu}
                            draggedItem={draggedItem}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                            onDrop={onDrop}
                        />
                    ))}

                    {/* Views */}
                    {folderViews.map(view => (
                        <ViewItem
                            key={view.id}
                            view={view}
                            level={level + 1}
                            isActive={view.id === activeViewId}
                            onSelect={() => selectObject('view', view.id)}
                            onOpen={() => openView(view.id)}
                            onContextMenu={onContextMenu}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                        />
                    ))}

                    {/* Elements */}
                    {folderElements.map(element => (
                        <ElementItem
                            key={element.id}
                            element={element}
                            level={level + 1}
                            color={getElementIcon(element.type)}
                            onSelect={() => selectObject('element', element.id)}
                            onContextMenu={onContextMenu}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                        />
                    ))}

                    {/* Relations */}
                    {folderRelations.map(relation => (
                        <RelationItem
                            key={relation.id}
                            relation={relation}
                            level={level + 1}
                            onSelect={() => selectObject('relation', relation.id)}
                            onContextMenu={onContextMenu}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

interface ViewItemProps {
    view: ArchimateView;
    level: number;
    isActive: boolean;
    onSelect: () => void;
    onOpen: () => void;
    onContextMenu: (e: React.MouseEvent, type: 'folder' | 'view' | 'element' | 'relation', id: string, parentId: string | null) => void;
    onDragStart: (e: React.DragEvent, type: string, id: string) => void;
    onDragEnd: () => void;
}

const ViewItem = ({ view, level, isActive, onSelect, onOpen, onContextMenu, onDragStart, onDragEnd }: ViewItemProps) => {
    const { selectedObject } = useEditorStore();
    const isSelected = selectedObject?.type === 'view' && selectedObject?.id === view.id;

    return (
        <div
            className={`${styles.treeRow} ${styles.viewRow} ${isActive ? styles.isActiveTab : ''} ${isSelected ? styles.active : ''}`}
            style={{ paddingLeft: level * 10 }}
            onClick={onSelect}
            onDoubleClick={onOpen}
            onContextMenu={(e) => onContextMenu(e, 'view', view.id, view.folderId || null)}
            draggable
            onDragStart={(e) => onDragStart(e, 'view', view.id)}
            onDragEnd={onDragEnd}
        >
            <span className={styles.dragHandle}>
                <GripVertical size={12} />
            </span>
            <Layout size={14} className={styles.viewIcon} />
            <span className={styles.nodeName}>{view.name}</span>
            <span className={styles.badge}>{view.nodes.length}</span>
        </div>
    );
};

interface ElementItemProps {
    element: ModelElement;
    level: number;
    color: string;
    onSelect: () => void;
    onContextMenu: (e: React.MouseEvent, type: 'folder' | 'view' | 'element' | 'relation', id: string, parentId: string | null) => void;
    onDragStart: (e: React.DragEvent, type: string, id: string) => void;
    onDragEnd: () => void;
}

const ElementItem = ({ element, level, color, onSelect, onContextMenu, onDragStart, onDragEnd }: ElementItemProps) => {
    const { selectedObject } = useEditorStore();
    const isSelected = selectedObject?.type === 'element' && selectedObject?.id === element.id;

    return (
        <div
            className={`${styles.treeRow} ${styles.elementRow} ${isSelected ? styles.active : ''}`}
            style={{ paddingLeft: level * 10 }}
            onClick={onSelect}
            onContextMenu={(e) => onContextMenu(e, 'element', element.id, element.folderId)}
            draggable
            onDragStart={(e) => onDragStart(e, 'element', element.id)}
            onDragEnd={onDragEnd}
        >
            <span className={styles.dragHandle}>
                <GripVertical size={12} />
            </span>
            <Box size={14} style={{ color }} />
            <span className={styles.nodeName}>{element.name}</span>
        </div>
    );
};


interface RelationItemProps {
    relation: ModelRelation;
    level: number;
    onSelect: () => void;
    onContextMenu: (e: React.MouseEvent, type: 'folder' | 'view' | 'element' | 'relation', id: string, parentId: string | null) => void;
    onDragStart: (e: React.DragEvent, type: string, id: string) => void;
    onDragEnd: () => void;
}

const RelationItem = ({ relation, level, onSelect, onContextMenu, onDragStart, onDragEnd }: RelationItemProps) => {
    const { selectedObject } = useEditorStore();
    const isSelected = selectedObject?.type === 'relation' && selectedObject?.id === relation.id;

    return (
        <div
            className={`${styles.treeRow} ${styles.elementRow} ${isSelected ? styles.active : ''}`}
            style={{ paddingLeft: level * 10 }}
            onClick={onSelect}
            onContextMenu={(e) => onContextMenu(e, 'relation', relation.id, relation.folderId)}
            draggable
            onDragStart={(e) => onDragStart(e, 'relation', relation.id)}
            onDragEnd={onDragEnd}
        >
            <span className={styles.dragHandle}>
                <GripVertical size={12} />
            </span>
            <ArrowRightLeft size={14} style={{ color: '#999' }} />
            <span className={styles.nodeName} style={{ color: '#666', fontStyle: 'italic' }}>{relation.name || relation.type}</span>
        </div>
    );
};

const ModelBrowser = ({ readOnly = false }: ModelBrowserProps) => {
    const {
        folders, views, elements, relations,
        setActiveView, openView, activeViewId, selectObject,
        addFolder, deleteFolder, renameFolder, moveFolder,
        addView, deleteView, renameView, moveView,
        addElement, deleteElement, renameElement, moveElement,
        deleteRelation, renameRelation, moveRelation,
        enabledElementTypes,
        currentPackageId, packages,
        selectedObject
    } = useEditorStore();

    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        visible: false, x: 0, y: 0, type: null, targetId: null, parentId: null
    });
    const [editingItem, setEditingItem] = useState<{ type: string; id: string; name: string } | null>(null);
    const [draggedItem, setDraggedItem] = useState<{ type: string; id: string } | null>(null);
    const [showElementLayers, setShowElementLayers] = useState(false);
    const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        type: string;
        id: string;
        message: string;
        title: string;
    } | null>(null);

    const rootFolders = useMemo(() => folders.filter(f => f.parentId === null), [folders]);
    const rootViews = useMemo(() => views.filter(v => v.folderId === null), [views]);
    const rootElements = useMemo(() => elements.filter(e => e.folderId === null), [elements]);
    const rootRelations = useMemo(() => relations.filter(r => r.folderId === null), [relations]);

    const getElementIcon = (type: string) => {
        const meta = ARCHIMATE_METAMODEL[type];
        return meta?.color || '#888';
    };

    // Group elements by layer for element creation submenu (filtered by enabled types)
    const elementsByLayer = useMemo(() => {
        const layers: ArchimateLayer[] = ['strategy', 'business', 'application', 'technology', 'physical', 'motivation', 'implementation', 'other'];
        return layers.map(layer => ({
            layer,
            items: Object.values(ARCHIMATE_METAMODEL)
                .filter(item => item.layer === layer && enabledElementTypes.includes(item.id))
        })).filter(group => group.items.length > 0);
    }, [enabledElementTypes]);

    // Handle F2 and Delete keys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input or if a modal is open
            if (editingItem || deleteConfirmation || (e.target as HTMLElement).tagName === 'INPUT') return;

            if (e.key === 'F2' && selectedObject && !readOnly) {
                e.preventDefault();
                const { type, id } = selectedObject;
                let currentName = '';
                if (type === 'folder') {
                    currentName = folders.find(f => f.id === id)?.name || '';
                } else if (type === 'view') {
                    currentName = views.find(v => v.id === id)?.name || '';
                } else if (type === 'element') {
                    currentName = elements.find(el => el.id === id)?.name || '';
                } else if (type === 'relation') {
                    currentName = relations.find(r => r.id === id)?.name || '';
                }
                setEditingItem({ type, id, name: currentName });
            }

            if (e.key === 'Delete' && selectedObject && !readOnly) {
                e.preventDefault();
                const { type, id } = selectedObject;
                let title = "";
                let message = "";

                if (type === 'folder') {
                    title = "Delete Folder";
                    message = "Delete this folder and all its contents?";
                } else if (type === 'view') {
                    title = "Delete View";
                    message = "Delete this view?";
                } else if (type === 'element') {
                    const element = elements.find(e => e.id === id);
                    const affectedViews = views.filter(v => v.nodes.some(n => n.data?.elementId === id));
                    title = `Delete element "${element?.name || 'Unknown'}"?`;
                    message = "Are you sure you want to delete this element?";
                    if (affectedViews.length > 0) {
                        message += `\n\nThis element is used in ${affectedViews.length} view(s). It will be removed from all of them.`;
                    }
                } else if (type === 'relation') {
                    const relation = relations.find(r => r.id === id);
                    const affectedViews = views.filter(v => v.edges.some(e => e.data?.relationId === id));
                    title = `Delete relation "${relation?.name || relation?.type || 'Unknown'}"?`;
                    message = "Are you sure you want to delete this relation?";
                    if (affectedViews.length > 0) {
                        message += `\n\nThis relation is visible in ${affectedViews.length} view(s).`;
                    }
                }

                setDeleteConfirmation({ type, id, title, message });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedObject, readOnly, editingItem, deleteConfirmation, folders, views, elements, relations]);

    const handleContextMenu = useCallback((e: React.MouseEvent, type: 'folder' | 'view' | 'element' | 'relation', id: string, parentId: string | null) => {
        if (readOnly) return;
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, type, targetId: id, parentId });
        setShowElementLayers(false);
        setHoveredLayer(null);
    }, [readOnly]);

    const closeContextMenu = useCallback(() => {
        setContextMenu(prev => ({ ...prev, visible: false }));
        setShowElementLayers(false);
        setHoveredLayer(null);
    }, []);

    const handleDragStart = useCallback((e: React.DragEvent, type: string, id: string) => {
        setDraggedItem({ type, id });
        if (type === 'element') {
            e.dataTransfer.setData('application/archi-element', id);
            e.dataTransfer.effectAllowed = 'move';
        }
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggedItem(null);
    }, []);

    const handleDrop = useCallback((targetFolderId: string) => {
        if (!draggedItem) return;

        const { type, id } = draggedItem;
        if (type === 'folder') {
            moveFolder(id, targetFolderId);
        } else if (type === 'view') {
            moveView(id, targetFolderId);
        } else if (type === 'element') {
            moveElement(id, targetFolderId);
        } else if (type === 'relation') {
            moveRelation(id, targetFolderId);
        }
        setDraggedItem(null);
    }, [draggedItem, moveFolder, moveView, moveElement, moveRelation]);

    const handleAction = useCallback((action: string) => {
        const { type, targetId } = contextMenu;

        if (!targetId && action !== 'new-folder') {
            closeContextMenu();
            return;
        }

        try {
            if (action === 'new-folder') {
                addFolder('New Folder', targetId, 'folder');
                closeContextMenu();
            } else if (action === 'new-view' && targetId) {
                addView('New View', targetId);
                closeContextMenu();
            } else if (action === 'rename' && type && targetId) {
                const currentName = type === 'folder'
                    ? folders.find(f => f.id === targetId)?.name || ''
                    : type === 'view'
                        ? (views.find(v => v.id === targetId)?.name || '')
                        : type === 'element'
                            ? (elements.find(e => e.id === targetId)?.name || '')
                            : (relations.find(r => r.id === targetId)?.name || '');
                setEditingItem({ type, id: targetId, name: currentName });
                closeContextMenu();
            } else if (action === 'delete' && type && targetId) {
                let title = "";
                let message = "";

                if (type === 'folder') {
                    title = "Delete Folder";
                    message = "Delete this folder and all its contents?";
                } else if (type === 'view') {
                    title = "Delete View";
                    message = "Delete this view?";
                } else if (type === 'element') {
                    const element = elements.find(e => e.id === targetId);
                    const affectedViews = views.filter(v => v.nodes.some(n => n.data?.elementId === targetId));

                    title = `Delete element "${element?.name || 'Unknown'}"?`;
                    message = "Are you sure you want to delete this element?";
                    if (affectedViews.length > 0) {
                        message = `This element is used in the following ${affectedViews.length} view(s):\n- ` +
                            affectedViews.map(v => v.name).join('\n- ') +
                            `\n\nIt will be removed from all these views and all its relations will be deleted.`;
                    }
                } else if (type === 'relation') {
                    const relation = relations.find(r => r.id === targetId);
                    const affectedViews = views.filter(v => v.edges.some(e => e.data?.relationId === targetId));

                    title = `Delete relation "${relation?.name || relation?.type || 'Unknown'}"?`;
                    message = "Are you sure you want to delete this relation?";
                    if (affectedViews.length > 0) {
                        message = `This relation is visible in ${affectedViews.length} view(s). It will be removed from all of them.`;
                    }
                }

                setDeleteConfirmation({ type, id: targetId, title, message });
                closeContextMenu();
            }
        } catch (err) {
            console.error('Error in handleAction:', err);
            closeContextMenu();
        }
    }, [contextMenu, addFolder, addView, folders, views, elements, relations, closeContextMenu, setDeleteConfirmation]);

    const executeDelete = useCallback(() => {
        if (!deleteConfirmation) return;
        const { type, id } = deleteConfirmation;

        if (type === 'folder') deleteFolder(id);
        else if (type === 'view') deleteView(id);
        else if (type === 'element') deleteElement(id);
        else if (type === 'relation') deleteRelation(id);

        setDeleteConfirmation(null);
    }, [deleteConfirmation, deleteFolder, deleteView, deleteElement, deleteRelation]);

    const handleCreateElement = useCallback((elementType: string) => {
        const { targetId } = contextMenu;
        if (!targetId) return;
        const meta = ARCHIMATE_METAMODEL[elementType];
        addElement(`New ${meta?.name || elementType}`, elementType, targetId);
        closeContextMenu();
    }, [contextMenu, addElement, closeContextMenu]);

    const handleRename = useCallback(() => {
        if (!editingItem) return;
        const { type, id, name } = editingItem;
        if (type === 'folder') renameFolder(id, name);
        else if (type === 'view') renameView(id, name);
        else if (type === 'element') renameElement(id, name);
        else if (type === 'relation') renameRelation(id, name);
        setEditingItem(null);
    }, [editingItem, renameFolder, renameView, renameElement, renameRelation]);

    return (
        <div className={styles.modelBrowser} onClick={closeContextMenu}>
            {/* Header */}
            <div className={styles.header}>
                <span className={styles.title}>Model Browser</span>
                {!readOnly && (
                    <button
                        className={styles.addBtn}
                        onClick={() => addFolder('New Folder', null, 'folder')}
                        title="Add root folder"
                    >
                        <FolderPlus size={14} />
                    </button>
                )}
            </div>

            {/* Tree */}
            <div className={styles.tree}>
                {rootFolders.map(folder => (
                    <TreeNode
                        key={folder.id}
                        folder={folder}
                        level={0}
                        onContextMenu={handleContextMenu}
                        draggedItem={readOnly ? null : draggedItem}
                        onDragStart={readOnly ? () => { } : handleDragStart}
                        onDragEnd={readOnly ? () => { } : handleDragEnd}
                        onDrop={readOnly ? () => { } : handleDrop}
                    />
                ))}

                {/* Root Views */}
                {rootViews.map(view => (
                    <div
                        key={view.id}
                        className={`${styles.treeRow} ${styles.viewRow} ${activeViewId === view.id ? styles.isActiveTab : ''} ${selectedObject?.type === 'view' && selectedObject?.id === view.id ? styles.active : ''}`}
                        style={{ paddingLeft: 0 }}
                        onClick={() => selectObject('view', view.id)}
                        onDoubleClick={() => openView(view.id)}
                        onContextMenu={(e) => handleContextMenu(e, 'view', view.id, null)}
                        draggable={!readOnly}
                        onDragStart={(e) => !readOnly && handleDragStart(e, 'view', view.id)}
                        onDragEnd={() => !readOnly && handleDragEnd()}
                    >
                        <span className={styles.dragHandle}>
                            <GripVertical size={12} />
                        </span>
                        <Layout size={14} className={styles.viewIcon} />
                        <span className={styles.nodeName}>{view.name}</span>
                        <span className={styles.badge}>{view.nodes.length}</span>
                    </div>
                ))}

                {/* Root Elements */}
                {rootElements.map(element => (
                    <ElementItem
                        key={element.id}
                        element={element}
                        level={0}
                        color={getElementIcon(element.type)}
                        onSelect={() => selectObject('element', element.id)}
                        onContextMenu={handleContextMenu}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    />
                ))}

                {/* Root Relations */}
                {rootRelations.map(relation => (
                    <RelationItem
                        key={relation.id}
                        relation={relation}
                        level={0}
                        onSelect={() => selectObject('relation', relation.id)}
                        onContextMenu={handleContextMenu}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    />
                ))}
            </div>

            {/* Context Menu */}
            {contextMenu.visible && (
                <div
                    className={styles.contextMenu}
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.type === 'folder' && (
                        <>
                            <button onClick={() => handleAction('new-folder')}>
                                <FolderPlus size={14} /> New Folder
                            </button>
                            <button onClick={() => handleAction('new-view')}>
                                <Layout size={14} /> New View
                            </button>

                            {/* New Element with submenu */}
                            <div
                                style={{ position: 'relative' }}
                                onMouseLeave={() => {
                                    setShowElementLayers(false);
                                    setHoveredLayer(null);
                                }}
                            >
                                <button
                                    onMouseEnter={() => setShowElementLayers(true)}
                                    style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Box size={14} /> New Element
                                    </span>
                                    <span style={{ color: '#aaa' }}>▶</span>
                                </button>

                                {showElementLayers && (
                                    <div
                                        className={styles.submenu}
                                        style={{ top: 0 }}
                                    >
                                        {elementsByLayer.map(group => (
                                            <div
                                                key={group.layer}
                                                style={{ position: 'relative' }}
                                                onMouseLeave={() => setHoveredLayer(null)}
                                            >
                                                <button
                                                    onMouseEnter={() => setHoveredLayer(group.layer)}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        textTransform: 'capitalize',
                                                        fontSize: '11px',
                                                        backgroundColor: hoveredLayer === group.layer ? '#f0f0f0' : 'transparent'
                                                    }}
                                                >
                                                    {group.layer}
                                                    <span style={{ color: '#aaa', fontSize: '10px' }}>▶</span>
                                                </button>

                                                {hoveredLayer === (group.layer as string) && (
                                                    <div
                                                        className={styles.submenu}
                                                        style={{ left: '100%', top: 0 }}
                                                    >
                                                        {group.items.map(item => (
                                                            <button
                                                                key={item.id}
                                                                onClick={() => handleCreateElement(item.id)}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    fontSize: '11px',
                                                                    padding: '6px 10px'
                                                                }}
                                                            >
                                                                <span style={{
                                                                    width: '10px',
                                                                    height: '10px',
                                                                    borderRadius: '2px',
                                                                    background: item.color,
                                                                    flexShrink: 0
                                                                }} />
                                                                {item.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={styles.separator} />
                        </>
                    )}
                    <button onClick={() => handleAction('rename')}>
                        <Edit2 size={14} /> Rename
                    </button>
                    <button onClick={() => handleAction('delete')} className={styles.danger}>
                        <Trash2 size={14} /> Delete
                    </button>
                </div>
            )}

            {/* Rename Modal */}
            {editingItem && (
                <div className={styles.editOverlay} onClick={() => setEditingItem(null)}>
                    <div className={styles.editDialog} onClick={(e) => e.stopPropagation()}>
                        <input
                            autoFocus
                            value={editingItem.name}
                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename();
                                if (e.key === 'Escape') setEditingItem(null);
                            }}
                        />
                        <div className={styles.editActions}>
                            <button className={styles.confirm} onClick={handleRename}>
                                <Check size={16} />
                            </button>
                            <button className={styles.cancel} onClick={() => setEditingItem(null)}>
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {deleteConfirmation && (
                <div className={styles.editOverlay} onClick={() => setDeleteConfirmation(null)}>
                    <div className={`${styles.editDialog} ${styles.confirmDialog}`} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.confirmTitle}>{deleteConfirmation.title}</h3>
                        <div className={styles.confirmMessage}>
                            {deleteConfirmation.message}
                        </div>
                        <div className={styles.confirmFooter}>
                            <button onClick={executeDelete} className={`${styles.confirmBtn} ${styles.confirmDelete}`}>
                                <Trash2 size={14} /> Delete
                            </button>
                            <button onClick={() => setDeleteConfirmation(null)} className={`${styles.confirmBtn} ${styles.cancel}`}>
                                <X size={14} /> Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModelBrowser;
