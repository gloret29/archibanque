'use client';

import React from 'react';
import { useReactFlow, getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toPng, toSvg, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Download, Image as ImageIcon, FileText, FileCode } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useEditorStore } from '@/store/useEditorStore';

export const ExportControls = () => {
    const { getNodes, getEdges, fitView, getViewport, setViewport } = useReactFlow();
    const { theme } = useTheme();

    const getExportData = () => {
        const nodes = getNodes();
        if (nodes.length === 0) return null;

        const bounds = getNodesBounds(nodes);
        const viewport = getViewportForBounds(bounds, bounds.width, bounds.height, 0.5, 2, 0.1);

        return { bounds, viewport };
    };

    const captureImage = async (format: 'png' | 'svg' | 'jpeg') => {
        const nodes = getNodes();
        if (nodes.length === 0) return null;

        const flowElement = document.querySelector('.react-flow__container') as HTMLElement;
        if (!flowElement) return;

        // Save current state
        const originalViewport = getViewport();

        // Temporarily hide UI elements we don't want in export
        const controls = document.querySelector('.react-flow__controls') as HTMLElement;
        const minimap = document.querySelector('.react-flow__minimap') as HTMLElement;
        const attribution = document.querySelector('.react-flow__attribution') as HTMLElement;
        const exportMenu = document.querySelector('.export-menu-group') as HTMLElement;

        if (controls) controls.style.display = 'none';
        if (minimap) minimap.style.display = 'none';
        if (attribution) attribution.style.display = 'none';
        if (exportMenu) exportMenu.style.display = 'none';

        // Fit view for export
        await fitView({ padding: 0.1, duration: 0 });

        const options = {
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
            style: {
                width: `${flowElement.offsetWidth}px`,
                height: `${flowElement.offsetHeight}px`,
            },
        };

        try {
            let result;
            switch (format) {
                case 'png':
                    result = await toPng(flowElement, options);
                    break;
                case 'svg':
                    result = await toSvg(flowElement, options);
                    break;
                case 'jpeg':
                    result = await toJpeg(flowElement, { ...options, quality: 0.95 });
                    break;
            }

            // Restore state
            if (controls) controls.style.display = 'flex';
            if (minimap) minimap.style.display = 'block';
            if (attribution) attribution.style.display = 'block';
            if (exportMenu) exportMenu.style.display = 'flex';
            setViewport(originalViewport);

            return result;
        } catch (error) {
            console.error('Export failed:', error);
            // Restore state even on error
            if (controls) controls.style.display = 'flex';
            if (minimap) minimap.style.display = 'block';
            if (attribution) attribution.style.display = 'block';
            if (exportMenu) exportMenu.style.display = 'flex';
            setViewport(originalViewport);
            return null;
        }
    };

    const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
        const { views, activeViewId } = useEditorStore.getState();
        const activeView = views.find(v => v.id === activeViewId);
        const viewName = activeView?.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'export';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const fileName = `archimate_${viewName}_${timestamp}.${format}`;

        const data = getExportData();
        if (!data) {
            alert('No content to export');
            return;
        }

        if (format === 'pdf') {
            const imgData = await captureImage('png');
            if (!imgData) return;

            const pdf = new jsPDF({
                orientation: data.bounds.width > data.bounds.height ? 'l' : 'p',
                unit: 'px',
                format: [data.bounds.width + 100, data.bounds.height + 100]
            });

            pdf.addImage(imgData, 'PNG', 50, 50, data.bounds.width, data.bounds.height);
            pdf.save(fileName);
        } else {
            const imgData = await captureImage(format === 'svg' ? 'svg' : 'png');
            if (!imgData) return;

            const link = document.createElement('a');
            link.download = fileName;
            link.href = imgData;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div style={{
            position: 'absolute',
            right: '10px',
            top: '10px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
        }}>
            <div className="export-menu-group" style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '4px',
                display: 'flex',
                gap: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <button
                    onClick={() => handleExport('png')}
                    title="Export PNG"
                    style={{
                        padding: '6px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: 'var(--foreground)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover, #f0f0f0)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <ImageIcon size={18} />
                </button>
                <button
                    onClick={() => handleExport('svg')}
                    title="Export SVG"
                    style={{
                        padding: '6px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: 'var(--foreground)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover, #f0f0f0)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <FileCode size={18} />
                </button>
                <button
                    onClick={() => handleExport('pdf')}
                    title="Export PDF"
                    style={{
                        padding: '6px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: 'var(--foreground)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover, #f0f0f0)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <FileText size={18} />
                </button>
            </div>
        </div>
    );
};
