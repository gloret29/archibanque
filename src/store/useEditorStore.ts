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

export interface ArchimateView {
    id: string;
    name: string;
    nodes: Node[];
    edges: Edge[];
}

export interface ArchimateFolder {
    id: string;
    name: string;
    parentId: string | null;
    type: 'folder' | 'view-folder' | 'element-folder';
}

interface EditorState {
    // Repository
    folders: ArchimateFolder[];
    views: ArchimateView[];

    // UI State
    activeViewId: string;
    selectedNode: Node | null;
    selectedEdge: Edge | null;

    // Actions
    setActiveView: (viewId: string) => void;
    addView: (name: string) => void;
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

export const useEditorStore = create<EditorState>()(
    temporal((set, get) => ({
        folders: initialFolders,
        views: [initialView],
        activeViewId: initialViewId,
        selectedNode: null,
        selectedEdge: null,

        setActiveView: (viewId: string) => set({ activeViewId: viewId, selectedNode: null, selectedEdge: null }),

        addView: (name: string) => {
            const newView: ArchimateView = {
                id: `view_${Date.now()}`,
                name: name || 'New View',
                nodes: [],
                edges: [],
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
    })))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useTemporalStore = () => useEditorStore((state) => (state as any).temporal || {
    undo: () => { },
    redo: () => { },
    pastStates: [],
    futureStates: [],
})
