'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

interface ResizablePanelProps {
    children: React.ReactNode;
    direction: 'horizontal' | 'vertical';
    initialSize: number;
    minSize?: number;
    maxSize?: number;
    className?: string;
    style?: React.CSSProperties;
    handlePosition?: 'start' | 'end';
}

export default function ResizablePanel({
    children,
    direction,
    initialSize,
    minSize = 150,
    maxSize = 600,
    className = '',
    style = {},
    handlePosition = 'end'
}: ResizablePanelProps) {
    const [size, setSize] = useState(initialSize);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const startPosRef = useRef(0);
    const startSizeRef = useRef(0);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
        startSizeRef.current = size;
    }, [direction, size]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
            const delta = currentPos - startPosRef.current;

            // Invert delta for 'start' position handles
            const adjustedDelta = handlePosition === 'start' ? -delta : delta;

            const newSize = Math.max(minSize, Math.min(maxSize, startSizeRef.current + adjustedDelta));
            setSize(newSize);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, direction, minSize, maxSize, handlePosition]);

    const sizeStyle = direction === 'horizontal'
        ? { width: size, minWidth: size, maxWidth: size }
        : { height: size, minHeight: size, maxHeight: size };

    const handleStyles: React.CSSProperties = direction === 'horizontal'
        ? {
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '6px',
            cursor: 'col-resize',
            zIndex: 10,
            ...(handlePosition === 'end' ? { right: 0 } : { left: 0 }),
        }
        : {
            position: 'absolute',
            left: 0,
            right: 0,
            height: '6px',
            cursor: 'row-resize',
            zIndex: 10,
            ...(handlePosition === 'end' ? { bottom: 0 } : { top: 0 }),
        };

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                ...style,
                ...sizeStyle,
                position: 'relative',
                flexShrink: 0,
            }}
        >
            {children}
            {/* Resize Handle */}
            <div
                onMouseDown={handleMouseDown}
                style={handleStyles}
            >
                {/* Visual indicator */}
                <div
                    style={{
                        position: 'absolute',
                        ...(direction === 'horizontal'
                            ? {
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '2px',
                                height: '24px',
                                borderRadius: '1px',
                            }
                            : {
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                                height: '2px',
                                width: '24px',
                                borderRadius: '1px',
                            }
                        ),
                        background: isResizing ? '#3366ff' : '#ccc',
                        transition: isResizing ? 'none' : 'background 0.15s ease',
                    }}
                />
            </div>
        </div>
    );
}
