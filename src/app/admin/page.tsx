'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { ARCHIMATE_METAMODEL, ArchimateLayer, getColorForLayer } from '@/lib/metamodel';
import Link from 'next/link';
import { ArrowLeft, Layers, Database, Eye, EyeOff, Search, Loader2 } from 'lucide-react';
import DataBlockManager from '@/components/Admin/DataBlockManager';
import { useInitializeFromDB } from '@/hooks/useInitializeFromDB';
import { settingsApi } from '@/lib/api';
import { UserMenuWrapper } from '@/components/UI/UserMenuWrapper';

export default function AdminPage() {
    const {
        enabledElementTypes,
        toggleElementType,
        enableAllElementTypes,
        disableAllElementTypes
    } = useEditorStore();

    // Initialize data from DB
    const { settingsLoaded, dataBlocksLoaded } = useInitializeFromDB();

    const [activeTab, setActiveTab] = useState<'visibility' | 'datablocks'>('visibility');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Persist settings to DB after changes
    const persistSettings = useCallback(async (newTypes: string[]) => {
        setIsSaving(true);
        try {
            await settingsApi.update({ enabledElementTypes: newTypes });
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setIsSaving(false);
        }
    }, []);

    // Wrapper functions that toggle + persist
    const handleToggleElement = useCallback((typeId: string) => {
        toggleElementType(typeId);
        // Get updated state after toggle
        const currentTypes = useEditorStore.getState().enabledElementTypes;
        persistSettings(currentTypes);
    }, [toggleElementType, persistSettings]);

    const handleEnableAll = useCallback(() => {
        enableAllElementTypes();
        persistSettings(Object.keys(ARCHIMATE_METAMODEL));
    }, [enableAllElementTypes, persistSettings]);

    const handleDisableAll = useCallback(() => {
        disableAllElementTypes();
        persistSettings([]);
    }, [disableAllElementTypes, persistSettings]);

    // Group elements by layer
    const elementsByLayer = useMemo(() => {
        const layers: ArchimateLayer[] = ['strategy', 'business', 'application', 'technology', 'physical', 'implementation', 'motivation', 'other'];
        return layers.map(layer => ({
            layer,
            items: Object.values(ARCHIMATE_METAMODEL).filter(item =>
                item.layer === layer &&
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        })).filter(group => group.items.length > 0);
    }, [searchTerm]);

    // Show loading state while fetching from DB
    if (!settingsLoaded || !dataBlocksLoaded) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <p className="text-slate-600">Loading configuration...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-20 flex-shrink-0">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 group decoration-0">
                        <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm group-hover:bg-blue-700 transition-colors">
                            <span className="text-xl leading-none">💎</span>
                        </div>
                        <span className="font-bold text-xl text-slate-800 tracking-tight">ArchiModeler</span>
                    </Link>

                    <div className="h-8 w-px bg-slate-200"></div>

                    <div className="flex items-center gap-4">
                        <Link href="/modeler" className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full transition-colors" title="Back to Modeler">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-tight">Administration</h1>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">System Configuration</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {activeTab === 'visibility' && (
                        <>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search elements..."
                                className="pl-9 pr-4 py-1.5 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 border rounded-full text-sm outline-none transition-all w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="h-8 w-px bg-slate-200 mx-2"></div>
                        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button
                                onClick={handleEnableAll}
                                className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-white rounded-md transition-all shadow-sm flex items-center gap-2"
                            >
                                <Eye size={14} /> Enable All
                            </button>
                            <div className="w-px bg-slate-300 my-1"></div>
                            <button
                                onClick={handleDisableAll}
                                className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-white rounded-md transition-all shadow-sm flex items-center gap-2"
                            >
                                <EyeOff size={14} /> Disable All
                            </button>
                        </div>
                    </>
                    )}
                    <div className="h-8 w-px bg-slate-200 mx-2"></div>
                    <UserMenuWrapper />
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="px-8 pt-6 pb-0 flex-shrink-0 bg-white border-b border-slate-200">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('visibility')}
                        className={`
                            pb-3 text-sm font-semibold flex items-center gap-2 transition-all border-b-2
                            ${activeTab === 'visibility'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                        `}
                    >
                        <Layers size={18} />
                        Element Visibility
                    </button>
                    <button
                        onClick={() => setActiveTab('datablocks')}
                        className={`
                            pb-3 text-sm font-semibold flex items-center gap-2 transition-all border-b-2
                            ${activeTab === 'datablocks'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                        `}
                    >
                        <Database size={18} />
                        Data Blocks
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 p-8 overflow-hidden bg-slate-50/50">
                {activeTab === 'visibility' && (
                    <div className="h-full overflow-y-auto pr-2 pb-20 custom-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                            {elementsByLayer.map((group) => (
                                <div
                                    key={group.layer}
                                    className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300"
                                >
                                    {/* Card Header with Color Accent */}
                                    <div
                                        className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-white to-slate-50"
                                        style={{ borderTop: `4px solid ${getColorForLayer(group.layer)}` }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full shadow-sm ring-1 ring-slate-900/10"
                                                style={{ backgroundColor: getColorForLayer(group.layer) }}
                                            />
                                            <h3 className="font-bold text-slate-800 capitalize text-base">
                                                {group.layer} Layer
                                            </h3>
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                                            {group.items.length}
                                        </span>
                                    </div>

                                    {/* Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Element</th>
                                                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px] text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {group.items.map((item) => {
                                                    const isEnabled = enabledElementTypes.includes(item.id);
                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            onClick={() => handleToggleElement(item.id)}
                                                            className={`
                                                                cursor-pointer transition-colors group
                                                                ${isEnabled ? 'hover:bg-blue-50/50' : 'hover:bg-slate-50 bg-slate-50/30'}
                                                            `}
                                                        >
                                                            <td className="px-5 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div
                                                                        className={`
                                                                            w-8 h-6 rounded border shadow-sm flex items-center justify-center transition-all
                                                                            ${isEnabled ? 'opacity-100' : 'opacity-50 grayscale'}
                                                                        `}
                                                                        style={{
                                                                            backgroundColor: item.color,
                                                                            borderColor: 'rgba(0,0,0,0.1)'
                                                                        }}
                                                                    >
                                                                        {/* Optional: Add icon if defined in metamodel */}
                                                                    </div>
                                                                    <div>
                                                                        <span className={`
                                                                            font-medium block text-sm transition-colors
                                                                            ${isEnabled ? 'text-slate-700' : 'text-slate-400 decoration-slate-300 line-through decoration-1'}
                                                                        `}>
                                                                            {item.name}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-3 text-right text-right">
                                                                <div className="flex justify-end">
                                                                    <div className={`
                                                                        w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center
                                                                        ${isEnabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'}
                                                                     `}>
                                                                        <div className="w-4 h-4 bg-white rounded-full shadow-sm mx-0.5" />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'datablocks' && (
                    <div className="h-full bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
                        <DataBlockManager />
                    </div>
                )}
            </main>
        </div>
    );
}
