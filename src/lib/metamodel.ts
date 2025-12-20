export type ArchimateLayer = 'strategy' | 'business' | 'application' | 'technology' | 'physical' | 'implementation' | 'motivation' | 'other';

export interface ArchimateElementType {
    id: string;
    name: string;
    layer: ArchimateLayer;
    color: string;
    icon?: string;
}

export const ARCHIMATE_METAMODEL: Record<string, ArchimateElementType> = {
    // Business Layer
    'business-actor': { id: 'business-actor', name: 'Business Actor', layer: 'business', color: '#ffffcc' },
    'business-role': { id: 'business-role', name: 'Business Role', layer: 'business', color: '#ffffcc' },
    'business-process': { id: 'business-process', name: 'Business Process', layer: 'business', color: '#ffffcc' },
    'business-function': { id: 'business-function', name: 'Business Function', layer: 'business', color: '#ffffcc' },
    'business-object': { id: 'business-object', name: 'Business Object', layer: 'business', color: '#ffffcc' },

    // Application Layer
    'application-component': { id: 'application-component', name: 'Application Component', layer: 'application', color: '#b2ccff' },
    'application-function': { id: 'application-function', name: 'Application Function', layer: 'application', color: '#b2ccff' },
    'application-service': { id: 'application-service', name: 'Application Service', layer: 'application', color: '#b2ccff' },
    'data-object': { id: 'data-object', name: 'Data Object', layer: 'application', color: '#b2ccff' },

    // Technology Layer
    'node': { id: 'node', name: 'Node', layer: 'technology', color: '#ccffcc' },
    'system-software': { id: 'system-software', name: 'System Software', layer: 'technology', color: '#ccffcc' },
    'technology-service': { id: 'technology-service', name: 'Technology Service', layer: 'technology', color: '#ccffcc' },
    'artifact': { id: 'artifact', name: 'Artifact', layer: 'technology', color: '#ccffcc' },

    // Strategy Layer
    'capability': { id: 'capability', name: 'Capability', layer: 'strategy', color: '#f5deaa' },
    'resource': { id: 'resource', name: 'Resource', layer: 'strategy', color: '#f5deaa' },

    // Motivation Layer
    'goal': { id: 'goal', name: 'Goal', layer: 'motivation', color: '#ccccff' },
    'outcome': { id: 'outcome', name: 'Outcome', layer: 'motivation', color: '#ccccff' },
    'driver': { id: 'driver', name: 'Driver', layer: 'motivation', color: '#ccccff' },
};

export const getColorForLayer = (layer: ArchimateLayer): string => {
    switch (layer) {
        case 'strategy': return '#f5deaa';
        case 'business': return '#ffffcc';
        case 'application': return '#b2ccff';
        case 'technology':
        case 'physical': return '#ccffcc';
        case 'implementation': return '#ffe0e0';
        case 'motivation': return '#ccccff';
        default: return '#f0f0f0';
    }
};
