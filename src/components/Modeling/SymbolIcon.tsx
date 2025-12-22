'use client';

import React from 'react';

interface SymbolIconProps {
    type: string;
    textColor?: string;
    size?: number;
    opacity?: number;
}

export const SymbolIcon = ({ type, textColor, size = 14, opacity = 0.8 }: SymbolIconProps) => {
    const [hasError, setHasError] = React.useState(false);
    const symbolPath = `/symbols/archimate/${type}.svg`;

    // Fallback for special types or when SVG is missing
    if (type === 'group' || hasError) {
        if (type === 'group') {
            return (
                <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ opacity }}>
                    <path d="M2 4h4l2-2h6v10H2V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
            );
        }
        return null;
    }

    return (
        <img
            src={symbolPath}
            alt={type}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                objectFit: 'contain',
                opacity,
                filter: textColor === '#ffffff' ? 'invert(0)' : 'none'
            }}
            onError={() => setHasError(true)}
        />
    );
};
