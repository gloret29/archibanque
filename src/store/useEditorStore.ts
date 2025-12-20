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
import { temporal } from 'zundo';
import { RelationshipType, getDerivedRelationship } from '@/lib/metamodel';
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

interface EditorState {
    // Packages
    packages: ModelPackage[];
    currentPackageId: string | null;

    // Repository
    folders: ArchimateFolder[];
    views: ArchimateView[];

    // UI State
    activeViewId: string;
    selectedNode: Node | null;
    selectedEdge: Edge | null;

    isSaving: boolean;
    isLoading: boolean;

    // Package Actions
    setPackages: (packages: ModelPackage[]) => void;
    setCurrentPackage: (packageId: string) => void;
    addPackage: (name: string, description?: string) => ModelPackage;

    // Folder/View Actions
    setActiveView: (viewId: string) => void;
    addView: (name: string, folderId?: string) => void;
    deleteView: (viewId: string) => void;
    addFolder: (name: string, parentId: string | null, type: ArchimateFolder['type']) => void;
    deleteFolder: (folderId: string) => void;
    renameFolder: (folderId: string, name: string) => void;

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
    loadFromServer: (packageId: string, folders: ArchimateFolder[], views: ArchimateView[]) => void;
}

const initialViewId = 'view_1';
const initialView: ArchimateView = {
    id: initialViewId,
    name: 'Main View',
    nodes: [],
    edges: [],
};

const initialFolders: ArchimateFolder[] = [
    { id: 'f_root', name: 'Archisurance', parentId: null, type: 'folder' },
    { id: 'f_views', name: 'Architecture views', parentId: 'f_root', type: 'view-folder' },
];

const defaultPackage: ModelPackage = {
    id: 'default_package',
    name: 'Default Project',
    description: 'Default architecture project'
};

export const useEditorStore = create<EditorState>()(
    temporal((set, get) => ({
        packages: [defaultPackage],
        currentPackageId: 'default_package',
        folders: initialFolders,
        views: [initialView],
        activeViewId: initialViewId,
        selectedNode: null,
        selectedEdge: null,
        isSaving: false,
        isLoading: false,

        setPackages: (packages: ModelPackage[]) => set({ packages }),

        setCurrentPackage: (packageId: string) => {
            set({ currentPackageId: packageId, selectedNode: null, selectedEdge: null });
        },

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

        loadFromServer: (packageId: string, folders: ArchimateFolder[], views: ArchimateView[]) => {
            const activeViewId = views.length > 0 ? views[0].id : initialViewId;
            set({
                currentPackageId: packageId,
                folders: folders.length > 0 ? folders : initialFolders,
                views: views.length > 0 ? views : [initialView],
                activeViewId,
                selectedNode: null,
                selectedEdge: null
            });
        },

        setActiveView: (viewId: string) => set({ activeViewId: viewId, selectedNode: null, selectedEdge: null }),

        addView: (name: string, folderId?: string) => {
            const newView: ArchimateView = {
                id: `view_${Date.now()}`,
                name: name || 'New View',
                nodes: [],
                edges: [],
                folderId,
            };
            set({ views: [...get().views, newView], activeViewId: newView.id });
        },

        deleteView: (viewId: string) => {
            const views = get().views.filter(v => v.id !== viewId);
            if (views.length === 0) return;
            const activeId = get().activeViewId === viewId ? views[0].id : get().activeViewId;
            set({ views, activeViewId: activeId });
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
            set({ folders: get().folders.filter(f => f.id !== folderId) });
        },

        renameFolder: (folderId: string, name: string) => {
            set({
                folders: get().folders.map(f => f.id === folderId ? { ...f, name } : f)
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
                return {
                    views: updatedViews,
                    selectedNode: selected,
                    selectedEdge: selected ? null : state.selectedEdge
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
            const { views, activeViewId } = get();
            const updatedViews = views.map(v => {
                if (v.id === activeViewId) {
                    return {
                        ...v,
                        nodes: v.nodes.map(node => node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node)
                    };
                }
                return v;
            });
            set({ views: updatedViews });
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
            const { folders, views, currentPackageId, isSaving } = get();
            if (isSaving || !currentPackageId) return;

            set({ isSaving: true });
            try {
                // Ensure consistency: Views in ArchiMateView format
                await saveRepositoryState(currentPackageId, folders, views);
                console.log("Successfully synced with server.");
            } catch (err) {
                console.error("Failed to sync with server:", err);
            } finally {
                set({ isSaving: false });
            }
        },
    })))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useTemporalStore = () => useEditorStore((state) => (state as any).temporal || {
    undo: () => { },
    redo: () => { },
    pastStates: [],
    futureStates: [],
})
