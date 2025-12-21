'use client';

import React, { useState, useMemo } from 'react';
import { useEditorStore, DataBlock, DataBlockAttribute, AttributeType } from '@/store/useEditorStore';
import { syncDataBlocks } from '@/actions/datablocks';
import { ARCHIMATE_METAMODEL, ARCHIMATE_RELATIONS, ArchimateLayer } from '@/lib/metamodel';
import {
    Plus, Trash2, Edit2, Database, Check, X,
    ChevronDown, ChevronRight, Settings, List
} from 'lucide-react';

// --- Helper Components ---

const Modal = ({ title, onClose, children }: { title: string, onClose: () => void, children: React.ReactNode }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-[500px] max-w-full m-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-semibold text-lg">{title}</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                    <X size={20} />
                </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
                {children}
            </div>
        </div>
    </div>
);

// --- Attribute Editor Modal ---

interface AttributeEditorProps {
    attribute?: DataBlockAttribute;
    onSave: (attr: Omit<DataBlockAttribute, 'id'>) => void;
    onClose: () => void;
}

const AttributeEditor = ({ attribute, onSave, onClose }: AttributeEditorProps) => {
    const [name, setName] = useState(attribute?.name || '');
    const [key, setKey] = useState(attribute?.key || '');
    const [type, setType] = useState<AttributeType>(attribute?.type || 'string');
    const [enumValues, setEnumValues] = useState<string[]>(attribute?.enumValues || []);

    // Enum management state
    const [newEnumValue, setNewEnumValue] = useState('');
    const [showEnumManager, setShowEnumManager] = useState(false);

    const handleSubmit = () => {
        if (!name || !key) return;
        onSave({
            name,
            key,
            type,
            enumValues: type === 'enum' ? enumValues : undefined
        });
        onClose();
    };

    // Auto-generate key from name if key is empty
    const handleNameChange = (val: string) => {
        setName(val);
        if (!attribute && !key) {
            setKey(val.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''));
        }
    };

    return (
        <Modal title={attribute ? "Edit Attribute" : "New Attribute"} onClose={onClose}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <input
                        className="w-full border rounded p-2 text-sm"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g. Risk Level"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Internal Key</label>
                    <input
                        className="w-full border rounded p-2 text-sm font-mono bg-gray-50"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="e.g. risk_level"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                        className="w-full border rounded p-2 text-sm"
                        value={type}
                        onChange={(e) => setType(e.target.value as AttributeType)}
                    >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="enum">Enum (List)</option>
                    </select>
                </div>

                {type === 'enum' && (
                    <div className="border rounded p-3 bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Enumeration Values</span>
                            <button
                                onClick={() => setShowEnumManager(true)}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 flex items-center gap-1"
                            >
                                <List size={12} /> Manage List
                            </button>
                        </div>
                        <div className="text-xs text-gray-500 min-h-[40px] border bg-white p-2 rounded max-h-[100px] overflow-y-auto">
                            {enumValues.length === 0 ? (
                                <span className="italic">No values defined</span>
                            ) : (
                                <div className="flex flex-wrap gap-1">
                                    {enumValues.map(v => (
                                        <span key={v} className="bg-gray-100 border px-1.5 rounded">{v}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={!name || !key}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        Save
                    </button>
                </div>
            </div>

            {/* Sub-window for Enum Management */}
            {showEnumManager && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
                    <div className="bg-white rounded shadow-xl w-[300px] p-4 border border-gray-200">
                        <h4 className="font-semibold text-sm mb-3">Manage Enum Values</h4>
                        <div className="flex gap-2 mb-3">
                            <input
                                className="flex-1 border rounded px-2 py-1 text-sm"
                                value={newEnumValue}
                                onChange={(e) => setNewEnumValue(e.target.value)}
                                placeholder="New value"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newEnumValue.trim()) {
                                        setEnumValues([...enumValues, newEnumValue.trim()]);
                                        setNewEnumValue('');
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    if (newEnumValue.trim()) {
                                        setEnumValues([...enumValues, newEnumValue.trim()]);
                                        setNewEnumValue('');
                                    }
                                }}
                                className="bg-blue-600 text-white p-1 rounded"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <ul className="space-y-1 max-h-[200px] overflow-y-auto mb-3">
                            {enumValues.map((val, idx) => (
                                <li key={idx} className="flex justify-between items-center text-sm bg-gray-50 px-2 py-1 rounded">
                                    <span>{val}</span>
                                    <button
                                        onClick={() => setEnumValues(enumValues.filter((_, i) => i !== idx))}
                                        className="text-red-500 hover:bg-red-50 rounded"
                                    >
                                        <X size={12} />
                                    </button>
                                </li>
                            ))}
                            {enumValues.length === 0 && <li className="text-gray-400 text-xs text-center p-2">List is empty</li>}
                        </ul>
                        <div className="text-right">
                            <button
                                onClick={() => setShowEnumManager(false)}
                                className="px-3 py-1 bg-gray-800 text-white text-xs rounded hover:bg-gray-700"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

// --- Main DataBlock Manager ---

export default function DataBlockManager() {
    const {
        dataBlocks,
        addDataBlock, updateDataBlock, deleteDataBlock,
        addAttributeToBlock, updateBlockAttribute, deleteBlockAttribute
    } = useEditorStore();

    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [isCreatingAttribute, setIsCreatingAttribute] = useState(false);
    const [editingAttributeId, setEditingAttributeId] = useState<string | null>(null);

    const selectedBlock = dataBlocks.find(b => b.id === selectedBlockId);

    // Auto-save data blocks when they change
    useEffect(() => {
        // Only sync if data is loaded and we have blocks (or empty list is valid)
        // We use a debounce to avoid spamming server
        const timer = setTimeout(() => {
            if (dataBlocks) {
                syncDataBlocks(dataBlocks).then(res => {
                    if (!res.success) console.error('Failed to sync data blocks:', res.error);
                });
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [dataBlocks]);

    // Grouping for Target Selector
    const targetGroups = useMemo(() => {
        const layers: ArchimateLayer[] = ['strategy', 'business', 'application', 'technology', 'physical', 'motivation', 'implementation', 'other'];
        const layerGroups = layers.map(layer => ({
            id: layer,
            label: layer.charAt(0).toUpperCase() + layer.slice(1) + ' Layer',
            items: Object.values(ARCHIMATE_METAMODEL).filter(m => m.layer === layer)
        })).filter(g => g.items.length > 0);

        const relationGroup = {
            id: 'relations',
            label: 'Relationships',
            items: Object.values(ARCHIMATE_RELATIONS)
        };

        return [...layerGroups, relationGroup];
    }, []);

    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev =>
            prev.includes(groupId) ? prev.filter(g => g !== groupId) : [...prev, groupId]
        );
    };

    const toggleTargetType = (typeId: string) => {
        if (!selectedBlock) return;
        const current = selectedBlock.targetTypes;
        const newTargets = current.includes(typeId)
            ? current.filter(t => t !== typeId)
            : [...current, typeId];
        updateDataBlock(selectedBlock.id, { targetTypes: newTargets });
    };

    const handleCreateBlock = () => {
        const block = addDataBlock('New Data Block');
        setSelectedBlockId(block.id);
    };

    return (
        <div className="flex h-full gap-6">
            {/* Sidebar List */}
            <div className="w-1/4 border-r pr-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">Data Blocks</h3>
                    <button
                        onClick={handleCreateBlock}
                        className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        title="Add Data Block"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                <div className="space-y-1 overflow-y-auto flex-1">
                    {dataBlocks.map(block => (
                        <div
                            key={block.id}
                            onClick={() => setSelectedBlockId(block.id)}
                            className={`
                                p-3 rounded-md cursor-pointer flex justify-between items-center group
                                ${selectedBlockId === block.id ? 'bg-blue-50 border-blue-200 border' : 'hover:bg-gray-50 border border-transparent'}
                            `}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Database size={14} className="text-gray-500 flex-shrink-0" />
                                <span className="truncate text-sm font-medium text-gray-700">{block.name}</span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Delete this Data Block?')) deleteDataBlock(block.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-red-500 rounded"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                    {dataBlocks.length === 0 && (
                        <div className="text-center text-gray-400 text-sm py-8 italic border-2 border-dashed rounded-lg">
                            No data blocks defined
                        </div>
                    )}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {selectedBlock ? (
                    <>
                        <div className="mb-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Block Name</label>
                                <input
                                    className="text-xl font-bold w-full border-b border-gray-200 focus:border-blue-500 outline-none py-1 bg-transparent"
                                    value={selectedBlock.name}
                                    onChange={(e) => updateDataBlock(selectedBlock.id, { name: e.target.value })}
                                    placeholder="Enter block name..."
                                />
                            </div>

                            {/* Attributes Section */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Attributes</label>
                                    <button
                                        onClick={() => setIsCreatingAttribute(true)}
                                        className="text-xs bg-gray-100 font-medium text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200 flex items-center gap-1"
                                    >
                                        <Plus size={12} /> Add Attribute
                                    </button>
                                </div>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="text-left py-2 px-3 font-medium text-gray-600">Name</th>
                                                <th className="text-left py-2 px-3 font-medium text-gray-600">Key</th>
                                                <th className="text-left py-2 px-3 font-medium text-gray-600">Type</th>
                                                <th className="text-right py-2 px-3 font-medium text-gray-600">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {selectedBlock.attributes.map(attr => (
                                                <tr key={attr.id} className="hover:bg-gray-50">
                                                    <td className="py-2 px-3">{attr.name}</td>
                                                    <td className="py-2 px-3 font-mono text-xs text-gray-500">{attr.key}</td>
                                                    <td className="py-2 px-3">
                                                        <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100 border capitalize">
                                                            {attr.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-3 text-right">
                                                        <button
                                                            onClick={() => setEditingAttributeId(attr.id)}
                                                            className="p-1 hover:bg-blue-50 text-blue-600 rounded mr-1"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteBlockAttribute(selectedBlock.id, attr.id)}
                                                            className="p-1 hover:bg-red-50 text-red-600 rounded"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {selectedBlock.attributes.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="py-4 text-center text-gray-400 italic">No attributes in this block</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Target Selection */}
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Applies to ({selectedBlock.targetTypes.length})
                            </label>
                            <div className="border rounded-lg overflow-y-auto flex-1 p-2 bg-gray-50 space-y-2">
                                {targetGroups.map(group => {
                                    const isExpanded = expandedGroups.includes(group.id);
                                    const selectedCount = group.items.filter(i => selectedBlock.targetTypes.includes(i.id)).length;

                                    return (
                                        <div key={group.id} className="bg-white border rounded">
                                            <button
                                                onClick={() => toggleGroup(group.id)}
                                                className="w-full flex items-center justify-between p-2 hover:bg-gray-50"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                    <span className="font-medium text-sm">{group.label}</span>
                                                </div>
                                                {selectedCount > 0 && (
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                        {selectedCount} selected
                                                    </span>
                                                )}
                                            </button>

                                            {/* Items List */}
                                            {isExpanded && (
                                                <div className="border-t p-2 grid grid-cols-2 gap-2">
                                                    {group.items.map(item => {
                                                        const isChecked = selectedBlock.targetTypes.includes(item.id);
                                                        return (
                                                            <label
                                                                key={item.id}
                                                                className={`
                                                                    flex items-center gap-2 p-1.5 rounded cursor-pointer border text-xs
                                                                    ${isChecked ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50 border-transparent'}
                                                                `}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                    checked={isChecked}
                                                                    onChange={() => toggleTargetType(item.id)}
                                                                />
                                                                <span className="truncate">{item.name}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Database size={48} className="mb-4 opacity-20" />
                        <p>Select or create a data block to start editing</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            {isCreatingAttribute && selectedBlock && (
                <AttributeEditor
                    onSave={(attr) => addAttributeToBlock(selectedBlock.id, attr)}
                    onClose={() => setIsCreatingAttribute(false)}
                />
            )}

            {editingAttributeId && selectedBlock && (
                <AttributeEditor
                    attribute={selectedBlock.attributes.find(a => a.id === editingAttributeId)}
                    onSave={(updates) => updateBlockAttribute(selectedBlock.id, editingAttributeId, updates)}
                    onClose={() => setEditingAttributeId(null)}
                />
            )}
        </div>
    );
}
