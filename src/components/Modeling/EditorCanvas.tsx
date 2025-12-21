'use client';

import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
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
    addEdge,
    ConnectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEditorStore } from '@/store/useEditorStore';
import ArchimateNode from './ArchimateNode';
import ArchimateEdge from './ArchimateEdge';
import { getValidRelationships, ARCHIMATE_RELATIONS, RelationshipType, ARCHIMATE_METAMODEL, ArchimateLayer } from '@/lib/metamodel';
import { useTheme } from '@/contexts/ThemeContext';
import { ExportControls } from './ExportControls';

const ArchimateMarkers = ({ theme }: { theme: 'light' | 'dark' }) => {
    const strokeColor = theme === 'dark' ? '#e4e4e7' : '#333';
    const fillColor = theme === 'dark' ? '#27272a' : 'white';
    const filledColor = theme === 'dark' ? '#e4e4e7' : '#333';

    return (
        <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0 }}>
            <defs>
                {/* Arrowheads */}
                <marker id="arrowhead-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke={strokeColor} strokeWidth="2" />
                </marker>
                <marker id="arrowhead-triangle" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1" />
                </marker>
                <marker id="arrowhead-filled-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10" fill={filledColor} />
                </marker>
                <marker id="arrowhead-filled-triangle" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 Z" fill={filledColor} />
                </marker>
                {/* Start Markers */}
                <marker id="marker-diamond" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 5 L 5 0 L 10 5 L 5 10 Z" fill={filledColor} />
                </marker>
                <marker id="marker-open-diamond" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 5 L 5 0 L 10 5 L 5 10 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1" />
                </marker>
                <marker id="marker-circle" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <circle cx="5" cy="5" r="4" fill={fillColor} stroke={strokeColor} strokeWidth="1" />
                </marker>
            </defs>
        </svg>
    );
};

// Utility function to calculate optimal handles based on node positions
const getOptimalHandles = (
    sourceNode: Node,
    targetNode: Node
): { sourceHandle: string; targetHandle: string } => {
    const sourceCenterX = sourceNode.position.x + (sourceNode.measured?.width || 120) / 2;
    const sourceCenterY = sourceNode.position.y + (sourceNode.measured?.height || 60) / 2;
    const targetCenterX = targetNode.position.x + (targetNode.measured?.width || 120) / 2;
    const targetCenterY = targetNode.position.y + (targetNode.measured?.height || 60) / 2;

    const dx = targetCenterX - sourceCenterX;
    const dy = targetCenterY - sourceCenterY;

    if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal relationship
        if (dx > 0) {
            return { sourceHandle: 'right-source', targetHandle: 'left-target' };
        } else {
            return { sourceHandle: 'left-source', targetHandle: 'right-target' };
        }
    } else {
        // Vertical relationship
        if (dy > 0) {
            return { sourceHandle: 'bottom-source', targetHandle: 'top-target' };
        } else {
            return { sourceHandle: 'top-source', targetHandle: 'bottom-target' };
        }
    }
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

function EditorCanvasInner() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
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

    const activeView = useMemo(() => views.find(v => v.id === activeViewId), [views, activeViewId]);
    const rawNodes = useMemo(() => activeView?.nodes || [], [activeView]);
    const edges = useMemo(() => activeView?.edges || [], [activeView]);

    const { dataBlocks } = useEditorStore();

    // Calculate nodes with color/label overrides based on view settings (Heatmap & Label Views)
    const nodes = useMemo(() => {
        interface ColorRule {
            id: string;
            blockId?: string;
            attributeKey?: string;
            propertyKey?: string;
            operator: string;
            value: string;
            color: string;
            active: boolean;
        }

        interface LabelRule {
            id: string;
            blockId?: string;
            attributeKey?: string;
            propertyKey?: string;
            position: string;
            prefix?: string;
            suffix?: string;
            active: boolean;
        }

        const colorRules = (activeView?.viewSettings?.colorRules as unknown as ColorRule[])?.filter(r => r.active) || [];
        const labelRules = (activeView?.viewSettings?.labelRules as unknown as LabelRule[])?.filter(r => r.active) || [];

        if (colorRules.length === 0 && labelRules.length === 0) return rawNodes;

        return rawNodes.map(node => {
            const element = elements.find(e => e.id === node.data.elementId);
            if (!element) return node;

            let colorOverride: string | undefined;
            let labelOverride: string | undefined;

            // --- Apply Color Rules ---
            for (const rule of colorRules) {
                let actualValue: string | undefined;
                if (rule.blockId && rule.attributeKey) {
                    const blockData = element.properties?.[rule.blockId] as Record<string, string> | undefined;
                    actualValue = blockData?.[rule.attributeKey];
                } else if (rule.propertyKey === 'type') {
                    actualValue = element.type;
                }

                if (actualValue === undefined) continue;

                let match = false;
                const ruleVal = rule.value.toLowerCase();
                const actualValLow = String(actualValue).toLowerCase();

                switch (rule.operator) {
                    case 'equals': match = actualValLow === ruleVal; break;
                    case 'contains': match = actualValLow.includes(ruleVal); break;
                    case 'greaterThan': match = !isNaN(Number(actualValue)) && !isNaN(Number(rule.value)) && Number(actualValue) > Number(rule.value); break;
                    case 'lessThan': match = !isNaN(Number(actualValue)) && !isNaN(Number(rule.value)) && Number(actualValue) < Number(rule.value); break;
                }

                if (match) {
                    colorOverride = rule.color;
                    break;
                }
            }

            // --- Apply Label Rules ---
            // We apply all valid label rules (could be multiple if they show different info, 
            // but for simplicity let's say the first matching one wins for now, or maybe concatenate?)
            // The current UI allows multiple rules. Let's process the first matching one per attribute logic,
            // OR if multiple are constantly active (like show cost AND risk).
            // Actually, usually you want to show specific attributes.
            // Let's iterate all active label rules and *collect* the matches strings.
            const labelParts: string[] = [];

            for (const rule of labelRules) {
                let actualValue: string | undefined;
                if (rule.blockId && rule.attributeKey) {
                    const blockData = element.properties?.[rule.blockId] as Record<string, string> | undefined;
                    actualValue = blockData?.[rule.attributeKey];
                } else if (rule.propertyKey === 'type') {
                    actualValue = element.type;
                }

                // For label rules, we generally just want to SHOW the value if it exists.
                // There is no condition (operator/value) in the rule definition we added, just "which property".
                // So if value exists, we use it.
                if (actualValue) {
                    const text = `${rule.prefix || ''}${actualValue}${rule.suffix || ''}`;

                    if (rule.position === 'replace') {
                        // This is a "hard" override of the main label?
                        // Or just "replace" the override section? 
                        // Let's assume 'replace' means "Change the main label entirely" -> Wait, we cannot easily change main label without confusing user.
                        // Let's interpret 'replace' as "Show this INSTEAD of other label rules" or similar.
                        // Actually, let's treat 'replace' as "Use this text as the override content".
                        labelParts.push(text);
                    } else if (rule.position === 'append') {
                        labelParts.push(text);
                    } else if (rule.position === 'bottom') {
                        labelParts.push(text);
                    }
                }
            }

            if (labelParts.length > 0) {
                labelOverride = labelParts.join('\n');
            }

            if (colorOverride || labelOverride) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        colorOverride,
                        labelOverride
                    }
                };
            }

            return node;
        });
    }, [rawNodes, activeView?.viewSettings, elements, dataBlocks]);

    // Get folder ID from active view for placing new elements
    const activeViewFolderId = activeView?.folderId || null;

    const { screenToFlowPosition } = useReactFlow();

    // Dynamically update edge handles when nodes move
    useEffect(() => {
        if (edges.length === 0 || nodes.length === 0) return;

        let hasChanges = false;
        const updatedEdges = edges.map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);

            if (!sourceNode || !targetNode) return edge;

            const { sourceHandle, targetHandle } = getOptimalHandles(sourceNode, targetNode);

            // Only update if handles have changed
            if (edge.sourceHandle !== sourceHandle || edge.targetHandle !== targetHandle) {
                hasChanges = true;
                return {
                    ...edge,
                    sourceHandle,
                    targetHandle
                };
            }
            return edge;
        });

        // Only call setEdges if there are actual changes to prevent infinite loops
        if (hasChanges) {
            setEdges(updatedEdges);
        }
    }, [nodes]); // Only depend on nodes, not edges to avoid infinite loops

    const createEdge = useCallback((params: Connection, type: RelationshipType) => {
        const sourceNode = nodes.find(n => n.id === params.source);
        const targetNode = nodes.find(n => n.id === params.target);

        if (!sourceNode || !targetNode) return;

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

        // Calculate optimal handles based on relative positions
        const { sourceHandle, targetHandle } = getOptimalHandles(sourceNode, targetNode);

        // Create visual edge with optimized handles
        const newEdge: Edge = {
            id: `edge_${Date.now()}`,
            source: params.source!,
            target: params.target!,
            sourceHandle,
            targetHandle,
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
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeDragStop={onNodeDragStop}
                onKeyDown={onKeyDown}
                onContextMenu={onContextMenu}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                connectionMode={ConnectionMode.Loose}
                defaultEdgeOptions={{
                    type: 'archimate',
                }}
                fitView
                snapToGrid
                snapGrid={[15, 15]}
            >
                <Background
                    variant={BackgroundVariant.Lines}
                    gap={30}
                    size={1}
                    color={theme === 'dark' ? '#3f3f46' : '#e5e5e5'}
                    bgColor={theme === 'dark' ? '#1e1e1e' : '#ffffff'}
                />
                <Controls />
                <MiniMap />
                <ArchimateMarkers theme={theme} />
                <ExportControls />

                {connMenu && (
                    <div
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 1000,
                            background: 'var(--background)',
                            border: `1px solid var(--border)`,
                            borderRadius: '6px',
                            padding: '12px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                            minWidth: '180px',
                            transition: 'background-color 0.2s, border-color 0.2s'
                        }}
                    >
                        <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '10px', color: 'var(--primary)', borderBottom: `1px solid var(--border)`, paddingBottom: '6px', transition: 'color 0.2s, border-color 0.2s' }}>
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
                                        transition: 'background 0.2s, color 0.2s',
                                        fontWeight: 500,
                                        color: 'var(--foreground)'
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = theme === 'dark' ? 'var(--border)' : '#edf2ff')}
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
                                color: 'var(--foreground)',
                                opacity: 0.7,
                                background: theme === 'dark' ? 'var(--border)' : '#f5f5f5',
                                border: `1px solid var(--border)`,
                                padding: '6px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s, border-color 0.2s, color 0.2s'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </ReactFlow>

            {/* Context Menu for creating ArchiMate elements */}
            {contextMenu && (
                <div
                    style={{
                        position: 'fixed',
                        left: contextMenu.x,
                        top: contextMenu.y,
                        zIndex: 1001,
                        background: 'var(--background)',
                        border: `1px solid var(--border)`,
                        borderRadius: '8px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        minWidth: '180px',
                        padding: '4px',
                        transition: 'background-color 0.2s, border-color 0.2s'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--foreground)', opacity: 0.7, padding: '6px 12px', borderBottom: `1px solid var(--border)`, marginBottom: '4px', transition: 'color 0.2s, border-color 0.2s' }}>
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
                                    background: selectedLayer === group.layer ? (theme === 'dark' ? 'var(--border)' : '#f5f5f5') : 'transparent',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    textTransform: 'capitalize',
                                    color: 'var(--foreground)',
                                    transition: 'background-color 0.2s, color 0.2s'
                                }}
                            >
                                {group.layer}
                                <span style={{ color: 'var(--foreground)', opacity: 0.5 }}>▶</span>
                            </button>

                            {/* Submenu for layer elements */}
                            {selectedLayer === group.layer && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: '100%',
                                        top: 0,
                                        marginLeft: '4px',
                                        background: 'var(--background)',
                                        border: `1px solid var(--border)`,
                                        borderRadius: '8px',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                        minWidth: '200px',
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        padding: '4px',
                                        transition: 'background-color 0.2s, border-color 0.2s'
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
                                                color: 'var(--foreground)',
                                                transition: 'background-color 0.2s, color 0.2s'
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = theme === 'dark' ? 'var(--border)' : '#f5f5f5')}
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

export default function EditorCanvas() {
    return (
        <ReactFlowProvider>
            <EditorCanvasInner />
        </ReactFlowProvider>
    );
}
