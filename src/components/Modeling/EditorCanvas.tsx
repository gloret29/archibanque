'use client';

import React, { useMemo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEditorStore } from '@/store/useEditorStore';

export default function EditorCanvas() {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useEditorStore();

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
            >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
}
