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
    addEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEditorStore } from '@/store/useEditorStore';
import ArchimateNode from './ArchimateNode';
import ArchimateEdge from './ArchimateEdge';
import { getValidRelationships, ARCHIMATE_RELATIONS, RelationshipType, ARCHIMATE_METAMODEL, ArchimateLayer } from '@/lib/metamodel';
import { useTheme } from '@/contexts/ThemeContext';

const ArchimateMarkers = ({ theme }: { theme: 'light' | 'dark' }) => {
    const color = theme === 'dark' ? '#e4e4e7' : '#18181b';
    const bgColor = theme === 'dark' ? '#18181b' : '#ffffff';

    return (
        <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0 }}>
            <defs>
                {/* Arrowheads */}
                <marker id={`arrowhead-arrow-${theme}`} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke={color} strokeWidth="2" />
                </marker>
                <marker id={`arrowhead-triangle-${theme}`} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 Z" fill={bgColor} stroke={color} strokeWidth="1" />
                </marker>
                <marker id={`arrowhead-filled-arrow-${theme}`} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10" fill={color} />
                </marker>
                <marker id={`arrowhead-filled-triangle-${theme}`} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 Z" fill={color} />
                </marker>
                {/* Start Markers */}
                <marker id={`marker-diamond-${theme}`} viewBox="0 0 10 10" refX="0" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 5 L 5 0 L 10 5 L 5 10 Z" fill={color} />
                </marker>
                <marker id={`marker-open-diamond-${theme}`} viewBox="0 0 10 10" refX="0" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 5 L 5 0 L 10 5 L 5 10 Z" fill={bgColor} stroke={color} strokeWidth="1" />
                </marker>
                <marker id={`marker-circle-${theme}`} viewBox="0 0 10 10" refX="0" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <circle cx="5" cy="5" r="4" fill={bgColor} stroke={color} strokeWidth="1" />
                </marker>
            </defs>
        </svg>
    );
};

const nodeTypes = {
    archimate: ArchimateNode,
};

const edgeTypes = {
    archimate: ArchimateEdge,
};

// Context menu state type
interface CanvasContextMenu {
    x: number;
    y: number;
    flowPosition: { x: number; y: number };
}

interface EditorCanvasProps {
    readOnly?: boolean;
}

function EditorCanvasInner({ readOnly = false }: EditorCanvasProps) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [connMenu, setConnMenu] = useState<{ x: number, y: number, params: Connection, options: RelationshipType[] } | null>(null);
    const [contextMenu, setContextMenu] = useState<CanvasContextMenu | null>(null);
    const [selectedLayer, setSelectedLayer] = useState<ArchimateLayer | null>(null);

    // Get active view data
    const {
        views, activeViewId,
        onNodesChange, onEdgesChange,
        setEdges, addNode, addElement,
        deleteNode, deleteEdge,
        updateNodeParent,
        selectedNode, selectedEdge,
        enabledElementTypes,
        addRelation,
        relations,
        elements
    } = useEditorStore();

    const { theme } = useTheme();

    const activeView = useMemo(() => views.find(v => v.id === activeViewId), [views, activeViewId]);
    const nodes = useMemo(() => activeView?.nodes || [], [activeView]);

    // Crucial: Map edges to ensure they ALL use the 'archimate' custom component
    // even if they were saved without the 'type' field in the DB.
    const edges = useMemo(() => {
        const rawEdges = activeView?.edges || [];
        return rawEdges.map(edge => ({
            ...edge,
            type: 'archimate'
        }));
    }, [activeView]);

    // Get folder ID from active view for placing new elements
    const activeViewFolderId = activeView?.folderId || null;

    const { screenToFlowPosition } = useReactFlow();

    const createEdge = useCallback((params: Connection, type: RelationshipType) => {
        const sourceNode = nodes.find(n => n.id === params.source);
        const targetNode = nodes.find(n => n.id === params.target);

        let relationId: string | undefined;

        // Create model relation if both nodes are linked to repository elements
        if (sourceNode?.data?.elementId && targetNode?.data?.elementId) {
            const rel = addRelation(
                type,
                sourceNode.data.elementId as string,
                targetNode.data.elementId as string,
                activeViewFolderId
            );
            relationId = rel.id;
        }

        // Create visual edge
        const newEdge: Edge = {
            id: `edge_${Date.now()}`,
            source: params.source!,
            target: params.target!,
            type: 'archimate',
            data: { type, relationId },
            selected: true,
        };
        setEdges(addEdge(newEdge, edges));

        setConnMenu(null);
    }, [edges, setEdges, nodes, addRelation, activeViewFolderId]);

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

            const paletteType = event.dataTransfer.getData('application/reactflow');
            const modelBrowserElementId = event.dataTransfer.getData('application/archi-element');

            if (!paletteType && !modelBrowserElementId) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            let label = "";
            let type = "";
            let elementId = "";

            if (modelBrowserElementId) {
                // Dragging from Model Browser (Existing Element)
                const existingElement = elements.find(e => e.id === modelBrowserElementId);
                if (!existingElement) return;

                label = existingElement.name;
                type = existingElement.type;
                elementId = existingElement.id;
            } else {
                // Dragging from Palette (New Element)
                type = paletteType;
                label = `New ${type.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}`;
                const newElement = addElement(label, type, activeViewFolderId);
                elementId = newElement.id;
            }

            // Create Canvas Node linked to Element
            const newNode = {
                id: `node_${Date.now()}`,
                type: 'archimate',
                position,
                data: {
                    label,
                    type,
                    elementId // Link to repository
                },
            };

            addNode(newNode);
        },
        [screenToFlowPosition, addNode, addElement, activeViewFolderId, elements]
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
        // Close context menu on Escape
        if (event.key === 'Escape') {
            setContextMenu(null);
            setSelectedLayer(null);
        }
    }, [selectedNode, selectedEdge, deleteNode, deleteEdge]);

    // Right-click context menu handler
    const onContextMenu = useCallback((event: React.MouseEvent) => {
        event.preventDefault();
        const flowPosition = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });
        setContextMenu({ x: event.clientX, y: event.clientY, flowPosition });
        setSelectedLayer(null);
    }, [screenToFlowPosition]);

    // Create element from context menu - adds to both canvas and repository
    const createElementFromMenu = useCallback((type: string) => {
        if (!contextMenu) return;

        const meta = ARCHIMATE_METAMODEL[type];
        const label = `New ${meta?.name || type}`;

        // 1. Add to repository (same folder as active view)
        const newElement = addElement(label, type, activeViewFolderId);

        // 2. Add node to canvas
        const newNode = {
            id: `node_${Date.now()}`,
            type: 'archimate',
            position: contextMenu.flowPosition,
            data: {
                label,
                type,
                elementId: newElement.id // Link to repository
            },
        };
        addNode(newNode);

        // Close menu
        setContextMenu(null);
        setSelectedLayer(null);
    }, [contextMenu, addElement, addNode, activeViewFolderId]);

    // Group elements by layer for context menu (filtered by enabled types)
    const elementsByLayer = useMemo(() => {
        const layers: ArchimateLayer[] = ['strategy', 'business', 'application', 'technology', 'physical', 'motivation', 'implementation', 'other'];
        return layers.map(layer => ({
            layer,
            items: Object.values(ARCHIMATE_METAMODEL)
                .filter(item => item.layer === layer && enabledElementTypes.includes(item.id))
        })).filter(group => group.items.length > 0);
    }, [enabledElementTypes]);

    return (
        <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%', position: 'relative' }} onClick={() => { setContextMenu(null); setSelectedLayer(null); }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={readOnly ? undefined : onNodesChange}
                onEdgesChange={readOnly ? undefined : onEdgesChange}
                onConnect={readOnly ? undefined : onConnect}
                onDrop={readOnly ? undefined : onDrop}
                onDragOver={readOnly ? undefined : onDragOver}
                onNodeDragStop={readOnly ? undefined : onNodeDragStop}
                onKeyDown={readOnly ? undefined : onKeyDown}
                onContextMenu={readOnly ? undefined : onContextMenu}
                nodesDraggable={!readOnly}
                nodesConnectable={!readOnly}
                elementsSelectable={true}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={{ type: 'archimate' }}
                fitView
                snapToGrid
                snapGrid={[15, 15]}
            >
                <Background
                    variant={BackgroundVariant.Lines}
                    gap={30}
                    size={1}
                    color={theme === 'dark' ? '#27272a' : '#f0f0f0'}
                />
                <Controls />
                <MiniMap />
                {connMenu && (
                    <div
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 1000,
                            background: 'var(--background, white)',
                            border: '1px solid var(--border, #ccc)',
                            borderRadius: '8px',
                            padding: '15px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                            minWidth: '180px'
                        }}
                    >
                        <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '10px', color: 'var(--primary, #3366ff)', borderBottom: '1px solid var(--border, #eee)', paddingBottom: '6px' }}>
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
                                        color: 'var(--foreground, #333)'
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--user-menu-item-hover, #edf2ff)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                                >
                                    {ARCHIMATE_RELATIONS[opt].name}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setConnMenu(null)}
                            style={{
                                width: '100%',
                                marginTop: '12px',
                                fontSize: '11px',
                                color: 'var(--foreground-secondary, #888)',
                                background: 'var(--header-bg, #f5f5f5)',
                                border: '1px solid var(--border, #eee)',
                                padding: '6px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </ReactFlow>

            <ArchimateMarkers theme={theme} />

            {/* Context Menu for creating ArchiMate elements */}
            {contextMenu && (
                <div
                    style={{
                        position: 'fixed',
                        left: contextMenu.x,
                        top: contextMenu.y,
                        zIndex: 1001,
                        background: 'var(--background, white)',
                        border: '1px solid var(--border, #e0e0e0)',
                        borderRadius: '8px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        minWidth: '180px',
                        padding: '4px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--foreground-secondary, #888)', padding: '6px 12px', borderBottom: '1px solid var(--border, #eee)', marginBottom: '4px' }}>
                        CREATE ELEMENT
                    </div>
                    {elementsByLayer.map(group => (
                        <div key={group.layer} style={{ position: 'relative' }}>
                            <button
                                onMouseEnter={() => setSelectedLayer(group.layer)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: 'none',
                                    background: selectedLayer === group.layer ? 'var(--user-menu-item-hover, #f5f5f5)' : 'transparent',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    color: 'var(--foreground)',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {group.layer}
                                <span style={{ color: '#aaa' }}>▶</span>
                            </button>

                            {/* Submenu for layer elements */}
                            {selectedLayer === group.layer && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: '100%',
                                        top: 0,
                                        marginLeft: '4px',
                                        background: 'white',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '8px',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                        minWidth: '200px',
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        padding: '4px'
                                    }}
                                >
                                    {group.items.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => createElementFromMenu(item.id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                width: '100%',
                                                padding: '6px 10px',
                                                border: 'none',
                                                background: 'transparent',
                                                fontSize: '11px',
                                                cursor: 'pointer',
                                                borderRadius: '4px',
                                                textAlign: 'left',
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: item.color }} />
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
    );
}

export default function EditorCanvas({ readOnly = false }: EditorCanvasProps) {
    return (
        <ReactFlowProvider>
            <EditorCanvasInner readOnly={readOnly} />
        </ReactFlowProvider>
    );
}
