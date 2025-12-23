'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface SymbolIconProps {
    type: string;
    textColor?: string;
    size?: number;
    opacity?: number;
}

export const SymbolIcon = ({ type, textColor, size = 14, opacity = 0.8 }: SymbolIconProps) => {
    const [hasError, setHasError] = React.useState(false);
    const { theme } = useTheme();

    // Map some types to their SVG filenames if they differ
    const fileNameMap: Record<string, string> = {
        'group': 'grouping',
        'access': 'acces',
        'and-junction': 'and-junction',
        'or-junction': 'or-junction',
        'junction': 'and-junction',
        'value-stream': 'business-process',
    };

    const fileName = fileNameMap[type] || type;
    const symbolPath = `/symbols/archimate/${fileName}.svg`;

    // Fallback when SVG is missing
    if (hasError) {
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
                filter: (theme === 'dark' || textColor === '#ffffff') ? 'invert(1) brightness(1.5)' : 'none'
            }}
            onError={() => setHasError(true)}
        />
    );
};
