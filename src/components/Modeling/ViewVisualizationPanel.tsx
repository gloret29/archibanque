import React, { useState } from 'react';
import { useEditorStore, DataBlock, DataBlockAttribute } from '@/store/useEditorStore';
import { Plus, Trash2, PaintBucket, Check, X, AlertCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ViewVisualizationPanelProps {
    viewId: string;
}

interface ColorRule {
    id: string;
    blockId?: string;
    attributeKey?: string;
    propertyKey?: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
    value: string;
    color: string;
    active: boolean;
}

interface LabelRule {
    id: string;
    blockId?: string;
    attributeKey?: string;
    propertyKey?: string;
    position: 'replace' | 'append' | 'prepend' | 'bottom';
    prefix?: string;
    suffix?: string;
    active: boolean;
}

export default function ViewVisualizationPanel({ viewId }: ViewVisualizationPanelProps) {
    const { theme } = useTheme();
    const { views, updateViewSettings, dataBlocks } = useEditorStore();
    const view = views.find(v => v.id === viewId);

    // Theme colors
    const themeColors = {
        background: 'var(--background)',
        backgroundSecondary: theme === 'dark' ? '#27272a' : '#f8f9fa',
        border: 'var(--border)',
        text: 'var(--foreground)',
        textSecondary: theme === 'dark' ? '#a1a1aa' : '#666',
        inputBg: theme === 'dark' ? '#3f3f46' : '#fff',
    };

    const colorRules = (view?.viewSettings?.colorRules as ColorRule[]) || [];
    const labelRules = (view?.viewSettings?.labelRules as LabelRule[]) || [];

    const handleAddRule = React.useCallback(() => {
        const newRule: ColorRule = {
            id: `rule_${Date.now()}`,
            propertyKey: 'type', // Default
            operator: 'equals',
            value: '',
            color: '#ff4757',
            active: true
        };
        const newRules = [...colorRules, newRule];
        updateViewSettings(viewId, { colorRules: newRules });
    }, [colorRules, updateViewSettings, viewId]);

    const handleAddLabelRule = React.useCallback(() => {
        const newRule: LabelRule = {
            id: `lrule_${Date.now()}`,
            propertyKey: 'type',
            position: 'replace',
            active: true
        };
        const newRules = [...labelRules, newRule];
        updateViewSettings(viewId, { labelRules: newRules });
    }, [labelRules, updateViewSettings, viewId]);

    const updateRule = React.useCallback((ruleId: string, updates: Partial<ColorRule>) => {
        const newRules = colorRules.map(r => r.id === ruleId ? { ...r, ...updates } : r);
        updateViewSettings(viewId, { colorRules: newRules });
    }, [colorRules, updateViewSettings, viewId]);

    const updateLabelRule = React.useCallback((ruleId: string, updates: Partial<LabelRule>) => {
        const newRules = labelRules.map(r => r.id === ruleId ? { ...r, ...updates } : r);
        updateViewSettings(viewId, { labelRules: newRules });
    }, [labelRules, updateViewSettings, viewId]);

    const deleteRule = React.useCallback((ruleId: string) => {
        const newRules = colorRules.filter(r => r.id !== ruleId);
        updateViewSettings(viewId, { colorRules: newRules });
    }, [colorRules, updateViewSettings, viewId]);

    const deleteLabelRule = React.useCallback((ruleId: string) => {
        const newRules = labelRules.filter(r => r.id !== ruleId);
        updateViewSettings(viewId, { labelRules: newRules });
    }, [labelRules, updateViewSettings, viewId]);

    // Flatten all available attributes from DataBlocks for selection
    const availableAttributes = [
        { label: 'Standard: Element Type', value: 'std:type', type: 'string' },
        ...dataBlocks.flatMap(block =>
            block.attributes.map(attr => ({
                label: `Custom: ${block.name} - ${attr.name}`,
                value: `db:${block.id}:${attr.key}`,
                type: attr.type
            }))
        )
    ];

    return (
        <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: themeColors.text }}>Heatmap Rules</h4>
                <button
                    onClick={handleAddRule}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '6px 10px', fontSize: '11px',
                        background: '#3366ff', color: 'white',
                        border: 'none', borderRadius: '4px', cursor: 'pointer'
                    }}
                >
                    <Plus size={12} /> Add Rule
                </button>
            </div>

            {colorRules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', background: themeColors.backgroundSecondary, borderRadius: '8px', border: `1px dashed ${themeColors.border}` }}>
                    <PaintBucket size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
                    <p style={{ margin: 0, fontSize: '12px', color: themeColors.textSecondary }}>
                        No coloring rules defined. Add a rule to dynamically color elements based on their properties.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {colorRules.map(rule => (
                        <div key={rule.id} style={{
                            padding: '12px',
                            background: themeColors.backgroundSecondary,
                            borderRadius: '6px',
                            border: `1px solid ${themeColors.border}`,
                            opacity: rule.active ? 1 : 0.6
                        }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                {/* Property Selector */}
                                <select
                                    value={rule.blockId ? `db:${rule.blockId}:${rule.attributeKey}` : `std:${rule.propertyKey}`}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val.startsWith('std:')) {
                                            updateRule(rule.id, { propertyKey: val.split(':')[1], blockId: undefined, attributeKey: undefined });
                                        } else if (val.startsWith('db:')) {
                                            const [, blockId, attrKey] = val.split(':');
                                            updateRule(rule.id, { propertyKey: undefined, blockId, attributeKey: attrKey });
                                        }
                                    }}
                                    style={{ flex: 1, fontSize: '11px', padding: '4px', borderRadius: '4px', border: `1px solid ${themeColors.border}`, background: themeColors.inputBg, color: themeColors.text }}
                                >
                                    {availableAttributes.map(attr => (
                                        <option key={attr.value} value={attr.value}>{attr.label}</option>
                                    ))}
                                </select>

                                {/* Active Toggle */}
                                <input
                                    type="checkbox"
                                    checked={rule.active}
                                    onChange={(e) => updateRule(rule.id, { active: e.target.checked })}
                                    style={{ cursor: 'pointer' }}
                                />

                                <button onClick={() => deleteRule(rule.id)} style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ff4757', opacity: 0.7 }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {/* Operator */}
                                <select
                                    value={rule.operator}
                                    onChange={(e) => updateRule(rule.id, { operator: e.target.value as ColorRule['operator'] })}
                                    style={{ width: '80px', fontSize: '11px', padding: '4px', borderRadius: '4px', border: `1px solid ${themeColors.border}`, background: themeColors.inputBg, color: themeColors.text }}
                                >
                                    <option value="equals">=</option>
                                    <option value="contains">contains</option>
                                    <option value="greaterThan">&gt;</option>
                                    <option value="lessThan">&lt;</option>
                                </select>

                                {/* Value */}
                                <input
                                    type="text"
                                    value={rule.value}
                                    onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                                    placeholder="Value..."
                                    style={{ flex: 1, fontSize: '11px', padding: '5px', borderRadius: '4px', border: `1px solid ${themeColors.border}`, background: themeColors.inputBg, color: themeColors.text }}
                                />

                                {/* Color */}
                                <input
                                    type="color"
                                    value={rule.color}
                                    onChange={(e) => updateRule(rule.id, { color: e.target.value })}
                                    style={{ width: '30px', height: '24px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* --- Label Rules --- */}
            <div style={{ marginTop: '30px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${themeColors.border}`, paddingTop: '20px' }}>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: themeColors.text }}>Label Rules</h4>
                <button
                    onClick={handleAddLabelRule}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '6px 10px', fontSize: '11px',
                        background: '#3366ff', color: 'white',
                        border: 'none', borderRadius: '4px', cursor: 'pointer'
                    }}
                >
                    <Plus size={12} /> Add Rule
                </button>
            </div>

            {labelRules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', background: themeColors.backgroundSecondary, borderRadius: '8px', border: `1px dashed ${themeColors.border}` }}>
                    <div style={{ opacity: 0.3, marginBottom: '8px', fontSize: '24px', fontWeight: 'bold' }}>T</div>
                    <p style={{ margin: 0, fontSize: '12px', color: themeColors.textSecondary }}>
                        No label rules defined.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {labelRules.map(rule => (
                        <div key={rule.id} style={{
                            padding: '12px',
                            background: themeColors.backgroundSecondary,
                            borderRadius: '6px',
                            border: `1px solid ${themeColors.border}`,
                            opacity: rule.active ? 1 : 0.6
                        }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                {/* Property Selector */}
                                <select
                                    value={rule.blockId ? `db:${rule.blockId}:${rule.attributeKey}` : `std:${rule.propertyKey}`}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val.startsWith('std:')) {
                                            updateLabelRule(rule.id, { propertyKey: val.split(':')[1], blockId: undefined, attributeKey: undefined });
                                        } else if (val.startsWith('db:')) {
                                            const [, blockId, attrKey] = val.split(':');
                                            updateLabelRule(rule.id, { propertyKey: undefined, blockId, attributeKey: attrKey });
                                        }
                                    }}
                                    style={{ flex: 1, fontSize: '11px', padding: '4px', borderRadius: '4px', border: `1px solid ${themeColors.border}`, background: themeColors.inputBg, color: themeColors.text }}
                                >
                                    {availableAttributes.map(attr => (
                                        <option key={attr.value} value={attr.value}>{attr.label}</option>
                                    ))}
                                </select>

                                {/* Active Toggle */}
                                <input
                                    type="checkbox"
                                    checked={rule.active}
                                    onChange={(e) => updateLabelRule(rule.id, { active: e.target.checked })}
                                    style={{ cursor: 'pointer' }}
                                />

                                <button onClick={() => deleteLabelRule(rule.id)} style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ff4757', opacity: 0.7 }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '10px', width: '50px' }}>Position:</span>
                                <select
                                    value={rule.position}
                                    onChange={(e) => updateLabelRule(rule.id, { position: e.target.value as LabelRule['position'] })}
                                    style={{ flex: 1, fontSize: '11px', padding: '4px', borderRadius: '4px', border: `1px solid ${themeColors.border}`, background: themeColors.inputBg, color: themeColors.text }}
                                >
                                    <option value="replace">Replace Label</option>
                                    <option value="append">Append (Top-right)</option>
                                    <option value="prepend">Prepend</option>
                                    <option value="bottom">Bottom (Subtitle)</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    value={rule.prefix || ''}
                                    onChange={(e) => updateLabelRule(rule.id, { prefix: e.target.value })}
                                    placeholder="Prefix (e.g. ROI: )"
                                    style={{ flex: 1, fontSize: '11px', padding: '5px', borderRadius: '4px', border: `1px solid ${themeColors.border}`, background: themeColors.inputBg, color: themeColors.text }}
                                />
                                <input
                                    type="text"
                                    value={rule.suffix || ''}
                                    onChange={(e) => updateLabelRule(rule.id, { suffix: e.target.value })}
                                    placeholder="Suffix (e.g. %)"
                                    style={{ flex: 1, fontSize: '11px', padding: '5px', borderRadius: '4px', border: `1px solid ${themeColors.border}`, background: themeColors.inputBg, color: themeColors.text }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
