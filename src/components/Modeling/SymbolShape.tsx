'use client';

import React, { useEffect, useState } from 'react';

interface SymbolShapeProps {
    type: string;
    bgColor: string;
    textColor: string;
    width: number | string;
    height: number | string;
}

export const SymbolShape = ({ type, bgColor, textColor, width, height }: SymbolShapeProps) => {
    const [parts, setParts] = useState<{ bg: string, decorator: string | null } | null>(null);

    useEffect(() => {
        const loadSvg = async () => {
            try {
                // Map some types to their SVG filenames if they differ
                const fileNameMap: Record<string, string> = {
                    'group': 'grouping',
                    'access': 'acces',
                    'and-junction': 'and-junction',
                    'or-junction': 'or-junction',
                };

                const fileName = fileNameMap[type] || type;
                const response = await fetch(`/symbols/archimate/${fileName}.svg`);
                if (!response.ok) throw new Error('Not found');
                const text = await response.text();

                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'image/svg+xml');
                const svg = doc.querySelector('svg');

                if (svg) {
                    // Clean up
                    svg.querySelectorAll('text').forEach(t => t.remove());
                    svg.querySelectorAll('title').forEach(t => t.remove());

                    const originalWidthStr = svg.getAttribute('width') || '100';
                    const originalHeightStr = svg.getAttribute('height') || '100';
                    const originalWidth = parseFloat(originalWidthStr.replace(/[^\d.]/g, ''));
                    const originalHeight = parseFloat(originalHeightStr.replace(/[^\d.]/g, ''));

                    if (!svg.getAttribute('viewBox')) {
                        svg.setAttribute('viewBox', `0 0 ${originalWidth} ${originalHeight}`);
                    }

                    // Identify background vs decorator
                    const children = Array.from(svg.children);
                    const isJunction = type.includes('junction');

                    // Create Background SVG
                    const bgSvg = svg.cloneNode(false) as SVGElement;
                    bgSvg.setAttribute('preserveAspectRatio', 'none');
                    bgSvg.setAttribute('width', '100%');
                    bgSvg.setAttribute('height', '100%');

                    // Create Decorator SVG
                    const decSvg = svg.cloneNode(false) as SVGElement;
                    decSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                    decSvg.setAttribute('width', '100%');
                    decSvg.setAttribute('height', '100%');

                    children.forEach((child, index) => {
                        const clone = child.cloneNode(true) as HTMLElement;

                        // Apply colors
                        clone.querySelectorAll('path').forEach(p => {
                            if (index === 0) { // Main background path
                                p.style.fill = bgColor;
                            } else {
                                if (p.getAttribute('stroke') || p.style.stroke || p.getAttribute('fill') === 'none') {
                                    p.style.stroke = textColor;
                                }
                                if (p.getAttribute('fill') === '#000000' || p.style.fill === '#000000' || p.style.fill === 'rgb(0, 0, 0)') {
                                    p.style.fill = textColor;
                                }
                            }
                        });

                        if (child.tagName.toLowerCase() === 'path') {
                            const p = clone as unknown as SVGPathElement;
                            if (index === 0) p.style.fill = bgColor;
                            else if (p.getAttribute('stroke') || p.style.stroke) p.style.stroke = textColor;
                        }

                        if (index < 2 || isJunction) {
                            bgSvg.appendChild(clone);
                        } else {
                            decSvg.appendChild(clone);
                        }
                    });

                    setParts({
                        bg: bgSvg.outerHTML,
                        decorator: children.length > 2 && !isJunction ? decSvg.outerHTML : null
                    });
                }
            } catch (err) {
                console.error(`Failed to load ArchiMate symbol: ${type}`, err);
                setParts(null);
            }
        };

        loadSvg();
    }, [type, bgColor, textColor]);

    if (!parts) {
        return (
            <div style={{
                width: '100%', height: '100%', background: bgColor,
                border: `1px solid ${textColor}44`, borderRadius: '2px'
            }} />
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}>
            {/* Background Shape - Stretched */}
            <div
                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                dangerouslySetInnerHTML={{ __html: parts.bg }}
            />
            {/* Decorator Icon - Fixed Aspect Ratio, Top Right */}
            {parts.decorator && (
                <div
                    style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '32px',
                        height: '32px',
                        zIndex: 1,
                        opacity: 0.8
                    }}
                    dangerouslySetInnerHTML={{ __html: parts.decorator }}
                />
            )}
        </div>
    );
};
