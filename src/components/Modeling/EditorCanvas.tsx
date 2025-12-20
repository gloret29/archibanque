'use client';

import React, { useCallback, useRef, useState, useMemo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    useReactFlow,
    ReactFlowProvider,
    Connection,
    Edge,
    Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEditorStore } from '@/store/useEditorStore';
import ArchimateNode from './ArchimateNode';
import ArchimateEdge from './ArchimateEdge';
import { getValidRelationships, ARCHIMATE_RELATIONS, RelationshipType } from '@/lib/metamodel';

const ArchimateMarkers = () => (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0 }}>
        <defs>
            {/* Arrowheads */}
            <marker id="arrowhead-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="#333" strokeWidth="2" />
            </marker>
            <marker id="arrowhead-triangle" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 Z" fill="white" stroke="#333" strokeWidth="1" />
            </marker>
            <marker id="arrowhead-filled-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10" fill="#333" />
            </marker>
            <marker id="arrowhead-filled-triangle" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 Z" fill="#333" />
            </marker>
            {/* Start Markers */}
            <marker id="marker-diamond" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 5 L 5 0 L 10 5 L 5 10 Z" fill="#333" />
            </marker>
            <marker id="marker-open-diamond" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 5 L 5 0 L 10 5 L 5 10 Z" fill="white" stroke="#333" strokeWidth="1" />
            </marker>
            <marker id="marker-circle" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <circle cx="5" cy="5" r="4" fill="white" stroke="#333" strokeWidth="1" />
            </marker>
        </defs>
    </svg>
);

const nodeTypes = {
    archimate: ArchimateNode,
};

const edgeTypes = {
    archimate: ArchimateEdge,
};

function EditorCanvasInner() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [connMenu, setConnMenu] = useState<{ x: number, y: number, params: Connection, options: RelationshipType[] } | null>(null);

    // Get active view data
    const {
        views, activeViewId,
        onNodesChange, onEdgesChange,
        setEdges, addNode,
        deleteNode, deleteEdge,
        updateNodeParent,
        selectedNode, selectedEdge
    } = useEditorStore();

    const activeView = useMemo(() => views.find(v => v.id === activeViewId), [views, activeViewId]);
    const nodes = useMemo(() => activeView?.nodes || [], [activeView]);
    const edges = useMemo(() => activeView?.edges || [], [activeView]);

    const { screenToFlowPosition } = useReactFlow();

    const createEdge = useCallback((params: Connection, type: RelationshipType) => {
        const newEdge: Edge = {
            ...params,
            id: `edge_${Date.now()}`,
            type: 'archimate',
            data: { type },
            selected: true,
        };
        setEdges([...edges, newEdge]);
        setConnMenu(null);
    }, [edges, setEdges]);

    const onConnect = useCallback((params: Connection) => {
        const sourceNode = nodes.find(n => n.id === params.source);
        const targetNode = nodes.find(n => n.id === params.target);
        if (!sourceNode || !targetNode || sourceNode.id === targetNode.id) return;

        const validRel = getValidRelationships(sourceNode.data.type as string, targetNode.data.type as string);

        if (validRel.length === 0) {
            console.warn("No valid ArchiMate relationship found between these types.");
            return;
        }

        if (validRel.length === 1) {
            createEdge(params, validRel[0]);
        } else {
            setConnMenu({
                x: (sourceNode.position.x + targetNode.position.x) / 2 + 100,
                y: (sourceNode.position.y + targetNode.position.y) / 2,
                params,
                options: validRel
            });
        }
    }, [nodes, createEdge]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const type = event.dataTransfer.getData('application/reactflow');
            if (!type) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: `node_${Date.now()}`,
                type: 'archimate',
                position,
                data: { label: `New ${type.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}`, type: type },
            };

            addNode(newNode);
        },
        [screenToFlowPosition, addNode]
    );

    const onNodeDragStop = useCallback((_: React.MouseEvent, draggedNode: Node) => {
        // 1. Get absolute position of the dragged node
        const absolutePos = { ...draggedNode.position };
        if (draggedNode.parentId) {
            const parent = nodes.find(n => n.id === draggedNode.parentId);
            if (parent) {
                absolutePos.x += parent.position.x;
                absolutePos.y += parent.position.y;
            }
        }

        // 2. Find a new parent at this absolute position
        const targetNode = nodes.find(
            (n) =>
                n.id !== draggedNode.id &&
                n.parentId !== draggedNode.id && // Don't drop on own child
                absolutePos.x >= n.position.x &&
                absolutePos.x <= n.position.x + (n.measured?.width ?? 200) &&
                absolutePos.y >= n.position.y &&
                absolutePos.y <= n.position.y + (n.measured?.height ?? 100)
        );

        if (targetNode && targetNode.id !== draggedNode.parentId) {
            // Nest inside new target
            const relativePos = {
                x: absolutePos.x - targetNode.position.x,
                y: absolutePos.y - targetNode.position.y
            };
            updateNodeParent(draggedNode.id, targetNode.id, relativePos);
        } else if (!targetNode && draggedNode.parentId) {
            // Un-nest
            updateNodeParent(draggedNode.id, null, absolutePos);
        }
    }, [nodes, updateNodeParent]);

    const onKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Delete' || event.key === 'Backspace') {
            if (selectedNode) {
                deleteNode(selectedNode.id);
            } else if (selectedEdge) {
                deleteEdge(selectedEdge.id);
            }
        }
    }, [selectedNode, selectedEdge, deleteNode, deleteEdge]);

    return (
        <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%', position: 'relative' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeDragStop={onNodeDragStop}
                onKeyDown={onKeyDown}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                snapToGrid
                snapGrid={[15, 15]}
            >
                <Background variant={BackgroundVariant.Lines} gap={30} size={1} color="#f0f0f0" />
                <Controls />
                <MiniMap />
                <ArchimateMarkers />

                {connMenu && (
                    <div
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 1000,
                            background: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '6px',
                            padding: '12px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                            minWidth: '180px'
                        }}
                    >
                        <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '10px', color: '#3366ff', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
                            SELECT RELATIONSHIP
                        </div>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {connMenu.options.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => createEdge(connMenu.params, opt)}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '8px 10px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        borderRadius: '4px',
                                        transition: 'background 0.2s',
                                        fontWeight: 500,
                                        color: '#333'
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#edf2ff')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                                >
                                    {ARCHIMATE_RELATIONS[opt].name}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setConnMenu(null)}
                            style={{ width: '100%', marginTop: '12px', fontSize: '11px', color: '#888', background: '#f5f5f5', border: '1px solid #eee', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </ReactFlow>
        </div>
    );
}

export default function EditorCanvas() {
    return (
        <ReactFlowProvider>
            <EditorCanvasInner />
        </ReactFlowProvider>
    );
}
