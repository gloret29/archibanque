'use client';

import React from 'react';
import { BaseEdge, EdgeProps, getSmoothStepPath, EdgeLabelRenderer, useInternalNode, getBezierPath } from '@xyflow/react';
import { ARCHIMATE_RELATIONS, RelationshipType } from '@/lib/metamodel';
import { getEdgeParams } from '@/lib/floating-edges';

import { useTheme } from '../../contexts/ThemeContext';

export default function ArchimateEdge({
    id,
    source,
    target,
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

    // Get nodes to calculate floating positions
    const sourceNode = useInternalNode(source);
    const targetNode = useInternalNode(target);

    // If we have nodes, calculate dynamic params
    let sx = sourceX, sy = sourceY, tx = targetX, ty = targetY;
    let sp = sourcePosition, tp = targetPosition;

    if (sourceNode && targetNode) {
        const params = getEdgeParams(sourceNode, targetNode);
        sx = params.sx; sy = params.sy; tx = params.tx; ty = params.ty;
        sp = params.sp; tp = params.tp;
        // console.log(`Edge ${id} recalculated: ${sp} -> ${tp}`);
    }

    // Using SmoothStep path for the classic ArchiMate look
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX: sx,
        sourceY: sy,
        sourcePosition: sp,
        targetX: tx,
        targetY: ty,
        targetPosition: tp,
        borderRadius: 16,
    });

    const relationType = (data?.type as RelationshipType) || 'association';
    const meta = ARCHIMATE_RELATIONS[relationType] || ARCHIMATE_RELATIONS['association'];

    const edgeColor = theme === 'dark' ? '#e4e4e7' : '#18181b';

    const edgeStyle: React.CSSProperties = {
        ...style,
        strokeWidth: 2,
        stroke: edgeColor,
        strokeDasharray: meta.lineStyle === 'dashed' ? '5,5' : meta.lineStyle === 'dotted' ? '2,2' : 'none',
    };

    // Compute markers based on metadata
    const computedMarkerEnd = meta.arrowHead !== 'none' ? `url(#arrowhead-${meta.arrowHead}-${theme})` : undefined;
    const computedMarkerStart = meta.startMarker ? `url(#marker-${meta.startMarker}-${theme})` : undefined;

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
