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
                    svg.setAttribute('viewBox', viewBox);

                    // Robust element extraction: look into the first <g> if it's a wrapper
                    let elements: Element[] = Array.from(svg.children);
                    if (elements.length === 1 && elements[0].tagName.toLowerCase() === 'g') {
                        elements = Array.from(elements[0].children);
                    } else if (elements.length > 1) {
                        const wrapperG = elements.find(e => e.tagName.toLowerCase() === 'g' && e.getAttribute('transform')?.includes('scale'));
                        if (wrapperG) elements = Array.from(wrapperG.children);
                    }

                    const isJunction = type.includes('junction');

                    const bgSvg = svg.cloneNode(false) as SVGElement;
                    bgSvg.setAttribute('preserveAspectRatio', 'none');
                    bgSvg.setAttribute('width', '100%');
                    bgSvg.setAttribute('height', '100%');

                    const decSvg = svg.cloneNode(false) as SVGElement;
                    decSvg.setAttribute('preserveAspectRatio', 'xMaxYMin meet');
                    decSvg.setAttribute('width', '100%');
                    decSvg.setAttribute('height', '100%');

                    elements.forEach((el, index) => {
                        const clone = el.cloneNode(true) as HTMLElement;

                        const colorize = (node: HTMLElement, isBg: boolean) => {
                            const paths = node.tagName.toLowerCase() === 'path' ? [node] : Array.from(node.querySelectorAll('path'));
                            paths.forEach(p => {
                                if (isBg) {
                                    p.style.fill = bgColor;
                                } else {
                                    if (p.getAttribute('stroke') || p.style.stroke || p.getAttribute('fill') === 'none') {
                                        p.style.stroke = textColor;
                                    }
                                    const f = p.getAttribute('fill') || p.style.fill;
                                    if (f === '#000000' || f === 'black' || f === 'rgb(0,0,0)') {
                                        p.style.fill = textColor;
                                    }
                                }
                            });
                        };

                        if (index === 0) { // Background Fill
                            colorize(clone, true);
                            bgSvg.appendChild(clone);
                        } else if (index === 1 || isJunction) { // Background Stroke
                            colorize(clone, false);
                            bgSvg.appendChild(clone);
                        } else { // Decorator
                            colorize(clone, false);
                            decSvg.appendChild(clone);
                        }
                    });

                    setParts({
                        bg: bgSvg.outerHTML,
                        decorator: elements.length > 2 && !isJunction ? decSvg.outerHTML : null
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
            {/* Background - STRETCHED */}
            <div
                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                dangerouslySetInnerHTML={{ __html: parts.bg }}
            />
            {/* Decorator - PROPORTIONAL (Fixed aspect ratio, aligned top-right) */}
            {parts.decorator && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 1,
                        padding: '4px' // Padding to keep icon away from extreme edges
                    }}
                    dangerouslySetInnerHTML={{ __html: parts.decorator }}
                />
            )}
        </div>
    );
};
