'use client';

import React, { useState, useMemo } from 'react';
import { useEditorStore, DataBlock, DataBlockAttribute, AttributeType } from '@/store/useEditorStore';
import { ARCHIMATE_METAMODEL, ARCHIMATE_RELATIONS, RelationshipType } from '@/lib/metamodel';
import styles from '@/app/modeler/modeler.module.css';
import { useTheme } from '@/contexts/ThemeContext';
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Type,
    Maximize2,
    Palette,
    Database
} from 'lucide-react';

// Font options
const FONT_FAMILIES = [
    { value: 'Inter, sans-serif', label: 'Inter' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Courier New, monospace', label: 'Courier' },
    { value: 'Times New Roman, serif', label: 'Times' },
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32];

const PropertiesPanel = () => {
    const { theme } = useTheme();
    const [activeSection, setActiveSection] = useState<'properties' | 'style'>('properties');

    const [localName, setLocalName] = useState('');
    const [localDescription, setLocalDescription] = useState('');
    const [localDocumentation, setLocalDocumentation] = useState('');

    // Theme-aware colors using CSS variables
    const themeColors = {
        background: 'var(--background)',
        backgroundSecondary: theme === 'dark' ? 'var(--background)' : '#f8f9fa',
        border: 'var(--border)',
        borderLight: 'var(--border)',
        text: 'var(--foreground)',
        textSecondary: 'var(--foreground)',
        textTertiary: 'var(--foreground)',
        textQuaternary: 'var(--foreground)',
        inputBg: 'var(--background)',
        inputBorder: 'var(--border)',
    };

    const {
        selectedNode, selectedEdge, selectedObject,
        deleteNode, deleteEdge,
        updateNodeData, updateEdgeData,
        elements, views, relations, activeViewId,
        updateElementDescription, updateElementDocumentation,
        updateViewDescription, updateViewDocumentation,
        updateRelationDescription, updateRelationDocumentation,
        updateElementProperties, updateRelationProperties,
        renameElement, renameView, renameRelation,
        dataBlocks
    } = useEditorStore();

    // Determine the subject of editing
    // Priority: 1. Selected Object (Repo/Browser), 2. Selected Node/Edge (Canvas), 3. Active View (Canvas Background)

    const repoElement = selectedObject?.type === 'element'
        ? elements.find(e => e.id === selectedObject.id)
        : (selectedNode?.data?.elementId ? elements.find(e => e.id === selectedNode.data.elementId) : null);

    const repoView = selectedObject?.type === 'view'
        ? views.find(v => v.id === selectedObject.id)
        : (!selectedObject && !selectedNode && !selectedEdge && activeViewId ? views.find(v => v.id === activeViewId) : null);

    let repoRelation = selectedObject?.type === 'relation'
        ? relations.find(r => r.id === selectedObject.id)
        : null;

    // Fallback: Try to find implicit relation from selectedEdge if not explicitly linked
    if (!repoRelation && selectedEdge && activeViewId) {
        const activeView = views.find(v => v.id === activeViewId);
        if (activeView) {
            const sourceNode = activeView.nodes.find(n => n.id === selectedEdge.source);
            const targetNode = activeView.nodes.find(n => n.id === selectedEdge.target);
            const type = selectedEdge.data?.type as string;

            if (sourceNode?.data?.elementId && targetNode?.data?.elementId && type) {
                // Find matching relation in repository
                repoRelation = relations.find(r =>
                    r.sourceId === sourceNode.data.elementId &&
                    r.targetId === targetNode.data.elementId &&
                    r.type === type
                ) || null;
            }
        }
    }

    // Helper to check if we are editing a visual node (for Style tab)
    const isVisualNode = !!selectedNode;

    // Find eligible DataBlocks for the current object type
    const eligibleDataBlocks = useMemo(() => {
        if (!repoElement && !repoRelation) return [];
        
        const objectType = repoElement ? repoElement.type : (repoRelation ? repoRelation.type : null);
        if (!objectType) {
            console.log('[DataBlocks] No object type found');
            return [];
        }

        console.log('[DataBlocks] Checking for type:', objectType);
        console.log('[DataBlocks] Available dataBlocks:', dataBlocks.length);
        console.log('[DataBlocks] DataBlocks details:', dataBlocks.map(b => ({ id: b.id, name: b.name, targetTypes: b.targetTypes })));

        const eligible = dataBlocks.filter(block => {
            const isEligible = block.targetTypes.includes(objectType);
            console.log(`[DataBlocks] Block "${block.name}" (targetTypes: ${block.targetTypes.join(', ')}) for type "${objectType}": ${isEligible}`);
            return isEligible;
        });

        console.log('[DataBlocks] Eligible blocks found:', eligible.length);
        return eligible;
    }, [repoElement?.type, repoRelation?.type, dataBlocks]);

    // Get current properties for DataBlocks
    const getDataBlockValues = (block: DataBlock): Record<string, string> => {
        const repoObject = repoElement || repoRelation;
        if (!repoObject || !repoObject.properties) return {};
        
        const blockData = repoObject.properties[block.id] as Record<string, string> | undefined;
        return blockData || {};
    };

    // Update DataBlock attribute value
    const updateDataBlockValue = (block: DataBlock, attributeKey: string, value: string) => {
        const repoObject = repoElement || repoRelation;
        if (!repoObject) return;

        const currentValues = getDataBlockValues(block);
        const updatedValues = { ...currentValues, [attributeKey]: value };
        
        const newProperties = {
            ...(repoObject.properties || {}),
            [block.id]: updatedValues
        };

        if (repoElement) {
            updateElementProperties(repoElement.id, newProperties);
        } else if (repoRelation) {
            updateRelationProperties(repoRelation.id, newProperties);
        }
    };

    // Sync local state based on what is selected
    React.useEffect(() => {
        if (repoElement) {
            setLocalName(repoElement.name || '');
            setLocalDescription(repoElement.description || '');
            setLocalDocumentation(repoElement.documentation || '');
        } else if (repoView) {
            setLocalName(repoView.name || '');
            setLocalDescription(repoView.description || '');
            setLocalDocumentation(repoView.documentation || '');
        } else if (repoRelation) {
            setLocalName(repoRelation.name || '');
            setLocalDescription(repoRelation.description || '');
            setLocalDocumentation(repoRelation.documentation || '');
        } else if (selectedNode) {
            // Node without repo element (e.g. Note)
            setLocalName((selectedNode.data.label as string) || '');
            setLocalDescription((selectedNode.data.description as string) || '');
            setLocalDocumentation('');
        }
    }, [repoElement?.id, repoElement?.modifiedAt, repoView?.id, repoView?.modifiedAt, repoRelation?.id, repoRelation?.modifiedAt, selectedNode?.id]);

    const handleNameSubmit = () => {
        if (repoElement && localName !== repoElement.name) {
            renameElement(repoElement.id, localName);
        } else if (repoView && localName !== repoView.name) {
            renameView(repoView.id, localName);
        } else if (repoRelation && localName !== repoRelation.name) {
            renameRelation(repoRelation.id, localName);
        } else if (selectedNode && !repoElement && localName !== selectedNode.data.label) {
            updateNodeData(selectedNode.id, { label: localName });
        }
    };

    const handleDescriptionSubmit = () => {
        if (repoElement && localDescription !== repoElement.description) {
            updateElementDescription(repoElement.id, localDescription);
        } else if (repoView && localDescription !== repoView.description) {
            updateViewDescription(repoView.id, localDescription);
        } else if (repoRelation && localDescription !== repoRelation.description) {
            updateRelationDescription(repoRelation.id, localDescription);
        } else if (selectedNode && !repoElement && localDescription !== selectedNode.data.description) {
            updateNodeData(selectedNode.id, { description: localDescription });
        }
    };

    const handleDocumentationSubmit = () => {
        if (repoElement && localDocumentation !== repoElement.documentation) {
            updateElementDocumentation(repoElement.id, localDocumentation);
        } else if (repoView && localDocumentation !== repoView.documentation) {
            updateViewDocumentation(repoView.id, localDocumentation);
        } else if (repoRelation && localDocumentation !== repoRelation.documentation) {
            updateRelationDocumentation(repoRelation.id, localDocumentation);
        }
    };

    // Nothing selected and no active view?
    if (!repoElement && !repoView && !repoRelation && !selectedNode && !selectedEdge) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: themeColors.textTertiary }}>
                <Type size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p style={{ fontSize: '13px', margin: 0 }}>Select an element or relationship to view and edit its properties</p>
            </div>
        );
    }

    const editingObject = repoElement || repoView || repoRelation || selectedNode;

    if (editingObject) {
        // Determine type and display info
        let nodeType = '';
        let displayType = 'Element';
        let meta: { name: string; layer?: string; color?: string } | null = null;

        if (repoElement) {
            nodeType = repoElement.type;
            meta = ARCHIMATE_METAMODEL[nodeType];
            displayType = meta?.name || 'Element';
        } else if (repoView) {
            nodeType = 'archimate-view';
            displayType = 'Architecture View';
        } else if (repoRelation) {
            nodeType = repoRelation.type;
            meta = ARCHIMATE_RELATIONS[nodeType as RelationshipType];
            displayType = meta?.name || 'Relationship';
        } else if (selectedNode) {
            nodeType = selectedNode.data.type as string;
            meta = ARCHIMATE_METAMODEL[nodeType];
            displayType = meta?.name || 'Element';
        }

        const repoObject = repoElement || repoView || repoRelation;

        // Style properties with defaults (only if visual node)
        const nodeStyles = selectedNode ? {
            fontSize: (selectedNode.data.fontSize as number) || 12,
            fontFamily: (selectedNode.data.fontFamily as string) || 'Inter, sans-serif',
            fontWeight: (selectedNode.data.fontWeight as string) || 'normal',
            fontStyle: (selectedNode.data.fontStyle as string) || 'normal',
            textDecoration: (selectedNode.data.textDecoration as string) || 'none',
            textAlign: (selectedNode.data.textAlign as string) || 'center',
            width: (selectedNode.data.width as number) || 140,
            height: (selectedNode.data.height as number) || 60,
        } : null;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: `1px solid ${themeColors.borderLight}`,
                    background: themeColors.backgroundSecondary,
                    transition: 'background-color 0.2s, border-color 0.2s'
                }}>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: themeColors.text }}>{displayType}</h4>
                        <span style={{ fontSize: '11px', color: themeColors.textTertiary, opacity: 0.7 }}>{nodeType}</span>
                    </div>
                    {selectedNode && (
                        <button
                            onClick={() => deleteNode(selectedNode.id)}
                            style={{
                                padding: '4px 10px',
                                fontSize: '11px',
                                background: '#ff4757',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Delete
                        </button>
                    )}
                    {/* Allow deleting relation if selected from browser? Maybe later. */}
                </div>

                {/* Tab Switcher */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${themeColors.borderLight}`, transition: 'border-color 0.2s' }}>
                    <button
                        onClick={() => setActiveSection('properties')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            background: activeSection === 'properties' ? themeColors.background : themeColors.backgroundSecondary,
                            borderBottom: activeSection === 'properties' ? `2px solid var(--primary, #3366ff)` : '2px solid transparent',
                            fontSize: '12px',
                            fontWeight: activeSection === 'properties' ? 600 : 400,
                            cursor: 'pointer',
                            color: themeColors.text,
                            transition: 'background-color 0.2s, border-color 0.2s, color 0.2s'
                        }}
                    >
                        Properties
                    </button>
                    {selectedNode && (
                        <button
                            onClick={() => setActiveSection('style')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: 'none',
                                background: activeSection === 'style' ? themeColors.background : themeColors.backgroundSecondary,
                                borderBottom: activeSection === 'style' ? `2px solid var(--primary, #3366ff)` : '2px solid transparent',
                                fontSize: '12px',
                                fontWeight: activeSection === 'style' ? 600 : 400,
                                cursor: 'pointer',
                                color: themeColors.text,
                                transition: 'background-color 0.2s, border-color 0.2s, color 0.2s'
                            }}
                        >
                            Style
                        </button>
                    )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                    {activeSection === 'properties' && (
                        <>
                            {/* Name */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: themeColors.textSecondary, opacity: 0.7, marginBottom: '4px', textTransform: 'uppercase' }}>
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={localName}
                                    onChange={(e) => setLocalName(e.target.value)}
                                    onBlur={handleNameSubmit}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleNameSubmit();
                                            e.currentTarget.blur();
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        border: `1px solid ${themeColors.border}`,
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        background: themeColors.inputBg,
                                        color: themeColors.text,
                                        transition: 'border-color 0.2s, background-color 0.2s, color 0.2s'
                                    }}
                                />
                            </div>

                            {/* Description - Universal */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: themeColors.textSecondary, opacity: 0.7, marginBottom: '4px', textTransform: 'uppercase' }}>
                                    Description
                                </label>
                                <textarea
                                    value={localDescription}
                                    onChange={(e) => setLocalDescription(e.target.value)}
                                    onBlur={handleDescriptionSubmit}
                                    placeholder="Add a description..."
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        border: `1px solid ${themeColors.border}`,
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        minHeight: '80px',
                                        resize: 'vertical',
                                        background: themeColors.inputBg,
                                        color: themeColors.text,
                                        transition: 'border-color 0.2s, background-color 0.2s, color 0.2s'
                                    }}
                                />
                            </div>

                            {/* Documentation (RW) - Only for Repository Objects */}
                            {repoObject && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: themeColors.textSecondary, opacity: 0.7, marginBottom: '4px', textTransform: 'uppercase' }}>
                                        Documentation
                                    </label>
                                    <textarea
                                        value={localDocumentation}
                                        onChange={(e) => setLocalDocumentation(e.target.value)}
                                        onBlur={handleDocumentationSubmit}
                                        placeholder="Detailed documentation..."
                                        style={{
                                            width: '100%',
                                            padding: '8px 10px',
                                            border: `1px solid ${themeColors.border}`,
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            minHeight: '100px',
                                            resize: 'vertical',
                                            background: themeColors.inputBg,
                                            color: themeColors.text,
                                            transition: 'border-color 0.2s, background-color 0.2s, color 0.2s'
                                        }}
                                    />
                                </div>
                            )}

                            {/* DataBlocks Section - Only for Repository Elements/Relations */}
                            {eligibleDataBlocks.length > 0 && (repoElement || repoRelation) && (
                                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: `1px solid ${themeColors.borderLight}`, transition: 'border-color 0.2s' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                                        <Database size={14} style={{ color: themeColors.textSecondary, opacity: 0.7 }} />
                                        <h5 style={{ fontSize: '11px', fontWeight: 600, color: themeColors.textSecondary, opacity: 0.7, margin: 0, textTransform: 'uppercase' }}>
                                            Custom Attributes
                                        </h5>
                                    </div>
                                    
                                    {eligibleDataBlocks.map(block => {
                                        const blockValues = getDataBlockValues(block);
                                        return (
                                            <div key={block.id} style={{ marginBottom: '20px', padding: '12px', background: themeColors.backgroundSecondary, borderRadius: '6px', border: `1px solid ${themeColors.borderLight}`, transition: 'background-color 0.2s, border-color 0.2s' }}>
                                                <div style={{ fontSize: '12px', fontWeight: 600, color: themeColors.text, marginBottom: '12px' }}>
                                                    {block.name}
                                                </div>
                                                
                                                {block.attributes.map(attr => {
                                                    const currentValue = blockValues[attr.key] || '';
                                                    
                                                    return (
                                                        <div key={attr.id} style={{ marginBottom: '12px' }}>
                                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: themeColors.textQuaternary, opacity: 0.8, marginBottom: '4px' }}>
                                                                {attr.name}
                                                            </label>
                                                            
                                                            {attr.type === 'string' && (
                                                                <input
                                                                    type="text"
                                                                    value={currentValue}
                                                                    onChange={(e) => updateDataBlockValue(block, attr.key, e.target.value)}
                                                                    placeholder={`Enter ${attr.name.toLowerCase()}...`}
                                                                    style={{
                                                                        width: '100%',
                                                                        padding: '6px 8px',
                                                                        border: `1px solid ${themeColors.border}`,
                                                                        borderRadius: '4px',
                                                                        fontSize: '12px',
                                                                        background: themeColors.inputBg,
                                                                        color: themeColors.text,
                                                                        transition: 'border-color 0.2s, background-color 0.2s, color 0.2s'
                                                                    }}
                                                                />
                                                            )}
                                                            
                                                            {attr.type === 'number' && (
                                                                <input
                                                                    type="number"
                                                                    value={currentValue}
                                                                    onChange={(e) => updateDataBlockValue(block, attr.key, e.target.value)}
                                                                    placeholder={`Enter ${attr.name.toLowerCase()}...`}
                                                                    style={{
                                                                        width: '100%',
                                                                        padding: '6px 8px',
                                                                        border: `1px solid ${themeColors.border}`,
                                                                        borderRadius: '4px',
                                                                        fontSize: '12px',
                                                                        background: themeColors.inputBg,
                                                                        color: themeColors.text,
                                                                        transition: 'border-color 0.2s, background-color 0.2s, color 0.2s'
                                                                    }}
                                                                />
                                                            )}
                                                            
                                                            {attr.type === 'date' && (
                                                                <input
                                                                    type="date"
                                                                    value={currentValue}
                                                                    onChange={(e) => updateDataBlockValue(block, attr.key, e.target.value)}
                                                                    style={{
                                                                        width: '100%',
                                                                        padding: '6px 8px',
                                                                        border: `1px solid ${themeColors.border}`,
                                                                        borderRadius: '4px',
                                                                        fontSize: '12px',
                                                                        background: themeColors.inputBg,
                                                                        color: themeColors.text,
                                                                        transition: 'border-color 0.2s, background-color 0.2s, color 0.2s'
                                                                    }}
                                                                />
                                                            )}
                                                            
                                                            {attr.type === 'boolean' && (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={currentValue === 'true'}
                                                                        onChange={(e) => updateDataBlockValue(block, attr.key, e.target.checked ? 'true' : 'false')}
                                                                        style={{
                                                                            width: '18px',
                                                                            height: '18px',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    />
                                                                    <span style={{ fontSize: '12px', color: themeColors.textSecondary, opacity: 0.8 }}>
                                                                        {currentValue === 'true' ? 'Yes' : 'No'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            
                                                            {attr.type === 'enum' && (
                                                                <select
                                                                    value={currentValue}
                                                                    onChange={(e) => updateDataBlockValue(block, attr.key, e.target.value)}
                                                                    style={{
                                                                        width: '100%',
                                                                        padding: '6px 8px',
                                                                        border: `1px solid ${themeColors.border}`,
                                                                        borderRadius: '4px',
                                                                        fontSize: '12px',
                                                                        background: themeColors.inputBg,
                                                                        color: themeColors.text,
                                                                        transition: 'border-color 0.2s, background-color 0.2s, color 0.2s'
                                                                    }}
                                                                >
                                                                    <option value="">-- Select {attr.name} --</option>
                                                                    {attr.enumValues?.map(val => (
                                                                        <option key={val} value={val}>{val}</option>
                                                                    ))}
                                                                </select>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Metadata Section (RO) - Only for Repository Objects */}
                            {repoObject && (
                                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: `1px solid ${themeColors.borderLight}`, transition: 'border-color 0.2s' }}>
                                    <h5 style={{ fontSize: '11px', fontWeight: 600, color: themeColors.textSecondary, opacity: 0.7, marginBottom: '12px', textTransform: 'uppercase' }}>
                                        Metadata (Read Only)
                                    </h5>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', fontSize: '11px' }}>
                                        <span style={{ color: themeColors.textTertiary, opacity: 0.7 }}>ID:</span>
                                        <code style={{ fontFamily: 'monospace', color: themeColors.text, opacity: 0.9 }}>{repoObject.id}</code>

                                        {/* For view, type is not really stored in type field usually, or handled above */}
                                        <span style={{ color: themeColors.textTertiary, opacity: 0.7 }}>Type:</span>
                                        <span style={{ color: themeColors.text, opacity: 0.9 }}>{('type' in repoObject ? (repoObject as { type: string }).type : undefined) || nodeType}</span>

                                        <span style={{ color: themeColors.textTertiary, opacity: 0.7 }}>Created:</span>
                                        <span style={{ color: themeColors.text, opacity: 0.9 }}>
                                            {repoObject.createdAt ? new Date(repoObject.createdAt).toLocaleString() : '-'}
                                        </span>

                                        <span style={{ color: themeColors.textTertiary, opacity: 0.7 }}>Modified:</span>
                                        <span style={{ color: themeColors.text, opacity: 0.9 }}>
                                            {repoObject.modifiedAt ? new Date(repoObject.modifiedAt).toLocaleString() : '-'}
                                        </span>

                                        <span style={{ color: themeColors.textTertiary, opacity: 0.7 }}>Author:</span>
                                        <span style={{ color: themeColors.text, opacity: 0.9 }}>{repoObject.author || '-'}</span>
                                    </div>
                                </div>
                            )}

                            {/* Layer Badge - For elements with metamodel */}
                            {meta && meta.layer && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: themeColors.textSecondary, opacity: 0.7, marginBottom: '4px', textTransform: 'uppercase' }}>
                                        Layer
                                    </label>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        background: meta?.color || '#888',
                                        color: '#fff',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: 500,
                                        textTransform: 'capitalize'
                                    }}>
                                        {meta?.layer || 'Other'}
                                    </span>
                                </div>
                            )}

                            {/* ID for Node if no repo element */}
                            {!repoElement && selectedNode && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: themeColors.textSecondary, opacity: 0.7, marginBottom: '4px', textTransform: 'uppercase' }}>
                                        Node ID
                                    </label>
                                    <code style={{ fontSize: '10px', color: themeColors.textSecondary, opacity: 0.8, background: themeColors.backgroundSecondary, padding: '4px 8px', borderRadius: '4px', transition: 'background-color 0.2s, color 0.2s' }}>
                                        {selectedNode.id}
                                    </code>
                                </div>
                            )}

                            {/* Position - Only visual */}
                            {selectedNode && (
                                <div style={{ marginTop: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: themeColors.textSecondary, opacity: 0.7, marginBottom: '4px', textTransform: 'uppercase' }}>
                                        Position
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <div style={{ flex: 1 }}>
                                            <span style={{ fontSize: '10px', color: themeColors.textTertiary, opacity: 0.7 }}>X</span>
                                            <div style={{ fontSize: '12px', color: themeColors.text }}>{Math.round(selectedNode.position.x)}</div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <span style={{ fontSize: '10px', color: themeColors.textTertiary, opacity: 0.7 }}>Y</span>
                                            <div style={{ fontSize: '12px', color: themeColors.text }}>{Math.round(selectedNode.position.y)}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {activeSection === 'style' && selectedNode && nodeStyles && (
                        <>
                            {/* Size */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: themeColors.textSecondary, opacity: 0.7, marginBottom: '8px', textTransform: 'uppercase' }}>
                                    <Maximize2 size={12} /> Dimensions
                                </label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontSize: '10px', color: themeColors.textTertiary, opacity: 0.7 }}>Width</span>
                                        <input
                                            type="number"
                                            value={nodeStyles.width}
                                            onChange={(e) => updateNodeData(selectedNode.id, { width: parseInt(e.target.value) || 140 })}
                                            style={{ width: '100%', padding: '6px', border: `1px solid ${themeColors.border}`, borderRadius: '4px', fontSize: '12px', background: themeColors.inputBg, color: themeColors.text, transition: 'border-color 0.2s, background-color 0.2s, color 0.2s' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontSize: '10px', color: themeColors.textTertiary, opacity: 0.7 }}>Height</span>
                                        <input
                                            type="number"
                                            value={nodeStyles.height}
                                            onChange={(e) => updateNodeData(selectedNode.id, { height: parseInt(e.target.value) || 60 })}
                                            style={{ width: '100%', padding: '6px', border: `1px solid ${themeColors.border}`, borderRadius: '4px', fontSize: '12px', background: themeColors.inputBg, color: themeColors.text, transition: 'border-color 0.2s, background-color 0.2s, color 0.2s' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Font Family */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: themeColors.textSecondary, opacity: 0.7, marginBottom: '4px', textTransform: 'uppercase' }}>
                                    <Type size={12} /> Font
                                </label>
                                <select
                                    value={nodeStyles.fontFamily}
                                    onChange={(e) => updateNodeData(selectedNode.id, { fontFamily: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: `1px solid ${themeColors.border}`, borderRadius: '6px', fontSize: '12px', background: themeColors.inputBg, color: themeColors.text, transition: 'border-color 0.2s, background-color 0.2s, color 0.2s' }}
                                >
                                    {FONT_FAMILIES.map(f => (
                                        <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Font Size */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: themeColors.textSecondary, opacity: 0.7, marginBottom: '4px', textTransform: 'uppercase' }}>
                                    Size
                                </label>
                                <select
                                    value={nodeStyles.fontSize}
                                    onChange={(e) => updateNodeData(selectedNode.id, { fontSize: parseInt(e.target.value) })}
                                    style={{ width: '100%', padding: '8px', border: `1px solid ${themeColors.border}`, borderRadius: '6px', fontSize: '12px', background: themeColors.inputBg, color: themeColors.text, transition: 'border-color 0.2s, background-color 0.2s, color 0.2s' }}
                                >
                                    {FONT_SIZES.map(s => (
                                        <option key={s} value={s}>{s}px</option>
                                    ))}
                                </select>
                            </div>

                            {/* Font Style Buttons */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: themeColors.textSecondary, opacity: 0.7, marginBottom: '8px', textTransform: 'uppercase' }}>
                                    Style
                                </label>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                        onClick={() => updateNodeData(selectedNode.id, { fontWeight: nodeStyles.fontWeight === 'bold' ? 'normal' : 'bold' })}
                                        style={{
                                            padding: '8px 12px',
                                            border: `1px solid ${themeColors.border}`,
                                            borderRadius: '4px',
                                            background: nodeStyles.fontWeight === 'bold' ? 'var(--primary, #3366ff)' : themeColors.inputBg,
                                            color: nodeStyles.fontWeight === 'bold' ? '#fff' : themeColors.text,
                                            transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Bold size={14} />
                                    </button>
                                    <button
                                        onClick={() => updateNodeData(selectedNode.id, { fontStyle: nodeStyles.fontStyle === 'italic' ? 'normal' : 'italic' })}
                                        style={{
                                            padding: '8px 12px',
                                            border: `1px solid ${themeColors.border}`,
                                            borderRadius: '4px',
                                            background: nodeStyles.fontStyle === 'italic' ? 'var(--primary, #3366ff)' : themeColors.inputBg,
                                            color: nodeStyles.fontStyle === 'italic' ? '#fff' : themeColors.text,
                                            transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Italic size={14} />
                                    </button>
                                    <button
                                        onClick={() => updateNodeData(selectedNode.id, { textDecoration: nodeStyles.textDecoration === 'underline' ? 'none' : 'underline' })}
                                        style={{
                                            padding: '8px 12px',
                                            border: `1px solid ${themeColors.border}`,
                                            borderRadius: '4px',
                                            background: nodeStyles.textDecoration === 'underline' ? 'var(--primary, #3366ff)' : themeColors.inputBg,
                                            color: nodeStyles.textDecoration === 'underline' ? '#fff' : themeColors.text,
                                            transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Underline size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Text Alignment */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: themeColors.textSecondary, opacity: 0.7, marginBottom: '8px', textTransform: 'uppercase' }}>
                                    Alignment
                                </label>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                        onClick={() => updateNodeData(selectedNode.id, { textAlign: 'left' })}
                                        style={{
                                            padding: '8px 12px',
                                            border: `1px solid ${themeColors.border}`,
                                            borderRadius: '4px',
                                            background: nodeStyles.textAlign === 'left' ? 'var(--primary, #3366ff)' : themeColors.inputBg,
                                            color: nodeStyles.textAlign === 'left' ? '#fff' : themeColors.text,
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s, color 0.2s, border-color 0.2s'
                                        }}
                                    >
                                        <AlignLeft size={14} />
                                    </button>
                                    <button
                                        onClick={() => updateNodeData(selectedNode.id, { textAlign: 'center' })}
                                        style={{
                                            padding: '8px 12px',
                                            border: `1px solid ${themeColors.border}`,
                                            borderRadius: '4px',
                                            background: nodeStyles.textAlign === 'center' ? 'var(--primary, #3366ff)' : themeColors.inputBg,
                                            color: nodeStyles.textAlign === 'center' ? '#fff' : themeColors.text,
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s, color 0.2s, border-color 0.2s'
                                        }}
                                    >
                                        <AlignCenter size={14} />
                                    </button>
                                    <button
                                        onClick={() => updateNodeData(selectedNode.id, { textAlign: 'right' })}
                                        style={{
                                            padding: '8px 12px',
                                            border: `1px solid ${themeColors.border}`,
                                            borderRadius: '4px',
                                            background: nodeStyles.textAlign === 'right' ? 'var(--primary, #3366ff)' : themeColors.inputBg,
                                            color: nodeStyles.textAlign === 'right' ? '#fff' : themeColors.text,
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s, color 0.2s, border-color 0.2s'
                                        }}
                                    >
                                        <AlignRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    if (selectedEdge) {
        const relationType = (selectedEdge.data?.type as RelationshipType) || 'association';
        const meta = ARCHIMATE_RELATIONS[relationType];

        return (
            <div style={{ padding: '16px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                    paddingBottom: '12px',
                    borderBottom: `1px solid ${themeColors.borderLight}`,
                    transition: 'border-color 0.2s'
                }}>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: themeColors.text }}>{meta?.name || 'Relationship'}</h4>
                        <span style={{ fontSize: '11px', color: themeColors.textTertiary, opacity: 0.7 }}>Connection</span>
                    </div>
                    <button
                        onClick={() => deleteEdge(selectedEdge.id)}
                        style={{
                            padding: '4px 10px',
                            fontSize: '11px',
                            background: '#ff4757',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Delete
                    </button>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Relationship Type
                    </label>
                    <select
                        value={relationType}
                        onChange={(e) => updateEdgeData(selectedEdge.id, { type: e.target.value })}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '12px' }}
                    >
                        {Object.values(ARCHIMATE_RELATIONS).map(rel => (
                            <option key={rel.id} value={rel.id}>{rel.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>
                        ID
                    </label>
                    <code style={{ fontSize: '10px', color: '#666', background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px' }}>
                        {selectedEdge.id}
                    </code>
                </div>

                <div style={{ fontSize: '12px', color: '#666' }}>
                    <p style={{ margin: '4px 0' }}><strong>From:</strong> {selectedEdge.source}</p>
                    <p style={{ margin: '4px 0' }}><strong>To:</strong> {selectedEdge.target}</p>
                </div>
            </div>
        );
    }

    return null;
};

export default PropertiesPanel;
