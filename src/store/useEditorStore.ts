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

interface EditorState {
    nodes: Node[];
    edges: Edge[];
    selectedNode: Node | null;
    selectedEdge: Edge | null;
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    addNode: (node: Node) => void;
    setSelectedNode: (node: Node | null) => void;
    setSelectedEdge: (edge: Edge | null) => void;
    updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
    updateEdgeData: (edgeId: string, data: Record<string, unknown>) => void;
    deleteNode: (nodeId: string) => void;
    deleteEdge: (edgeId: string) => void;
}

export const useEditorStore = create<EditorState>()(
    temporal((set, get) => ({
        nodes: [],
        edges: [],
        selectedNode: null,
        selectedEdge: null,
        onNodesChange: (changes: NodeChange[]) => {
            const nodes = applyNodeChanges(changes, get().nodes);
            set({ nodes });

            // Update selectedNode if it was changed or removed
            const selected = nodes.find(n => n.selected) || null;
            set({ selectedNode: selected });
            if (selected) set({ selectedEdge: null });
        },
        onEdgesChange: (changes: EdgeChange[]) => {
            const edges = applyEdgeChanges(changes, get().edges);
            set({ edges });

            // Update selectedEdge if it was changed or removed
            const selected = edges.find(e => e.selected) || null;
            set({ selectedEdge: selected });
            if (selected) set({ selectedNode: null });
        },
        onConnect: (connection: Connection) => {
            set({
                edges: addEdge(connection, get().edges),
            });
        },
        setNodes: (nodes: Node[]) => set({ nodes }),
        setEdges: (edges: Edge[]) => set({ edges }),
        addNode: (node: Node) => set({ nodes: [...get().nodes, node] }),
        setSelectedNode: (node: Node | null) => set({ selectedNode: node }),
        setSelectedEdge: (edge: Edge | null) => set({ selectedEdge: edge }),
        updateNodeData: (nodeId: string, data: Record<string, unknown>) => {
            set({
                nodes: get().nodes.map((node) => node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node),
            });
        },
        updateEdgeData: (edgeId: string, data: Record<string, unknown>) => {
            set({
                edges: get().edges.map((edge) => edge.id === edgeId ? { ...edge, data: { ...edge.data, ...data } } : edge),
            });
        },
        deleteNode: (nodeId: string) => {
            set({
                nodes: get().nodes.filter((node) => node.id !== nodeId),
                edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
                selectedNode: get().selectedNode?.id === nodeId ? null : get().selectedNode,
            });
        },
        deleteEdge: (edgeId: string) => {
            set({
                edges: get().edges.filter((edge) => edge.id !== edgeId),
                selectedEdge: get().selectedEdge?.id === edgeId ? null : get().selectedEdge,
            });
        },
    })))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useTemporalStore = () => useEditorStore((state) => (state as any).temporal)
