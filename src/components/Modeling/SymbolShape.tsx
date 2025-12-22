'use client';

import React, { useEffect, useState } from 'react';

interface SymbolShapeProps {
    type: string;
    bgColor: string;
    textColor: string;
    width: number | string;
    height: number | string;
}

export const SymbolShape = ({ type, bgColor, textColor }: SymbolShapeProps) => {
    const [parts, setParts] = useState<{ bg: string, decorator: string | null, viewBox: string } | null>(null);

    useEffect(() => {
        const loadSvg = async () => {
            try {
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
                    // Remove text and tiles
                    svg.querySelectorAll('text').forEach(t => t.remove());
                    svg.querySelectorAll('title').forEach(t => t.remove());

                    const sw = svg.getAttribute('width') || '100';
                    const sh = svg.getAttribute('height') || '100';
                    const originalWidth = parseFloat(sw.replace(/[^\d.]/g, ''));
                    const originalHeight = parseFloat(sh.replace(/[^\d.]/g, ''));
                    const viewBox = svg.getAttribute('viewBox') || `0 0 ${originalWidth} ${originalHeight}`;

                    // Extract elements from potentially wrapped structure
                    let elements: Element[] = Array.from(svg.children);
                    const wrapperG = elements.find(e => e.tagName.toLowerCase() === 'g' && e.getAttribute('transform')?.includes('scale'));
                    if (wrapperG) {
                        elements = Array.from(wrapperG.children);
                    }

                    const isJunction = type.includes('junction');
                    const bgElements: Element[] = [];
                    const decElements: Element[] = [];

                    // NEW ROBUST HEURISTIC:
                    // In these specific Visio-converted SVGs:
                    // Index 0: Main background fill
                    // Index 1: Main background stroke (usually a <g>)
                    // Index 2+: Decorator icons
                    elements.forEach((el, index) => {
                        if (index < 2 || isJunction) {
                            bgElements.push(el);
                        } else {
                            decElements.push(el);
                        }
                    });

                    const colorize = (node: Element, isBg: boolean) => {
                        const paths = node.tagName.toLowerCase() === 'path' ? [node] : Array.from(node.querySelectorAll('path'));
                        paths.forEach(p => {
                            const path = p as SVGPathElement;
                            if (isBg && isBgPath(path)) {
                                path.style.fill = bgColor;
                            } else {
                                // Apply text color to all lines/fills of the icon/border
                                if (path.getAttribute('stroke') || path.style.stroke || path.getAttribute('fill') === 'none') {
                                    path.style.stroke = textColor;
                                }
                                const f = path.getAttribute('fill') || path.style.fill;
                                if (f === '#000000' || f === 'black' || f === 'rgb(0, 0, 0)') {
                                    path.style.fill = textColor;
                                }
                            }
                        });
                    };

                    const isBgPath = (p: SVGPathElement) => {
                        const fill = p.getAttribute('fill');
                        return fill && fill !== 'none' && fill !== '#000000' && fill !== 'black';
                    };

                    const bgContent = bgElements.map(el => {
                        const clone = el.cloneNode(true) as HTMLElement;
                        colorize(clone, true);
                        return clone.outerHTML;
                    }).join('');

                    const decContent = decElements.length > 0 ? decElements.map(el => {
                        const clone = el.cloneNode(true) as HTMLElement;
                        colorize(clone, false);
                        return clone.outerHTML;
                    }).join('') : null;

                    setParts({
                        bg: bgContent,
                        decorator: decContent,
                        viewBox
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
            <div style={{ width: '100%', height: '100%', background: bgColor, border: `1px solid ${textColor}44`, borderRadius: '2px' }} />
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}>
            {/* Background Layer - Stretched to fit container */}
            <svg
                viewBox={parts.viewBox}
                preserveAspectRatio="none"
                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                dangerouslySetInnerHTML={{ __html: parts.bg }}
            />

            {/* Decorator Layer - Proportional and small in the top-right corner */}
            {parts.decorator && (
                <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '64px',
                    height: '40px',
                    zIndex: 1
                }}>
                    <svg
                        viewBox={parts.viewBox}
                        preserveAspectRatio="xMaxYMin meet"
                        style={{ width: '100%', height: '100%' }}
                        dangerouslySetInnerHTML={{ __html: parts.decorator }}
                    />
                </div>
            )}
        </div>
    );
};
