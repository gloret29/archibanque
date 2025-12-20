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
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    addNode: (node: Node) => void;
    setSelectedNode: (node: Node | null) => void;
    deleteNode: (nodeId: string) => void;
}

export const useEditorStore = create<EditorState>()(
    temporal((set, get) => ({
        nodes: [],
        edges: [],
        selectedNode: null,
        onNodesChange: (changes: NodeChange[]) => {
            const nodes = applyNodeChanges(changes, get().nodes);
            set({ nodes });

            // Update selectedNode if it was changed or removed
            const selected = nodes.find(n => n.selected) || null;
            set({ selectedNode: selected });
        },
        onEdgesChange: (changes: EdgeChange[]) => {
            set({
                edges: applyEdgeChanges(changes, get().edges),
            });
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
        deleteNode: (nodeId: string) => {
            set({
                nodes: get().nodes.filter((node) => node.id !== nodeId),
                edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
                selectedNode: get().selectedNode?.id === nodeId ? null : get().selectedNode,
            });
        },
    })))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useTemporalStore = () => useEditorStore((state) => (state as any).temporal)
