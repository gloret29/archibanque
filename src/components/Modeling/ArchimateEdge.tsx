'use client';

import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath, EdgeLabelRenderer } from '@xyflow/react';
import { ARCHIMATE_RELATIONS, RelationshipType } from '@/lib/metamodel';

export default function ArchimateEdge({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    markerStart,
    data,
}: EdgeProps) {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const relationType = (data?.type as RelationshipType) || 'association';
    const meta = ARCHIMATE_RELATIONS[relationType];

    const edgeStyle: React.CSSProperties = {
        ...style,
        strokeWidth: 2,
        stroke: '#333',
        strokeDasharray: meta.lineStyle === 'dashed' ? '5,5' : meta.lineStyle === 'dotted' ? '2,2' : 'none',
    };

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                markerStart={markerStart}
                style={edgeStyle}
            />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        background: '#fff',
                        padding: '2px 5px',
                        borderRadius: '5px',
                        fontSize: '10px',
                        fontWeight: 700,
                        pointerEvents: 'all',
                        border: '1px solid #ccc',
                    }}
                    className="nodrag nopan"
                >
                    {meta.name}
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
