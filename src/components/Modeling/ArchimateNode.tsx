'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { ARCHIMATE_METAMODEL } from '@/lib/metamodel';

const getSymbol = (type: string) => {
    switch (type) {
        case 'business-process':
            return (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.7 }}>
                    <path d="M2 8h12m-3-3l3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'application-component':
            return (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.7 }}>
                    <rect x="2" y="4" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
                    <rect x="0" y="6" width="3" height="2" fill="white" stroke="currentColor" strokeWidth="1" />
                    <rect x="0" y="9" width="3" height="2" fill="white" stroke="currentColor" strokeWidth="1" />
                </svg>
            );
        case 'data-object':
            return (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.7 }}>
                    <path d="M3 3h10v10H3z" stroke="currentColor" strokeWidth="2" />
                    <path d="M3 6h10" stroke="currentColor" strokeWidth="1" />
                </svg>
            );
        case 'group':
            return (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.7 }}>
                    <path d="M2 4h4l2-2h6v10H2V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
            );
        case 'business-actor':
            return (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.7 }}>
                    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 14c0-3 2.5-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            );
        case 'business-role':
            return (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.7 }}>
                    <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="8" cy="8" r="2" fill="currentColor" />
                </svg>
            );
        case 'application-service':
        case 'business-service':
            return (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.7 }}>
                    <rect x="2" y="4" width="12" height="8" rx="4" stroke="currentColor" strokeWidth="1.5" />
                </svg>
            );
        default:
            return null;
    }
};

interface NodeData {
    label: string;
    type: string;
    description?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    textAlign?: string;
    width?: number;
    height?: number;
}

const ArchimateNode = ({ data, selected }: NodeProps) => {
    const nodeData = data as unknown as NodeData;
    const typeKey = nodeData.type || 'business-process';
    const meta = ARCHIMATE_METAMODEL[typeKey] || { name: 'Unknown', color: '#fff', id: '' };
    const isGroup = typeKey === 'group';

    // Get style properties with defaults
    const fontSize = nodeData.fontSize || 12;
    const fontFamily = nodeData.fontFamily || 'Inter, sans-serif';
    const fontWeight = nodeData.fontWeight || '600';
    const fontStyle = nodeData.fontStyle || 'normal';
    const textDecoration = nodeData.textDecoration || 'none';
    const textAlign = (nodeData.textAlign as 'left' | 'center' | 'right') || 'center';

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                padding: '0',
                borderRadius: isGroup ? '0' : '3px',
                background: isGroup ? 'rgba(0,0,0,0.02)' : meta.color,
                border: selected ? '2px solid #3366ff' : (isGroup ? '1px dashed rgba(0,0,0,0.3)' : '1px solid rgba(0,0,0,0.15)'),
                minWidth: '100px',
                minHeight: '60px',
                boxShadow: selected ? '0 0 10px rgba(51, 102, 255, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
                color: '#1a1a1a',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.2s ease-in-out'
            }}
        >
            <NodeResizer
                minWidth={isGroup ? 200 : 100}
                minHeight={isGroup ? 150 : 50}
                isVisible={selected}
                lineClassName="border-blue-400"
                handleClassName="h-3 w-3 bg-white border-2 border-blue-400 rounded"
                handleStyle={{
                    width: '10px',
                    height: '10px',
                    background: 'white',
                    border: '2px solid #3366ff',
                    borderRadius: '3px'
                }}
                lineStyle={{
                    borderWidth: '1px',
                    borderColor: '#3366ff'
                }}
            />
            <Handle type="target" position={Position.Top} style={{ background: '#555', width: '6px', height: '6px', opacity: isGroup ? 0 : 1 }} />

            {/* Header / Type area */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 6px',
                background: 'rgba(255,255,255,0.25)',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                flexShrink: 0
            }}>
                <span style={{ fontSize: '9px', opacity: 0.7, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {meta.name}
                </span>
                {getSymbol(meta.id)}
            </div>

            {/* Label area - applies custom styles */}
            <div style={{
                flex: 1,
                padding: '8px 10px',
                textAlign: textAlign,
                fontWeight: fontWeight as 'normal' | 'bold' | '400' | '600',
                fontStyle: fontStyle as 'normal' | 'italic',
                textDecoration: textDecoration,
                fontFamily: fontFamily,
                fontSize: `${fontSize}px`,
                lineHeight: '1.3',
                wordBreak: 'break-word',
                display: 'flex',
                alignItems: 'center',
                justifyContent: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center'
            }}>
                {nodeData.label}
            </div>

            <Handle type="source" position={Position.Bottom} style={{ background: '#555', width: '6px', height: '6px', opacity: isGroup ? 0 : 1 }} />
            <Handle type="source" position={Position.Left} id="left" style={{ background: '#3366ff', border: '1px solid white', width: '8px', height: '8px', left: '-4px', opacity: isGroup ? 0 : 1 }} />
            <Handle type="source" position={Position.Right} id="right" style={{ background: '#3366ff', border: '1px solid white', width: '8px', height: '8px', right: '-4px', opacity: isGroup ? 0 : 1 }} />
        </div>
    );
};

export default memo(ArchimateNode);
