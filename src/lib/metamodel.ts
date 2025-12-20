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

export type RelationshipType =
    | 'composition' | 'aggregation' | 'assignment' | 'realization'
    | 'serving' | 'access' | 'influence' | 'association'
    | 'triggering' | 'flow' | 'specialization';

export interface ArchimateRelationType {
    id: RelationshipType;
    name: string;
    lineStyle: 'solid' | 'dashed' | 'dotted';
    arrowHead: 'none' | 'arrow' | 'triangle' | 'filled-arrow' | 'filled-triangle';
    startMarker?: 'diamond' | 'open-diamond' | 'circle';
}

export const ARCHIMATE_RELATIONS: Record<RelationshipType, ArchimateRelationType> = {
    composition: { id: 'composition', name: 'Composition', lineStyle: 'solid', arrowHead: 'none', startMarker: 'diamond' },
    aggregation: { id: 'aggregation', name: 'Aggregation', lineStyle: 'solid', arrowHead: 'none', startMarker: 'open-diamond' },
    assignment: { id: 'assignment', name: 'Assignment', lineStyle: 'solid', arrowHead: 'arrow', startMarker: 'circle' },
    realization: { id: 'realization', name: 'Realization', lineStyle: 'dashed', arrowHead: 'triangle' },
    serving: { id: 'serving', name: 'Serving', lineStyle: 'solid', arrowHead: 'arrow' },
    access: { id: 'access', name: 'Access', lineStyle: 'dotted', arrowHead: 'arrow' },
    influence: { id: 'influence', name: 'Influence', lineStyle: 'dashed', arrowHead: 'arrow' },
    association: { id: 'association', name: 'Association', lineStyle: 'solid', arrowHead: 'none' },
    triggering: { id: 'triggering', name: 'Triggering', lineStyle: 'solid', arrowHead: 'filled-arrow' },
    flow: { id: 'flow', name: 'Flow', lineStyle: 'dashed', arrowHead: 'filled-arrow' },
    specialization: { id: 'specialization', name: 'Specialization', lineStyle: 'solid', arrowHead: 'triangle' },
};
