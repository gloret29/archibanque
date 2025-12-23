'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { ARCHIMATE_METAMODEL } from '@/lib/metamodel';
import { SymbolShape } from './SymbolShape';

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
    colorOverride?: string;
    labelOverride?: string;
}

const ArchimateNode = ({ data, selected }: NodeProps) => {
    const nodeData = data as unknown as NodeData;
    const typeKey = nodeData.type || 'business-process';
    const meta = ARCHIMATE_METAMODEL[typeKey] || { name: 'Unknown', color: '#fff', id: '' };

    // Helper function to determine if a color is light or dark
    const isLightColor = (color: string): boolean => {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5;
    };

    const bgColor = nodeData.colorOverride || `var(--archimate-${meta.layer})`;
    const textColor = nodeData.colorOverride
        ? (isLightColor(nodeData.colorOverride) ? '#1a1a1a' : '#ffffff')
        : `var(--archimate-${meta.layer}-text)`;
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
                borderRadius: '0',
                background: 'transparent',
                color: textColor,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
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
                    background: 'var(--background, white)',
                    border: '2px solid var(--primary, #3366ff)',
                    borderRadius: '3px'
                }}
                lineStyle={{
                    borderWidth: '1px',
                    borderColor: 'var(--primary, #3366ff)'
                }}
            />

            {/* ArchiMate SVG Shape */}
            <SymbolShape
                type={typeKey}
                bgColor={bgColor}
                textColor={textColor}
                width="100%"
                height="100%"
                decoratorSize={40}
            />

            {/* Selection Highlight - Follows the rectangular bounds of the node */}
            {selected && (
                <div style={{
                    position: 'absolute',
                    top: -2,
                    left: -2,
                    right: -2,
                    bottom: -2,
                    border: '2px solid var(--primary, #3366ff)',
                    borderRadius: '4px',
                    pointerEvents: 'none',
                    zIndex: 1,
                    boxShadow: '0 0 10px rgba(51, 102, 255, 0.3)'
                }} />
            )}

            {/* Single central handle for floating edges */}
            <Handle
                type="target"
                position={Position.Top}
                id="target"
                style={{ top: '50%', left: '50%', opacity: 0, pointerEvents: 'auto', width: '100%', height: '100%', borderRadius: 0 }}
            />
            <Handle
                type="source"
                position={Position.Top}
                id="source"
                style={{ top: '50%', left: '50%', opacity: 0, pointerEvents: 'auto', width: '100%', height: '100%', borderRadius: 0 }}
            />

            {/* Label area - Overlaid on the SVG shape */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                flex: 1,
                padding: isGroup ? '12px 10px 8px' : '8px 10px',
                textAlign: textAlign,
                fontWeight: fontWeight as 'normal' | 'bold' | '400' | '600',
                fontStyle: fontStyle as 'normal' | 'italic',
                textDecoration: textDecoration,
                fontFamily: fontFamily,
                fontSize: `${fontSize}px`,
                lineHeight: '1.2',
                wordBreak: 'break-word',
                display: 'flex',
                alignItems: isGroup ? 'flex-start' : 'center',
                justifyContent: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center',
                flexDirection: 'column',
                pointerEvents: 'none'
            }}>
                <div style={{ pointerEvents: 'auto' }}>{nodeData.label}</div>
                {nodeData.labelOverride && (
                    <div style={{ fontSize: '0.85em', opacity: 0.9, marginTop: '2px', whiteSpace: 'pre-line' }}>
                        {nodeData.labelOverride}
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(ArchimateNode);
