'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { useTheme } from '@/contexts/ThemeContext';
import { Circle, Layers, Play, RotateCcw, Settings } from 'lucide-react';
import { ARCHIMATE_METAMODEL, ArchimateLayer } from '@/lib/metamodel';

interface OnionDiagramLayoutProps {
    viewId: string;
}

interface LayerConfig {
    layer: ArchimateLayer;
    ring: number; // 0 = center, 1 = first ring, etc.
    color: string;
}

const DEFAULT_LAYER_ORDER: LayerConfig[] = [
    { layer: 'strategy', ring: 0, color: '#F5E6A3' },
    { layer: 'business', ring: 1, color: '#FFFFB5' },
    { layer: 'application', ring: 2, color: '#B5FFFF' },
    { layer: 'technology', ring: 3, color: '#C9E7B7' },
    { layer: 'physical', ring: 4, color: '#C9E7B7' },
    { layer: 'motivation', ring: 5, color: '#CCCCFF' },
    { layer: 'implementation', ring: 6, color: '#FFE0D0' },
];

export default function OnionDiagramLayout({ viewId }: OnionDiagramLayoutProps) {
    const { theme } = useTheme();
    const { views, elements, updateNodePosition } = useEditorStore();
    const view = views.find(v => v.id === viewId);

    const [layerConfig, setLayerConfig] = useState<LayerConfig[]>(DEFAULT_LAYER_ORDER);
    const [centerX, setCenterX] = useState(600);
    const [centerY, setCenterY] = useState(400);
    const [ringSpacing, setRingSpacing] = useState(150);
    const [showConfig, setShowConfig] = useState(false);

    const themeColors = {
        background: theme === 'dark' ? '#27272a' : '#f8f9fa',
        border: theme === 'dark' ? '#3f3f46' : '#e5e5e5',
        text: theme === 'dark' ? '#e4e4e7' : '#1a1a1a',
        textSecondary: theme === 'dark' ? '#a1a1aa' : '#666',
        inputBg: theme === 'dark' ? '#3f3f46' : '#fff',
    };

    // Get nodes with their element types
    const nodesWithTypes = useMemo(() => {
        if (!view?.nodes) return [];

        return view.nodes.map(node => {
            const element = elements.find(e => e.id === node.data?.elementId);
            const elementType = (element?.type || node.data?.type || '') as string;
            const meta = elementType ? ARCHIMATE_METAMODEL[elementType] : undefined;
            return {
                ...node,
                elementType,
                layer: meta?.layer as ArchimateLayer | undefined
            };
        });
    }, [view?.nodes, elements]);

    // Group nodes by layer
    const nodesByLayer = useMemo(() => {
        const grouped: Record<ArchimateLayer, typeof nodesWithTypes> = {} as any;

        for (const config of layerConfig) {
            grouped[config.layer] = nodesWithTypes.filter(n => n.layer === config.layer);
        }

        return grouped;
    }, [nodesWithTypes, layerConfig]);

    // Apply onion layout
    const applyOnionLayout = useCallback(() => {
        if (!view?.nodes) return;

        let currentRing = 0;
        const processedLayers: ArchimateLayer[] = [];

        for (const config of layerConfig) {
            const layerNodes = nodesByLayer[config.layer];
            if (!layerNodes || layerNodes.length === 0) continue;

            processedLayers.push(config.layer);
            const radius = config.ring * ringSpacing + (config.ring === 0 ? 0 : ringSpacing / 2);
            const angleStep = (2 * Math.PI) / layerNodes.length;

            layerNodes.forEach((node, index) => {
                const angle = angleStep * index - Math.PI / 2; // Start from top

                let x: number, y: number;
                if (config.ring === 0) {
                    // Center element(s)
                    const centerOffset = (layerNodes.length - 1) * 60;
                    x = centerX - centerOffset / 2 + index * 60;
                    y = centerY;
                } else {
                    x = centerX + radius * Math.cos(angle);
                    y = centerY + radius * Math.sin(angle);
                }

                // Center the node on the calculated position
                const nodeWidth = node.measured?.width || 120;
                const nodeHeight = node.measured?.height || 60;

                updateNodePosition(node.id, {
                    x: x - nodeWidth / 2,
                    y: y - nodeHeight / 2
                });
            });

            currentRing++;
        }

        console.log(`✅ Applied Onion Layout to ${nodesWithTypes.length} nodes across ${processedLayers.length} layers`);
    }, [view?.nodes, layerConfig, nodesByLayer, centerX, centerY, ringSpacing, updateNodePosition, nodesWithTypes.length]);

    // Reset to default positions
    const resetLayout = useCallback(() => {
        if (!view?.nodes) return;

        view.nodes.forEach((node, index) => {
            updateNodePosition(node.id, {
                x: 100 + (index % 5) * 200,
                y: 100 + Math.floor(index / 5) * 150
            });
        });
    }, [view?.nodes, updateNodePosition]);

    // Move layer up/down in order
    const moveLayer = (index: number, direction: 'up' | 'down') => {
        const newConfig = [...layerConfig];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newConfig.length) return;

        // Swap positions
        [newConfig[index], newConfig[targetIndex]] = [newConfig[targetIndex], newConfig[index]];

        // Update ring numbers
        newConfig.forEach((config, i) => {
            config.ring = i;
        });

        setLayerConfig(newConfig);
    };

    return (
        <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: themeColors.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Circle size={16} />
                    Onion Diagram Layout
                </h4>
                <button
                    onClick={() => setShowConfig(!showConfig)}
                    style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        background: 'transparent',
                        border: `1px solid ${themeColors.border}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: themeColors.text,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    <Settings size={12} />
                    {showConfig ? 'Hide' : 'Configure'}
                </button>
            </div>

            {/* Statistics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginBottom: '16px',
                padding: '12px',
                background: themeColors.background,
                borderRadius: '8px',
                border: `1px solid ${themeColors.border}`
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3366ff' }}>{nodesWithTypes.length}</div>
                    <div style={{ fontSize: '10px', color: themeColors.textSecondary }}>Total Nodes</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
                        {Object.values(nodesByLayer).filter(arr => arr.length > 0).length}
                    </div>
                    <div style={{ fontSize: '10px', color: themeColors.textSecondary }}>Active Layers</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b' }}>{ringSpacing}px</div>
                    <div style={{ fontSize: '10px', color: themeColors.textSecondary }}>Ring Spacing</div>
                </div>
            </div>

            {/* Configuration Panel */}
            {showConfig && (
                <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    background: themeColors.background,
                    borderRadius: '8px',
                    border: `1px solid ${themeColors.border}`
                }}>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '11px', color: themeColors.textSecondary, display: 'block', marginBottom: '4px' }}>
                            Ring Spacing (px)
                        </label>
                        <input
                            type="range"
                            min="80"
                            max="250"
                            value={ringSpacing}
                            onChange={(e) => setRingSpacing(Number(e.target.value))}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                        <div>
                            <label style={{ fontSize: '11px', color: themeColors.textSecondary, display: 'block', marginBottom: '4px' }}>
                                Center X
                            </label>
                            <input
                                type="number"
                                value={centerX}
                                onChange={(e) => setCenterX(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '6px',
                                    fontSize: '12px',
                                    border: `1px solid ${themeColors.border}`,
                                    borderRadius: '4px',
                                    background: themeColors.inputBg,
                                    color: themeColors.text
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', color: themeColors.textSecondary, display: 'block', marginBottom: '4px' }}>
                                Center Y
                            </label>
                            <input
                                type="number"
                                value={centerY}
                                onChange={(e) => setCenterY(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '6px',
                                    fontSize: '12px',
                                    border: `1px solid ${themeColors.border}`,
                                    borderRadius: '4px',
                                    background: themeColors.inputBg,
                                    color: themeColors.text
                                }}
                            />
                        </div>
                    </div>

                    {/* Layer Order Configuration */}
                    <div>
                        <label style={{ fontSize: '11px', color: themeColors.textSecondary, display: 'block', marginBottom: '8px' }}>
                            Layer Order (Center → Outside)
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {layerConfig.map((config, index) => {
                                const nodeCount = nodesByLayer[config.layer]?.length || 0;
                                return (
                                    <div
                                        key={config.layer}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '6px 8px',
                                            background: nodeCount > 0 ? config.color + '40' : 'transparent',
                                            borderRadius: '4px',
                                            border: `1px solid ${nodeCount > 0 ? config.color : themeColors.border}`,
                                            opacity: nodeCount > 0 ? 1 : 0.5
                                        }}
                                    >
                                        <span style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            background: config.color,
                                            border: '1px solid rgba(0,0,0,0.2)',
                                            flexShrink: 0
                                        }} />
                                        <span style={{ flex: 1, fontSize: '11px', textTransform: 'capitalize', color: themeColors.text }}>
                                            {config.layer}
                                        </span>
                                        <span style={{ fontSize: '10px', color: themeColors.textSecondary, minWidth: '30px', textAlign: 'right' }}>
                                            {nodeCount} nodes
                                        </span>
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            <button
                                                onClick={() => moveLayer(index, 'up')}
                                                disabled={index === 0}
                                                style={{
                                                    padding: '2px 4px',
                                                    fontSize: '10px',
                                                    cursor: index === 0 ? 'not-allowed' : 'pointer',
                                                    opacity: index === 0 ? 0.3 : 1,
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: themeColors.text
                                                }}
                                            >
                                                ▲
                                            </button>
                                            <button
                                                onClick={() => moveLayer(index, 'down')}
                                                disabled={index === layerConfig.length - 1}
                                                style={{
                                                    padding: '2px 4px',
                                                    fontSize: '10px',
                                                    cursor: index === layerConfig.length - 1 ? 'not-allowed' : 'pointer',
                                                    opacity: index === layerConfig.length - 1 ? 0.3 : 1,
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: themeColors.text
                                                }}
                                            >
                                                ▼
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={applyOnionLayout}
                    disabled={nodesWithTypes.length === 0}
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: nodesWithTypes.length > 0 ? '#3366ff' : themeColors.border,
                        color: nodesWithTypes.length > 0 ? 'white' : themeColors.textSecondary,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: nodesWithTypes.length > 0 ? 'pointer' : 'not-allowed'
                    }}
                >
                    <Play size={14} />
                    Apply Onion Layout
                </button>
                <button
                    onClick={resetLayout}
                    disabled={nodesWithTypes.length === 0}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px',
                        fontSize: '12px',
                        background: 'transparent',
                        color: themeColors.text,
                        border: `1px solid ${themeColors.border}`,
                        borderRadius: '6px',
                        cursor: nodesWithTypes.length > 0 ? 'pointer' : 'not-allowed',
                        opacity: nodesWithTypes.length > 0 ? 1 : 0.5
                    }}
                >
                    <RotateCcw size={14} />
                    Reset
                </button>
            </div>

            {/* Preview hint */}
            {nodesWithTypes.length > 0 && (
                <p style={{
                    marginTop: '12px',
                    fontSize: '10px',
                    color: themeColors.textSecondary,
                    textAlign: 'center',
                    fontStyle: 'italic'
                }}>
                    Elements will be arranged in concentric circles based on their ArchiMate layer.
                </p>
            )}
        </div>
    );
}
