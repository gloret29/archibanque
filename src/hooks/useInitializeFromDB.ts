'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

/**
 * Hook to initialize data from the database on component mount.
 * Should be called once in the root layout or main page components.
 */
export function useInitializeFromDB() {
    const {
        settingsLoaded,
        dataBlocksLoaded,
        loadSettingsFromDB,
        loadDataBlocksFromDB
    } = useEditorStore();

    useEffect(() => {
        // Load settings if not already loaded
        if (!settingsLoaded) {
            loadSettingsFromDB();
        }
    }, [settingsLoaded, loadSettingsFromDB]);

    useEffect(() => {
        // Load data blocks if not already loaded
        if (!dataBlocksLoaded) {
            loadDataBlocksFromDB();
        }
    }, [dataBlocksLoaded, loadDataBlocksFromDB]);

    return { settingsLoaded, dataBlocksLoaded };
}
