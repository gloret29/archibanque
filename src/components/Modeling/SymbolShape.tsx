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
    const [svgContent, setSvgContent] = useState<string | null>(null);

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

                    // Handle viewBox if missing or based on original attributes
                    const originalWidth = svg.getAttribute('width');
                    const originalHeight = svg.getAttribute('height');
                    if (!svg.getAttribute('viewBox') && originalWidth && originalHeight) {
                        svg.setAttribute('viewBox', `0 0 ${originalWidth.replace(/[^\d.]/g, '')} ${originalHeight.replace(/[^\d.]/g, '')}`);
                    }

                    // Set attributes for scaling
                    svg.setAttribute('width', '100%');
                    svg.setAttribute('height', '100%');
                    svg.setAttribute('preserveAspectRatio', 'none'); // Stretch to fit node

                    // Apply colors
                    const paths = svg.querySelectorAll('path');

                    // The first path is usually the background
                    if (paths.length > 0) {
                        paths[0].style.fill = bgColor;
                    }

                    // Update strokes of other elements to match text color for visibility
                    svg.querySelectorAll('path').forEach((p, index) => {
                        if (index === 0) return; // Skip background

                        // If it has a stroke, update it
                        if (p.getAttribute('stroke') || p.style.stroke) {
                            p.style.stroke = textColor;
                        }
                        // If it has a fill (the symbol icon part), usually it should be the text color or a variant
                        if (p.getAttribute('fill') === '#000000' || p.style.fill === '#000000' || p.style.fill === 'rgb(0, 0, 0)') {
                            p.style.fill = textColor;
                        }
                    });

                    setSvgContent(svg.outerHTML);
                }
            } catch (err) {
                console.error(`Failed to load ArchiMate symbol: ${type}`, err);
                setSvgContent(null);
            }
        };

        loadSvg();
    }, [type, bgColor, textColor]);

    if (!svgContent) {
        return (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    background: bgColor,
                    border: `1px solid ${textColor}44`,
                    borderRadius: '2px'
                }}
            />
        );
    }

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 0
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
};
