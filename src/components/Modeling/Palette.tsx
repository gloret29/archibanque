'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { ARCHIMATE_METAMODEL, ArchimateLayer } from '@/lib/metamodel';
import { useTheme } from '@/contexts/ThemeContext';
import { SymbolShape } from './SymbolShape';
import styles from './palette.module.css';

// Helper function to determine if a color is light or dark
const isLightColor = (color: string): boolean => {
    // Remove # if present
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
};

const Palette = () => {
    const { enabledElementTypes } = useEditorStore();
    const { theme } = useTheme();

    // Get text color and style based on background color for optimal contrast
    const getTextStyle = (backgroundColor: string): { color: string; textShadow?: string; fontWeight?: number } => {
        // Ensure valid hex color
        if (!backgroundColor || !backgroundColor.startsWith('#')) {
            return { color: 'var(--foreground)', fontWeight: 600 };
        }

        const isLight = isLightColor(backgroundColor);

        // For ArchiMate standard colors (which are mostly light/pastel), 
        // we ALWAYS want dark text for readability, regardless of the app theme.
        // The Dark Mode generally affects the panel background, not the element fill color.

        if (isLight) {
            // Light background (ArchiMate standard): Always use black/dark text
            return {
                color: '#000000', // Always pure black for maximum contrast on pastel colors
                textShadow: 'none', // Remove shadow to keeps it clean
                fontWeight: 600 // Semi-bold
            };
        } else {
            // Dark background (custom or specific elements): Use white text
            return {
                color: '#ffffff',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                fontWeight: 700
            };
        }
    };

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const layers: ArchimateLayer[] = ['strategy', 'business', 'application', 'technology', 'physical', 'motivation', 'implementation', 'other'];

    return (
        <div className={styles.palette} style={{ background: 'var(--background)', transition: 'background-color 0.2s' }}>
            <div className={styles.paletteContent} style={{ background: 'var(--background)', transition: 'background-color 0.2s' }}>
                {layers.map(layer => {
                    const layerItems = Object.values(ARCHIMATE_METAMODEL)
                        .filter(item => item.layer === layer && enabledElementTypes.includes(item.id));

                    if (layerItems.length === 0) return null;

                    return (
                        <div key={layer} className={styles.layerSection}>
                            <h4 className={styles.layerTitle}>{layer}</h4>
                            <div className={styles.elementList}>
                                {layerItems.map(item => {
                                    const textStyle = getTextStyle(item.color);
                                    return (
                                        <div
                                            key={item.id}
                                            className={styles.paletteItem}
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: textStyle.color,
                                                fontWeight: textStyle.fontWeight || 600,
                                                textShadow: textStyle.textShadow || 'none',
                                                WebkitFontSmoothing: 'antialiased',
                                                MozOsxFontSmoothing: 'grayscale',
                                                position: 'relative',
                                                border: 'none', // Shape has its own border
                                                boxShadow: 'none',
                                                padding: '0'
                                            }}
                                            onDragStart={(event) => onDragStart(event, item.id)}
                                            draggable
                                        >
                                            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                                                <SymbolShape
                                                    type={item.id}
                                                    bgColor={item.color}
                                                    textColor={textStyle.color}
                                                    hideDecorator={true}
                                                />
                                            </div>
                                            <span style={{
                                                position: 'relative',
                                                zIndex: 2,
                                                flex: 1,
                                                textAlign: 'center',
                                                padding: '4px 8px',
                                                fontSize: '10px',
                                                wordBreak: 'break-word'
                                            }}>
                                                {item.name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{
                padding: '10px',
                borderTop: `1px solid var(--border)`,
                marginTop: 'auto',
                transition: 'border-color 0.2s'
            }}>
                <Link href="/admin" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    backgroundColor: theme === 'dark' ? 'var(--background)' : '#f5f5f5',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    color: 'var(--foreground)',
                    fontSize: '12px',
                    fontWeight: 500,
                    transition: 'background-color 0.2s, color 0.2s'
                }}>
                    <Settings size={14} style={{ marginRight: '6px' }} />
                    Admin Settings
                </Link>
            </div>
        </div>
    );
};

export default Palette;
