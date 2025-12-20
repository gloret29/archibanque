'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
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
        default:
            return null;
    }
};

const ArchimateNode = ({ data, selected }: NodeProps) => {
    const typeKey = (data.type as string) || 'business-process';
    const meta = ARCHIMATE_METAMODEL[typeKey] || { name: 'Unknown', color: '#fff', id: '' };

    return (
        <div
            style={{
                padding: '0',
                borderRadius: '3px',
                background: meta.color,
                border: selected ? '2px solid #3366ff' : '1px solid rgba(0,0,0,0.15)',
                minWidth: '130px',
                boxShadow: selected ? '0 0 10px rgba(51, 102, 255, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
                fontSize: '12px',
                color: '#1a1a1a',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.2s ease-in-out'
            }}
        >
            <Handle type="target" position={Position.Top} style={{ background: '#555', width: '6px', height: '6px' }} />

            {/* Header / Type area */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 6px',
                background: 'rgba(255,255,255,0.2)',
                borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>
                <span style={{ fontSize: '9px', opacity: 0.6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {meta.name}
                </span>
                {getSymbol(meta.id)}
            </div>

            {/* Label area */}
            <div style={{
                padding: '10px 12px',
                textAlign: 'center',
                fontWeight: 600,
                lineHeight: '1.4',
                wordBreak: 'break-word',
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {data.label as string}
            </div>

            <Handle type="source" position={Position.Bottom} style={{ background: '#555', width: '6px', height: '6px' }} />
            <Handle type="source" position={Position.Left} style={{ background: '#3366ff', border: '1px solid white', width: '8px', height: '8px', left: '-4px' }} />
            <Handle type="source" position={Position.Right} style={{ background: '#3366ff', border: '1px solid white', width: '8px', height: '8px', right: '-4px' }} />
        </div>
    );
};

export default memo(ArchimateNode);
