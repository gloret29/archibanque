import { DataBlock, DataBlockAttribute } from '@/store/useEditorStore';

const API_BASE = '/api';

// ============ Data Blocks ============

export const dataBlocksApi = {
    async getAll(): Promise<DataBlock[]> {
        const res = await fetch(`${API_BASE}/datablocks`);
        if (!res.ok) throw new Error('Failed to fetch data blocks');
        return res.json();
    },

    async create(name: string): Promise<DataBlock> {
        const res = await fetch(`${API_BASE}/datablocks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, targetTypes: [], attributes: [] })
        });
        if (!res.ok) throw new Error('Failed to create data block');
        return res.json();
    },

    async update(id: string, data: Partial<Pick<DataBlock, 'name' | 'targetTypes'>>): Promise<DataBlock> {
        const res = await fetch(`${API_BASE}/datablocks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update data block');
        return res.json();
    },

    async delete(id: string): Promise<void> {
        const res = await fetch(`${API_BASE}/datablocks/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete data block');
    },

    async addAttribute(blockId: string, attr: Omit<DataBlockAttribute, 'id'>): Promise<DataBlockAttribute> {
        const res = await fetch(`${API_BASE}/datablocks/${blockId}/attributes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attr)
        });
        if (!res.ok) throw new Error('Failed to add attribute');
        return res.json();
    },

    async updateAttribute(blockId: string, attrId: string, data: Partial<DataBlockAttribute>): Promise<DataBlockAttribute> {
        const res = await fetch(`${API_BASE}/datablocks/${blockId}/attributes/${attrId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update attribute');
        return res.json();
    },

    async deleteAttribute(blockId: string, attrId: string): Promise<void> {
        const res = await fetch(`${API_BASE}/datablocks/${blockId}/attributes/${attrId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete attribute');
    }
};

// ============ Settings ============

export interface AppSettings {
    enabledElementTypes: string[];
}

export const settingsApi = {
    async get(): Promise<AppSettings> {
        const res = await fetch(`${API_BASE}/settings`);
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
    },

    async update(data: Partial<AppSettings>): Promise<AppSettings> {
        const res = await fetch(`${API_BASE}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update settings');
        return res.json();
    }
};
