'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useEditorStore } from './useEditorStore';

// This provider ensures the store is only accessed client-side
// to avoid the "getSnapshot should be cached" error from Zundo/temporal

interface EditorStoreContextType {
    isReady: boolean;
}

const EditorStoreContext = createContext<EditorStoreContextType>({ isReady: false });

export function EditorStoreProvider({ children }: { children: ReactNode }) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Small delay to ensure hydration is complete
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 10);
        return () => clearTimeout(timer);
    }, []);

    return (
        <EditorStoreContext.Provider value={{ isReady }}>
            {children}
        </EditorStoreContext.Provider>
    );
}

export function useEditorStoreReady() {
    return useContext(EditorStoreContext);
}

// Safe wrapper hook that returns null values during SSR
export function useSafeEditorStore() {
    const { isReady } = useEditorStoreReady();
    const store = useEditorStore();

    if (!isReady) {
        return null;
    }

    return store;
}
