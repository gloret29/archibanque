'use client';

import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

/**
 * Hook that automatically persists the editor state to the server
 * when folders, views, elements or relations change, with debouncing.
 */
export function useAutoSave(debounceMs = 3000) {
    const {
        folders,
        views,
        elements,
        relations,
        currentPackageId,
        saveToServer,
        isSaving,
        isLoading
    } = useEditorStore();

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialMount = useRef(true);

    useEffect(() => {
        // Don't auto-save on the very first mount or if we're currently loading/saving
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (!currentPackageId || isLoading) return;

        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set a new debounced save
        timeoutRef.current = setTimeout(() => {
            console.log('🔄 Auto-saving model to server...');
            saveToServer();
        }, debounceMs);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [folders, views, elements, relations, currentPackageId, debounceMs, saveToServer, isLoading]);

    return { isSaving };
}
