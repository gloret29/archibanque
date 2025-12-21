import { create } from 'zustand';
import {
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    addEdge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
} from '@xyflow/react';
// Temporarily disabled due to SSR hydration issues with React 19
// import { temporal } from 'zundo';
import { RelationshipType, getDerivedRelationship, ARCHIMATE_METAMODEL } from '@/lib/metamodel';
import { saveRepositoryState } from '@/actions/repository';

export interface ArchimateView {
    id: string;
    name: string;
    nodes: Node[];
    edges: Edge[];
    folderId?: string;
}

export interface ArchimateFolder {
    id: string;
    name: string;
    parentId: string | null;
    type: 'folder' | 'view-folder' | 'element-folder';
}

export interface ModelPackage {
    id: string;
    name: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Repository element - exists independently of views
export interface ModelElement {
    id: string;
    name: string;
    type: string; // ArchiMate type (e.g., 'business-actor', 'application-component')
    folderId: string | null; // Parent folder in repository tree
    description?: string; // RW - Short description
    documentation?: string; // RW - Detailed documentation
    properties?: Record<string, string>;
    // Read-only metadata (system-generated)
    createdAt?: Date; // RO - Creation timestamp
    modifiedAt?: Date; // RO - Last modification timestamp
    author?: string; // RO - Creator user ID
}

export interface ModelRelation {
    id: string;
    type: string;
    name: string;
    sourceId: string;
    targetId: string;
    folderId: string | null;
}

export type AttributeType = 'string' | 'number' | 'date' | 'enum';

export interface DataBlockAttribute {
    id: string;
    name: string;
    key: string;
    type: AttributeType;
    enumValues?: string[];
}

export interface DataBlock {
    id: string;
    name: string;
    targetTypes: string[]; // IDs of definitions from ARCHIMATE_METAMODEL or relationships
    attributes: DataBlockAttribute[];
}

interface EditorState {
    // Packages
    packages: ModelPackage[];
    currentPackageId: string | null;

    // Repository
    folders: ArchimateFolder[];
    views: ArchimateView[];
    elements: ModelElement[]; // Repository elements
    relations: ModelRelation[]; // Repository relations

    // Configuration / Admin
    dataBlocks: DataBlock[];
    enabledElementTypes: string[]; // List of enabled ArchiMate element type IDs
    settingsLoaded: boolean;
    dataBlocksLoaded: boolean;

    // UI State
    activeViewId: string | null;
    openViewIds: string[]; // Views currently open as tabs
    selectedNode: Node | null;
    selectedEdge: Edge | null;
    selectedObject: { type: 'element' | 'relation' | 'view' | 'folder', id: string } | null;

    isSaving: boolean;
    isLoading: boolean;



    // Package Actions
    setPackages: (packages: ModelPackage[]) => void;
    setCurrentPackage: (packageId: string) => void;
    addPackage: (name: string, description?: string) => ModelPackage;

    // Folder/View Actions
    setActiveView: (viewId: string) => void;
    openView: (viewId: string) => void; // Open a view as a tab
    closeView: (viewId: string) => void; // Close a tab (view stays in repository)
    addView: (name: string, folderId?: string) => void;
    deleteView: (viewId: string) => void; // Delete from repository
    renameView: (viewId: string, name: string) => void;
    moveView: (viewId: string, folderId: string | null) => void;
    addFolder: (name: string, parentId: string | null, type: ArchimateFolder['type']) => void;
    deleteFolder: (folderId: string) => void;
    renameFolder: (folderId: string, name: string) => void;
    moveFolder: (folderId: string, newParentId: string | null) => void;

    // Element Actions (repository elements)
    addElement: (name: string, type: string, folderId: string | null) => ModelElement;
    deleteElement: (elementId: string) => void;
    renameElement: (elementId: string, name: string) => void;
    moveElement: (elementId: string, folderId: string | null) => void;
    updateElementProperties: (elementId: string, properties: Record<string, string>) => void;
    updateElementDescription: (elementId: string, description: string) => void;
    updateElementDocumentation: (elementId: string, documentation: string) => void;

    // Relation Actions
    addRelation: (type: string, sourceId: string, targetId: string, folderId: string | null) => ModelRelation;
    deleteRelation: (relationId: string) => void;
    renameRelation: (relationId: string, name: string) => void;
    moveRelation: (relationId: string, folderId: string | null) => void;

    // DataBlock Actions
    addDataBlock: (name: string) => DataBlock;
    updateDataBlock: (id: string, updates: Partial<DataBlock>) => void;
    deleteDataBlock: (id: string) => void;
    addAttributeToBlock: (blockId: string, attribute: Omit<DataBlockAttribute, 'id'>) => void;
    updateBlockAttribute: (blockId: string, attributeId: string, updates: Partial<DataBlockAttribute>) => void;
    deleteBlockAttribute: (blockId: string, attributeId: string) => void;

    // Canvas actions (applied to active view)
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    addNode: (node: Node) => void;

    // Selection/Metadata
    setSelectedNode: (node: Node | null) => void;
    setSelectedEdge: (edge: Edge | null) => void;
    updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
    updateEdgeData: (edgeId: string, data: Record<string, unknown>) => void;
    deleteNode: (nodeId: string) => void;
    deleteEdge: (edgeId: string) => void;
    inferRelations: () => void;
    updateNodeParent: (nodeId: string, parentId: string | null, position?: { x: number, y: number }) => void;
    saveToServer: () => Promise<void>;

    // Load from server
    loadFromServer: (packageId: string, folders: ArchimateFolder[], views: ArchimateView[], elements?: ModelElement[], relations?: ModelRelation[]) => void;

    // Admin Actions
    toggleElementType: (typeId: string) => void;
    enableAllElementTypes: () => void;
    disableAllElementTypes: () => void;

    // UI State Actions
    selectObject: (type: 'element' | 'relation' | 'view' | 'folder', id: string) => void;

    // Persistence Actions
    loadSettingsFromDB: () => Promise<void>;
    loadDataBlocksFromDB: () => Promise<void>;
    setDataBlocks: (blocks: DataBlock[]) => void;
    setEnabledElementTypes: (types: string[]) => void;
}

// No default view - user must create or select one
const initialFolders: ArchimateFolder[] = [
    { id: 'f_root', name: 'Archisurance', parentId: null, type: 'folder' },
    { id: 'f_views', name: 'Architecture views', parentId: 'f_root', type: 'view-folder' },
];

const defaultPackage: ModelPackage = {
    id: 'default_package',
    name: 'Default Project',
    description: 'Default architecture project'
};

// Temporarily removed temporal() wrapper due to SSR hydration issues with React 19
// The undo/redo functionality is disabled until a proper fix is implemented
export const useEditorStore = create<EditorState>()((set, get) => ({
    packages: [defaultPackage],
    currentPackageId: 'default_package',
    folders: initialFolders,
    views: [], // No default views
    elements: [], // Repository elements
    relations: [], // Repository relations
    dataBlocks: [], // Custom data blocks
    activeViewId: null, // No view selected by default
    openViewIds: [], // No tabs open by default
    selectedNode: null,
    selectedEdge: null,
    selectedObject: null,
    isSaving: false,
    isLoading: false,
    settingsLoaded: false,
    dataBlocksLoaded: false,

    // Default: all elements enabled
    enabledElementTypes: Object.keys(ARCHIMATE_METAMODEL),

    setPackages: (packages: ModelPackage[]) => set({ packages }),

    setCurrentPackage: (packageId: string) => {
        set({ currentPackageId: packageId, selectedNode: null, selectedEdge: null });
    },

    toggleElementType: (typeId: string) => {
        const { enabledElementTypes } = get();
        if (enabledElementTypes.includes(typeId)) {
            set({ enabledElementTypes: enabledElementTypes.filter(id => id !== typeId) });
        } else {
            set({ enabledElementTypes: [...enabledElementTypes, typeId] });
        }
    },

    enableAllElementTypes: () => {
        set({ enabledElementTypes: Object.keys(ARCHIMATE_METAMODEL) });
    },

    disableAllElementTypes: () => {
        set({ enabledElementTypes: [] });
    },

    selectObject: (type: 'element' | 'relation' | 'view' | 'folder', id: string) => {
        const { openView } = get();

        // Update selected object
        set({ selectedObject: { type, id } });

        // If it's a view, open/activate it
        if (type === 'view') {
            openView(id);
            // Clear canvas selection as we switched context
            set({ selectedNode: null, selectedEdge: null });
        } else if (type === 'folder') {
            // Clear canvas selection
            set({ selectedNode: null, selectedEdge: null });
        } else {
            // For elements/relations, we keep the canvas selection as is for now
            // or we could try to find the corresponding node in the active view
            set({ selectedNode: null, selectedEdge: null });
        }
    },

    // Persistence actions for loading from database
    loadSettingsFromDB: async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const settings = await res.json();
                set({
                    enabledElementTypes: settings.enabledElementTypes,
                    settingsLoaded: true
                });
            }
        } catch (error) {
            console.error('Failed to load settings from DB:', error);
        }
    },

    loadDataBlocksFromDB: async () => {
        try {
            const res = await fetch('/api/datablocks');
            if (res.ok) {
                const blocks = await res.json();
                set({
                    dataBlocks: blocks,
                    dataBlocksLoaded: true
                });
            }
        } catch (error) {
            console.error('Failed to load data blocks from DB:', error);
        }
    },

    setDataBlocks: (blocks: DataBlock[]) => set({ dataBlocks: blocks }),

    setEnabledElementTypes: (types: string[]) => set({ enabledElementTypes: types }),

    addPackage: (name: string, description?: string) => {
        const newPackage: ModelPackage = {
            id: `pkg_${Date.now()}`,
            name,
            description,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        set({ packages: [...get().packages, newPackage] });
        return newPackage;
    },

    loadFromServer: (packageId: string, folders: ArchimateFolder[], views: ArchimateView[], elements?: ModelElement[], relations?: ModelRelation[]) => {
        // Start with no tabs open - user will open views from the Model Browser
        set({
            currentPackageId: packageId,
            folders: folders.length > 0 ? folders : initialFolders,
            views: views, // Use provided views, can be empty
            elements: elements || [],
            relations: relations || [],
            openViewIds: [], // No tabs open initially
            activeViewId: null, // No view active
            selectedNode: null,
            selectedEdge: null
        });
    },

    setActiveView: (viewId: string) => set({ activeViewId: viewId, selectedNode: null, selectedEdge: null }),

    // Open a view as a tab (doesn't create it, just opens it)
    openView: (viewId: string) => {
        const { openViewIds, views } = get();
        // Only open if the view exists
        if (!views.find(v => v.id === viewId)) return;

        // Add to open tabs if not already open
        const newOpenViewIds = openViewIds.includes(viewId)
            ? openViewIds
            : [...openViewIds, viewId];

        set({ openViewIds: newOpenViewIds, activeViewId: viewId, selectedNode: null, selectedEdge: null });
    },

    // Close a tab (view stays in repository)
    closeView: (viewId: string) => {
        const { openViewIds, activeViewId } = get();
        const newOpenViewIds = openViewIds.filter(id => id !== viewId);

        // If closing the active view, select another open one or null
        let newActiveId: string | null = activeViewId;
        if (activeViewId === viewId) {
            newActiveId = newOpenViewIds.length > 0 ? newOpenViewIds[0] : null;
        }

        set({ openViewIds: newOpenViewIds, activeViewId: newActiveId, selectedNode: null, selectedEdge: null });
    },

    addView: (name: string, folderId?: string) => {
        const { folders, openViewIds } = get();
        // Default to first view-folder if no folderId provided
        const defaultFolderId = folderId || folders.find(f => f.type === 'view-folder')?.id || null;

        const newView: ArchimateView = {
            id: `view_${Date.now()}`,
            name: name || 'New View',
            nodes: [],
            edges: [],
            folderId: defaultFolderId || undefined,
        };
        // Add to views AND open as a tab
        set({
            views: [...get().views, newView],
            openViewIds: [...openViewIds, newView.id],
            activeViewId: newView.id
        });
    },

    // Delete from repository (also closes the tab)
    deleteView: (viewId: string) => {
        const { views, openViewIds, activeViewId } = get();
        const newViews = views.filter(v => v.id !== viewId);
        const newOpenViewIds = openViewIds.filter(id => id !== viewId);

        // If deleting the active view, select another open one or null
        let newActiveId: string | null = activeViewId;
        if (activeViewId === viewId) {
            newActiveId = newOpenViewIds.length > 0 ? newOpenViewIds[0] : null;
        }

        set({ views: newViews, openViewIds: newOpenViewIds, activeViewId: newActiveId });
    },

    renameView: (viewId: string, name: string) => {
        set({
            views: get().views.map(v => v.id === viewId ? { ...v, name } : v)
        });
    },

    moveView: (viewId: string, folderId: string | null) => {
        set({
            views: get().views.map(v => v.id === viewId ? { ...v, folderId: folderId || undefined } : v)
        });
    },

    addFolder: (name: string, parentId: string | null, type: ArchimateFolder['type']) => {
        const newFolder: ArchimateFolder = {
            id: `folder_${Date.now()}`,
            name,
            parentId,
            type
        };
        set({ folders: [...get().folders, newFolder] });
    },

    deleteFolder: (folderId: string) => {
        // Also delete all children folders recursively and views/elements in them
        const getAllChildFolderIds = (parentId: string): string[] => {
            const children = get().folders.filter(f => f.parentId === parentId);
            return [parentId, ...children.flatMap(c => getAllChildFolderIds(c.id))];
        };
        const folderIdsToDelete = getAllChildFolderIds(folderId);
        set({
            folders: get().folders.filter(f => !folderIdsToDelete.includes(f.id)),
            views: get().views.filter(v => !v.folderId || !folderIdsToDelete.includes(v.folderId)),
            elements: get().elements.filter(e => !e.folderId || !folderIdsToDelete.includes(e.folderId))
        });
    },

    renameFolder: (folderId: string, name: string) => {
        set({
            folders: get().folders.map(f => f.id === folderId ? { ...f, name } : f)
        });
    },

    moveFolder: (folderId: string, newParentId: string | null) => {
        // Prevent moving a folder into itself or its descendants
        const getAllDescendantIds = (parentId: string): string[] => {
            const children = get().folders.filter(f => f.parentId === parentId);
            return [parentId, ...children.flatMap(c => getAllDescendantIds(c.id))];
        };
        if (newParentId && getAllDescendantIds(folderId).includes(newParentId)) {
            console.warn('Cannot move folder into itself or its descendants');
            return;
        }
        set({
            folders: get().folders.map(f => f.id === folderId ? { ...f, parentId: newParentId } : f)
        });
    },

    // Element Actions
    addElement: (name: string, type: string, folderId: string | null) => {
        const now = new Date();
        const newElement: ModelElement = {
            id: `elem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            type,
            folderId,
            description: '',
            documentation: '',
            createdAt: now,
            modifiedAt: now,
            author: 'current-user' // TODO: Get from auth context
        };
        set({ elements: [...get().elements, newElement] });
        return newElement;
    },

    deleteElement: (elementId: string) => {
        set({ elements: get().elements.filter(e => e.id !== elementId) });
    },

    renameElement: (elementId: string, name: string) => {
        const { elements, views } = get();

        // Update the repository element with new name and modifiedAt
        const updatedElements = elements.map(e =>
            e.id === elementId ? { ...e, name, modifiedAt: new Date() } : e
        );

        // Update ALL nodes across ALL views that reference this elementId
        const updatedViews = views.map(v => ({
            ...v,
            nodes: v.nodes.map(node => {
                if (node.data?.elementId === elementId) {
                    return { ...node, data: { ...node.data, label: name } };
                }
                return node;
            })
        }));

        set({ elements: updatedElements, views: updatedViews });
    },

    moveElement: (elementId: string, folderId: string | null) => {
        set({
            elements: get().elements.map(e => e.id === elementId ? { ...e, folderId } : e)
        });
    },

    updateElementProperties: (elementId: string, properties: Record<string, string>) => {
        set({
            elements: get().elements.map(e => e.id === elementId
                ? { ...e, properties: { ...e.properties, ...properties }, modifiedAt: new Date() }
                : e
            )
        });
    },

    updateElementDescription: (elementId: string, description: string) => {
        set({
            elements: get().elements.map(e => e.id === elementId
                ? { ...e, description, modifiedAt: new Date() }
                : e
            )
        });
    },

    updateElementDocumentation: (elementId: string, documentation: string) => {
        set({
            elements: get().elements.map(e => e.id === elementId
                ? { ...e, documentation, modifiedAt: new Date() }
                : e
            )
        });
    },

    // Relation Actions Implementation
    addRelation: (type: string, sourceId: string, targetId: string, folderId: string | null) => {
        const newRelation: ModelRelation = {
            id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            name: '',
            sourceId,
            targetId,
            folderId
        };
        set({ relations: [...get().relations, newRelation] });
        return newRelation;
    },

    deleteRelation: (relationId: string) => {
        set({ relations: get().relations.filter(r => r.id !== relationId) });
    },

    renameRelation: (relationId: string, name: string) => {
        set({
            relations: get().relations.map(r => r.id === relationId ? { ...r, name } : r)
        });
    },

    moveRelation: (relationId: string, folderId: string | null) => {
        set({
            relations: get().relations.map(r => r.id === relationId ? { ...r, folderId } : r)
        });
    },

    // DataBlock Actions Implementation
    addDataBlock: (name: string) => {
        const newBlock: DataBlock = {
            id: `block_${Date.now()}`,
            name,
            targetTypes: [],
            attributes: []
        };
        set({ dataBlocks: [...get().dataBlocks, newBlock] });
        return newBlock;
    },

    updateDataBlock: (id: string, updates: Partial<DataBlock>) => {
        set({
            dataBlocks: get().dataBlocks.map(b => b.id === id ? { ...b, ...updates } : b)
        });
    },

    deleteDataBlock: (id: string) => {
        set({ dataBlocks: get().dataBlocks.filter(b => b.id !== id) });
    },

    addAttributeToBlock: (blockId: string, attribute: Omit<DataBlockAttribute, 'id'>) => {
        const newAttr: DataBlockAttribute = {
            ...attribute,
            id: `attr_${Date.now()}`
        };
        set({
            dataBlocks: get().dataBlocks.map(b =>
                b.id === blockId
                    ? { ...b, attributes: [...b.attributes, newAttr] }
                    : b
            )
        });
    },

    updateBlockAttribute: (blockId: string, attributeId: string, updates: Partial<DataBlockAttribute>) => {
        set({
            dataBlocks: get().dataBlocks.map(b =>
                b.id === blockId
                    ? {
                        ...b,
                        attributes: b.attributes.map(a => a.id === attributeId ? { ...a, ...updates } : a)
                    }
                    : b
            )
        });
    },

    deleteBlockAttribute: (blockId: string, attributeId: string) => {
        set({
            dataBlocks: get().dataBlocks.map(b =>
                b.id === blockId
                    ? { ...b, attributes: b.attributes.filter(a => a.id !== attributeId) }
                    : b
            )
        });
    },


    onNodesChange: (changes: NodeChange[]) => {
        const { views, activeViewId } = get();
        const activeView = views.find(v => v.id === activeViewId);
        if (!activeView) return;

        const updatedNodes = applyNodeChanges(changes, activeView.nodes);
        const updatedViews = views.map(v => v.id === activeViewId ? { ...v, nodes: updatedNodes } : v);

        set(state => {
            const selected = updatedNodes.find(n => n.selected) || null;
            let newSelectedObject = state.selectedObject;

            if (selected) {
                if (selected.data?.elementId) {
                    newSelectedObject = { type: 'element', id: selected.data.elementId as string };
                } else {
                    // Node not linked to an element (e.g. note), still valid selection but no repo object
                    newSelectedObject = null;
                }
            } else if (!state.selectedEdge) {
                // If nothing selected (and no edge selected), clear object selection?
                // Or maybe keep it if it was a folder/view? 
                // Let's clear it to match canvas "deselect all" behavior
                newSelectedObject = null;
            }

            return {
                views: updatedViews,
                selectedNode: selected,
                selectedEdge: selected ? null : state.selectedEdge,
                selectedObject: selected ? newSelectedObject : (state.selectedEdge ? state.selectedObject : null)
            };
        });
    },

    onEdgesChange: (changes: EdgeChange[]) => {
        const { views, activeViewId } = get();
        const activeView = views.find(v => v.id === activeViewId);
        if (!activeView) return;

        const updatedEdges = applyEdgeChanges(changes, activeView.edges);
        const updatedViews = views.map(v => v.id === activeViewId ? { ...v, edges: updatedEdges } : v);

        set(state => {
            const selected = updatedEdges.find(e => e.selected) || null;
            return {
                views: updatedViews,
                selectedEdge: selected,
                selectedNode: selected ? null : state.selectedNode
            };
        });
    },

    onConnect: (connection: Connection) => {
        const { views, activeViewId } = get();
        const activeView = views.find(v => v.id === activeViewId);
        if (!activeView) return;

        const updatedViews = views.map(v => v.id === activeViewId ? { ...v, edges: addEdge(connection, activeView.edges) } : v);
        set({ views: updatedViews });
    },

    setNodes: (nodes: Node[]) => {
        const updatedViews = get().views.map(v => v.id === get().activeViewId ? { ...v, nodes } : v);
        set({ views: updatedViews });
    },

    setEdges: (edges: Edge[]) => {
        const updatedViews = get().views.map(v => v.id === get().activeViewId ? { ...v, edges } : v);
        set({ views: updatedViews });
    },

    addNode: (node: Node) => {
        const { views, activeViewId } = get();
        const updatedViews = views.map(v => v.id === activeViewId ? { ...v, nodes: [...v.nodes, node] } : v);
        set({ views: updatedViews });
    },

    setSelectedNode: (node: Node | null) => set({ selectedNode: node }),
    setSelectedEdge: (edge: Edge | null) => set({ selectedEdge: edge }),

    updateNodeData: (nodeId: string, data: Record<string, unknown>) => {
        const { views, activeViewId, elements } = get();

        // Find the node to get its elementId
        const activeView = views.find(v => v.id === activeViewId);
        const targetNode = activeView?.nodes.find(n => n.id === nodeId);
        const elementId = targetNode?.data?.elementId as string | undefined;

        // If label is being updated and node is linked to an element, update the element AND all nodes referencing it
        let updatedElements = elements;
        let finalViews = views;

        if (data.label && elementId) {
            // Update the repository element with new name and modifiedAt
            updatedElements = elements.map(e =>
                e.id === elementId ? { ...e, name: data.label as string, modifiedAt: new Date() } : e
            );

            // Update ALL nodes across ALL views that reference this elementId
            finalViews = views.map(v => ({
                ...v,
                nodes: v.nodes.map(node => {
                    if (node.data?.elementId === elementId) {
                        // Sync label and description from the shared element
                        return { ...node, data: { ...node.data, label: data.label } };
                    }
                    return node;
                })
            }));

            // Also apply other data changes to the specific node
            finalViews = finalViews.map(v => {
                if (v.id === activeViewId) {
                    return {
                        ...v,
                        nodes: v.nodes.map(node =>
                            node.id === nodeId
                                ? { ...node, data: { ...node.data, ...data } }
                                : node
                        )
                    };
                }
                return v;
            });
        } else {
            // No label change, just update the specific node's data
            finalViews = views.map(v => {
                if (v.id === activeViewId) {
                    return {
                        ...v,
                        nodes: v.nodes.map(node => node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node)
                    };
                }
                return v;
            });
        }

        set({ views: finalViews, elements: updatedElements });
    },

    updateEdgeData: (edgeId: string, data: Record<string, unknown>) => {
        const { views, activeViewId } = get();
        const updatedViews = views.map(v => {
            if (v.id === activeViewId) {
                return {
                    ...v,
                    edges: v.edges.map(edge => edge.id === edgeId ? { ...edge, data: { ...edge.data, ...data } } : edge)
                };
            }
            return v;
        });
        set({ views: updatedViews });
    },

    deleteNode: (nodeId: string) => {
        const { views, activeViewId, selectedNode } = get();
        const updatedViews = views.map(v => {
            if (v.id === activeViewId) {
                return {
                    ...v,
                    nodes: v.nodes.filter(node => node.id !== nodeId),
                    edges: v.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId)
                };
            }
            return v;
        });
        set({
            views: updatedViews,
            selectedNode: selectedNode?.id === nodeId ? null : selectedNode
        });
    },

    deleteEdge: (edgeId: string) => {
        const { views, activeViewId, selectedEdge } = get();
        const updatedViews = views.map(v => {
            if (v.id === activeViewId) {
                return {
                    ...v,
                    edges: v.edges.filter(edge => edge.id !== edgeId)
                };
            }
            return v;
        });
        set({
            views: updatedViews,
            selectedEdge: selectedEdge?.id === edgeId ? null : selectedEdge
        });
    },

    inferRelations: () => {
        const { views, activeViewId } = get();
        const activeView = views.find(v => v.id === activeViewId);
        if (!activeView) return;

        const newEdges: Edge[] = [...activeView.edges];

        // 1. Structural relationships from nesting: Parent -> Child
        for (const node of activeView.nodes) {
            if (node.parentId) {
                const parent = activeView.nodes.find(n => n.id === node.parentId);
                if (parent) {
                    const existing = newEdges.find(e => e.source === parent.id && e.target === node.id);
                    if (!existing) {
                        // Default to composition for nesting if parent is group, otherwise aggregation or serving
                        const type: RelationshipType = parent.data.type === 'group' ? 'composition' : 'aggregation';
                        newEdges.push({
                            id: `nesting_${parent.id}_${node.id}`,
                            source: parent.id,
                            target: node.id,
                            type: 'archimate',
                            data: { type, isDerived: true, isNesting: true },
                            style: { stroke: '#999', strokeDasharray: '5,5', opacity: 0.5 },
                            selected: false
                        });
                    }
                }
            }
        }

        // 2. Simple triple-based derivation: A -> B -> C => A -> C
        for (const edge1 of [...newEdges]) {
            for (const edge2 of [...newEdges]) {
                if (edge1.target === edge2.source && edge1.source !== edge2.target) {
                    const rel1 = edge1.data?.type as RelationshipType;
                    const rel2 = edge2.data?.type as RelationshipType;

                    if (rel1 && rel2) {
                        const derivedType = getDerivedRelationship(rel1, rel2);
                        const existing = newEdges.find(e => e.source === edge1.source && e.target === edge2.target);

                        if (!existing && edge1.source !== edge2.target) {
                            newEdges.push({
                                id: `derived_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                source: edge1.source,
                                target: edge2.target,
                                type: 'archimate',
                                animated: true,
                                data: { type: derivedType, isDerived: true },
                                style: { stroke: '#3366ff', opacity: 0.6 }
                            });
                        }
                    }
                }
            }
        }

        if (newEdges.length > activeView.edges.length) {
            const updatedViews = views.map(v => v.id === activeViewId ? { ...v, edges: newEdges } : v);
            set({ views: updatedViews });
        }
    },

    updateNodeParent: (nodeId: string, parentId: string | null, position?: { x: number, y: number }) => {
        const { views, activeViewId } = get();
        const updatedViews = views.map(v => {
            if (v.id === activeViewId) {
                return {
                    ...v,
                    nodes: v.nodes.map(node => {
                        if (node.id === nodeId) {
                            return {
                                ...node,
                                parentId: parentId || undefined,
                                extent: (parentId ? 'parent' : undefined) as 'parent' | undefined,
                                position: position || node.position
                            };
                        }
                        return node;
                    })
                };
            }
            return v;
        });
        set({ views: updatedViews });
    },

    saveToServer: async () => {
        const { folders, views, elements, relations, currentPackageId, isSaving } = get();
        if (isSaving || !currentPackageId) return;

        set({ isSaving: true });
        try {
            // Save folders, views, elements, and relations to the database
            await saveRepositoryState(currentPackageId, folders, views, elements, relations);
            console.log("Successfully synced with server.");
        } catch (err) {
            console.error("Failed to sync with server:", err);
        } finally {
            set({ isSaving: false });
        }
    },
}));

// Temporal/undo-redo is temporarily disabled due to SSR hydration issues with React 19
// This stub hook provides no-op functions for compatibility
export const useTemporalStore = () => {
    return {
        undo: () => { console.log('Undo temporarily disabled'); },
        redo: () => { console.log('Redo temporarily disabled'); },
        pastStates: [],
        futureStates: [],
    };
};

