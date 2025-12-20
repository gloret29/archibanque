'use client';

import React, { useCallback, useRef } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    useReactFlow,
    ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEditorStore } from '@/store/useEditorStore';
import ArchimateNode from './ArchimateNode';
import ArchimateEdge from './ArchimateEdge';

const nodeTypes = {
    archimate: ArchimateNode,
};

const edgeTypes = {
    archimate: ArchimateEdge,
};

function EditorCanvasInner() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { nodes, edges, onNodesChange, onEdgesChange, setEdges, addNode, deleteNode, deleteEdge, selectedNode, selectedEdge } = useEditorStore();
    const { screenToFlowPosition } = useReactFlow();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onConnect = useCallback((params: any) => {
        const newEdge = {
            ...params,
            id: `edge_${Date.now()}`,
            type: 'archimate',
            data: { type: 'association' }, // Default to association
        };
        setEdges([...edges, newEdge]);
    }, [edges, setEdges]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: `node_${Date.now()}`,
                type: 'archimate',
                position,
                data: { label: `New ${type}`, type: type },
            };

            addNode(newNode);
        },
        [screenToFlowPosition, addNode]
    );

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
        <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onKeyDown={onKeyDown}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
            >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
                <Controls />
                <MiniMap />
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
