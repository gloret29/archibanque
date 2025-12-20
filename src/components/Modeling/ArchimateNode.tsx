'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ARCHIMATE_METAMODEL } from '@/lib/metamodel';

const ArchimateNode = ({ data, selected }: NodeProps) => {
    const typeKey = (data.type as string) || 'business-process';
    const meta = ARCHIMATE_METAMODEL[typeKey] || { name: 'Unknown', color: '#fff' };

    return (
        <div
            style={{
                padding: '10px 20px',
                borderRadius: '2px',
                background: meta.color,
                border: selected ? '2px solid #3366ff' : '1px solid #999',
                minWidth: '120px',
                textAlign: 'center',
                boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#333'
            }}
        >
            <Handle type="target" position={Position.Top} style={{ background: '#555' }} />

            <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '2px', textTransform: 'uppercase' }}>
                {meta.name}
            </div>
            <div>{data.label as string}</div>

            <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
            <Handle type="source" position={Position.Left} style={{ background: '#555' }} />
            <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
        </div>
    );
};

export default memo(ArchimateNode);
