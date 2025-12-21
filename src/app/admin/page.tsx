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
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminPage() {
    const {
        enabledElementTypes,
        toggleElementType,
        enableAllElementTypes,
        disableAllElementTypes
    } = useEditorStore();
    const { t } = useLanguage();

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
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] transition-colors">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <p className="text-slate-600 dark:text-[#a1a1aa] transition-colors">Loading configuration...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-50 dark:bg-[#1e1e1e] flex flex-col font-sans overflow-hidden transition-colors">
            {/* Header */}
            <header className="bg-white dark:bg-[#27272a] border-b border-slate-200 dark:border-[#3f3f46] px-8 py-4 flex items-center justify-between shadow-sm z-20 flex-shrink-0 transition-colors">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 group decoration-0">
                        <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm group-hover:bg-blue-700 transition-colors">
                            <span className="text-xl leading-none">💎</span>
                        </div>
                        <span className="font-bold text-xl text-slate-800 dark:text-[#e4e4e7] tracking-tight transition-colors">ArchiModeler</span>
                    </Link>

                    <div className="h-8 w-px bg-slate-200 dark:bg-[#3f3f46] transition-colors"></div>

                    <div className="flex items-center gap-4">
                        <Link href="/modeler" className="p-2 hover:bg-slate-100 dark:hover:bg-[#3f3f46] text-slate-500 dark:text-[#a1a1aa] hover:text-slate-800 dark:hover:text-[#e4e4e7] rounded-full transition-colors" title={t('admin.back')}>
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-[#e4e4e7] leading-tight transition-colors">{t('admin.title')}</h1>
                            <p className="text-xs text-slate-500 dark:text-[#a1a1aa] font-medium uppercase tracking-wide transition-colors">{t('admin.subtitle')}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {activeTab === 'visibility' && (
                        <>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#71717a]" size={16} />
                            <input
                                type="text"
                                placeholder={t('admin.search.placeholder')}
                                className="pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-[#3f3f46] border-transparent focus:bg-white dark:focus:bg-[#27272a] focus:border-blue-500 border rounded-full text-sm outline-none transition-all w-64 text-slate-900 dark:text-[#e4e4e7] placeholder:text-slate-400 dark:placeholder:text-[#71717a]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-[#3f3f46] mx-2 transition-colors"></div>
                        <div className="flex gap-2 bg-slate-100 dark:bg-[#3f3f46] p-1 rounded-lg border border-slate-200 dark:border-[#3f3f46] transition-colors">
                            <button
                                onClick={handleEnableAll}
                                className="px-3 py-1 text-xs font-semibold text-slate-600 dark:text-[#a1a1aa] hover:text-blue-600 hover:bg-white dark:hover:bg-[#27272a] rounded-md transition-all shadow-sm flex items-center gap-2"
                            >
                                <Eye size={14} /> {t('admin.button.enableAll')}
                            </button>
                            <div className="w-px bg-slate-300 dark:bg-[#52525b] my-1 transition-colors"></div>
                            <button
                                onClick={handleDisableAll}
                                className="px-3 py-1 text-xs font-semibold text-slate-600 dark:text-[#a1a1aa] hover:text-red-600 hover:bg-white dark:hover:bg-[#27272a] rounded-md transition-all shadow-sm flex items-center gap-2"
                            >
                                <EyeOff size={14} /> {t('admin.button.disableAll')}
                            </button>
                        </div>
                    </>
                    )}
                    <div className="h-8 w-px bg-slate-200 dark:bg-[#3f3f46] mx-2 transition-colors"></div>
                    <UserMenuWrapper />
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="px-8 pt-6 pb-0 flex-shrink-0 bg-white dark:bg-[#27272a] border-b border-slate-200 dark:border-[#3f3f46] transition-colors">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('visibility')}
                        className={`
                            pb-3 text-sm font-semibold flex items-center gap-2 transition-all border-b-2
                            ${activeTab === 'visibility'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                : 'border-transparent text-slate-500 dark:text-[#a1a1aa] hover:text-slate-700 dark:hover:text-[#e4e4e7] hover:border-slate-300 dark:hover:border-[#52525b]'}
                        `}
                    >
                        <Layers size={18} />
                        {t('admin.tab.visibility')}
                    </button>
                    <button
                        onClick={() => setActiveTab('datablocks')}
                        className={`
                            pb-3 text-sm font-semibold flex items-center gap-2 transition-all border-b-2
                            ${activeTab === 'datablocks'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                : 'border-transparent text-slate-500 dark:text-[#a1a1aa] hover:text-slate-700 dark:hover:text-[#e4e4e7] hover:border-slate-300 dark:hover:border-[#52525b]'}
                        `}
                    >
                        <Database size={18} />
                        {t('admin.tab.datablocks')}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 p-8 overflow-hidden bg-slate-50/50 dark:bg-[#18181b] transition-colors">
                {activeTab === 'visibility' && (
                    <div className="h-full overflow-y-auto pr-2 pb-20 custom-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                            {elementsByLayer.map((group) => (
                                <div
                                    key={group.layer}
                                    className="bg-white dark:bg-[#27272a] rounded-xl shadow-sm border border-slate-200 dark:border-[#3f3f46] overflow-hidden flex flex-col hover:shadow-md transition-all duration-300"
                                >
                                    {/* Card Header with Color Accent */}
                                    <div
                                        className="px-5 py-4 border-b border-slate-100 dark:border-[#3f3f46] flex justify-between items-center bg-gradient-to-r from-white to-slate-50 dark:from-[#27272a] dark:to-[#3f3f46] transition-colors"
                                        style={{ borderTop: `4px solid ${getColorForLayer(group.layer)}` }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full shadow-sm ring-1 ring-slate-900/10 dark:ring-white/10"
                                                style={{ backgroundColor: getColorForLayer(group.layer) }}
                                            />
                                            <h3 className="font-bold text-slate-800 dark:text-[#e4e4e7] capitalize text-base transition-colors">
                                                {group.layer} Layer
                                            </h3>
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 dark:text-[#a1a1aa] bg-slate-100 dark:bg-[#3f3f46] px-2.5 py-1 rounded-full border border-slate-200 dark:border-[#3f3f46] transition-colors">
                                            {group.items.length}
                                        </span>
                                    </div>

                                    {/* Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 dark:bg-[#3f3f46] text-slate-500 dark:text-[#a1a1aa] border-b border-slate-200 dark:border-[#3f3f46] transition-colors">
                                                <tr>
                                                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Element</th>
                                                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px] text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
                                                {group.items.map((item) => {
                                                    const isEnabled = enabledElementTypes.includes(item.id);
                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            onClick={() => handleToggleElement(item.id)}
                                                            className={`
                                                                cursor-pointer transition-colors group
                                                                ${isEnabled ? 'hover:bg-blue-50/50 dark:hover:bg-[#1e3a5f]' : 'hover:bg-slate-50 dark:hover:bg-[#3f3f46] bg-slate-50/30 dark:bg-[#27272a]'}
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
                                                                            ${isEnabled ? 'text-slate-700 dark:text-[#e4e4e7]' : 'text-slate-400 dark:text-[#71717a] decoration-slate-300 dark:decoration-[#52525b] line-through decoration-1'}
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
                                                                        ${isEnabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-[#52525b] justify-start'}
                                                                     `}>
                                                                        <div className="w-4 h-4 bg-white dark:bg-[#e4e4e7] rounded-full shadow-sm mx-0.5" />
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
                    <div className="h-full bg-white dark:bg-[#27272a] rounded-xl border border-slate-200 dark:border-[#3f3f46] shadow-sm p-6 overflow-hidden transition-colors">
                        <DataBlockManager />
                    </div>
                )}
            </main>
        </div>
    );
}
