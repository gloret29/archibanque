'use client';

import React from 'react';
import { BaseEdge, EdgeProps, getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';
import { ARCHIMATE_RELATIONS, RelationshipType } from '@/lib/metamodel';

import { useTheme } from '@/contexts/ThemeContext';

export default function ArchimateEdge({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
}: EdgeProps) {
    const { theme } = useTheme();
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 10,
    });

    const relationType = (data?.type as RelationshipType) || 'association';
    const meta = ARCHIMATE_RELATIONS[relationType];

    const edgeStyle: React.CSSProperties = {
        ...style,
        strokeWidth: 2,
        // Adapt stroke color for dark mode visibility (white/light-gray vs dark-gray)
        stroke: theme === 'dark' ? '#d4d4d8' : '#333',
        strokeDasharray: meta.lineStyle === 'dashed' ? '5,5' : meta.lineStyle === 'dotted' ? '2,2' : 'none',
    };

    // Compute markers based on metadata
    const computedMarkerEnd = meta.arrowHead !== 'none' ? `url(#arrowhead-${meta.arrowHead})` : undefined;
    const computedMarkerStart = meta.startMarker ? `url(#marker-${meta.startMarker})` : undefined;

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={computedMarkerEnd}
                markerStart={computedMarkerStart}
                style={edgeStyle}
            />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        background: theme === 'dark' ? '#27272a' : '#fff',
                        color: theme === 'dark' ? '#e4e4e7' : '#000',
                        padding: '2px 5px',
                        borderRadius: '5px',
                        fontSize: '10px',
                        fontWeight: 700,
                        pointerEvents: 'all',
                        border: theme === 'dark' ? '1px solid #52525b' : '1px solid #ccc',
                    }}
                    className="nodrag nopan"
                >
                    {meta.name}
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
