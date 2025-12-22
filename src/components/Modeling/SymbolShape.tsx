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
                    svg.querySelectorAll('text').forEach(t => t.remove());
                    svg.querySelectorAll('title').forEach(t => t.remove());

                    const sw = svg.getAttribute('width') || '100';
                    const sh = svg.getAttribute('height') || '100';
                    const originalWidth = parseFloat(sw.replace(/[^\d.]/g, ''));
                    const originalHeight = parseFloat(sh.replace(/[^\d.]/g, ''));
                    const viewBox = svg.getAttribute('viewBox') || `0 0 ${originalWidth} ${originalHeight}`;

                    // Extract elements
                    let elements: Element[] = Array.from(svg.children);
                    // Handle the common wrapper G
                    const wrapperG = elements.find(e => e.tagName.toLowerCase() === 'g' && e.getAttribute('transform')?.includes('scale'));
                    if (wrapperG) {
                        elements = Array.from(wrapperG.children);
                    }

                    const isJunction = type.includes('junction');

                    // Separate Background (Fill + Main Stroke) from Decorators
                    // Heuristic: Layer1000 or the first two paths are background.
                    // Elements with IDs starting with Layer1001+ are decorations.
                    const bgElements: Element[] = [];
                    const decElements: Element[] = [];

                    elements.forEach((el, index) => {
                        const id = el.getAttribute('id') || '';
                        // Junctions are simple shapes, no decorators
                        if (isJunction) {
                            bgElements.push(el);
                            return;
                        }

                        // Specific ArchiMate SVG structure:
                        // - index 0 is usually the background <path>
                        // - id "Layer1000" is usually the main container <g>
                        // - ids "Layer1001", "Layer1002" etc. are decorators
                        if (index === 0 || id === 'Layer1000') {
                            bgElements.push(el);
                        } else if (id.startsWith('Layer100') && id !== 'Layer1000') {
                            decElements.push(el);
                        } else if (index === 1 && !id.startsWith('Layer')) {
                            // If index 1 is not a specific layer, it's probably still part of the main shape
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
                                // Stroke coloring
                                if (path.getAttribute('stroke') || path.style.stroke || path.getAttribute('fill') === 'none') {
                                    path.style.stroke = textColor;
                                }
                                // Icon detail coloring (usually black in original)
                                const f = path.getAttribute('fill') || path.style.fill;
                                if (f === '#000000' || f === 'black' || f === 'rgb(0, 0, 0)') {
                                    path.style.fill = textColor;
                                }
                            }
                        });
                    };

                    const isBgPath = (p: SVGPathElement) => {
                        // Background paths are usually solid fills, not strokes only
                        const fill = p.getAttribute('fill');
                        return fill && fill !== 'none' && fill !== '#000000';
                    };

                    // Create Background SVG content
                    const bgContent = bgElements.map(el => {
                        const clone = el.cloneNode(true) as HTMLElement;
                        colorize(clone, true);
                        return clone.outerHTML;
                    }).join('');

                    // Create Decorator SVG content
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
            <div style={{ width: '100%', height: '100%', background: bgColor, border: `1px solid ${textColor}44` }} />
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}>
            {/* Background Shape - STRETCHED to fill node bounds */}
            <svg
                viewBox={parts.viewBox}
                preserveAspectRatio="none"
                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                dangerouslySetInnerHTML={{ __html: parts.bg }}
            />

            {/* Decorator Icon - FIXED ASPECT RATIO, constant size in top right */}
            {parts.decorator && (
                <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '40px',
                    height: '24px',
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
