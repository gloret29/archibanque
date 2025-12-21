export type ArchimateLayer = 'strategy' | 'business' | 'application' | 'technology' | 'physical' | 'implementation' | 'motivation' | 'other';

export interface ArchimateElementType {
    id: string;
    name: string;
    layer: ArchimateLayer;
    color: string;
    icon?: string;
}

export const ARCHIMATE_METAMODEL: Record<string, ArchimateElementType> = {
    // STRATEGY LAYER
    'resource': { id: 'resource', name: 'Resource', layer: 'strategy', color: '#f5deaa' },
    'capability': { id: 'capability', name: 'Capability', layer: 'strategy', color: '#f5deaa' },
    'course-of-action': { id: 'course-of-action', name: 'Course of Action', layer: 'strategy', color: '#f5deaa' },
    'value-stream': { id: 'value-stream', name: 'Value Stream', layer: 'strategy', color: '#f5deaa' },

    // BUSINESS LAYER
    'business-actor': { id: 'business-actor', name: 'Business Actor', layer: 'business', color: '#ffffcc' },
    'business-role': { id: 'business-role', name: 'Business Role', layer: 'business', color: '#ffffcc' },
    'business-collaboration': { id: 'business-collaboration', name: 'Business Collaboration', layer: 'business', color: '#ffffcc' },
    'business-interface': { id: 'business-interface', name: 'Business Interface', layer: 'business', color: '#ffffcc' },
    'business-process': { id: 'business-process', name: 'Business Process', layer: 'business', color: '#ffffcc' },
    'business-function': { id: 'business-function', name: 'Business Function', layer: 'business', color: '#ffffcc' },
    'business-interaction': { id: 'business-interaction', name: 'Business Interaction', layer: 'business', color: '#ffffcc' },
    'business-event': { id: 'business-event', name: 'Business Event', layer: 'business', color: '#ffffcc' },
    'business-service': { id: 'business-service', name: 'Business Service', layer: 'business', color: '#ffffcc' },
    'business-object': { id: 'business-object', name: 'Business Object', layer: 'business', color: '#ffffcc' },
    'contract': { id: 'contract', name: 'Contract', layer: 'business', color: '#ffffcc' },
    'representation': { id: 'representation', name: 'Representation', layer: 'business', color: '#ffffcc' },
    'product': { id: 'product', name: 'Product', layer: 'business', color: '#ffffcc' },

    // APPLICATION LAYER
    'application-component': { id: 'application-component', name: 'Application Component', layer: 'application', color: '#b2ccff' },
    'application-collaboration': { id: 'application-collaboration', name: 'Application Collaboration', layer: 'application', color: '#b2ccff' },
    'application-interface': { id: 'application-interface', name: 'Application Interface', layer: 'application', color: '#b2ccff' },
    'application-function': { id: 'application-function', name: 'Application Function', layer: 'application', color: '#b2ccff' },
    'application-interaction': { id: 'application-interaction', name: 'Application Interaction', layer: 'application', color: '#b2ccff' },
    'application-process': { id: 'application-process', name: 'Application Process', layer: 'application', color: '#b2ccff' },
    'application-event': { id: 'application-event', name: 'Application Event', layer: 'application', color: '#b2ccff' },
    'application-service': { id: 'application-service', name: 'Application Service', layer: 'application', color: '#b2ccff' },
    'data-object': { id: 'data-object', name: 'Data Object', layer: 'application', color: '#b2ccff' },

    // TECHNOLOGY LAYER
    'node': { id: 'node', name: 'Node', layer: 'technology', color: '#ccffcc' },
    'device': { id: 'device', name: 'Device', layer: 'technology', color: '#ccffcc' },
    'system-software': { id: 'system-software', name: 'System Software', layer: 'technology', color: '#ccffcc' },
    'technology-collaboration': { id: 'technology-collaboration', name: 'Technology Collaboration', layer: 'technology', color: '#ccffcc' },
    'technology-interface': { id: 'technology-interface', name: 'Technology Interface', layer: 'technology', color: '#ccffcc' },
    'path': { id: 'path', name: 'Path', layer: 'technology', color: '#ccffcc' },
    'communication-network': { id: 'communication-network', name: 'Communication Network', layer: 'technology', color: '#ccffcc' },
    'technology-function': { id: 'technology-function', name: 'Technology Function', layer: 'technology', color: '#ccffcc' },
    'technology-process': { id: 'technology-process', name: 'Technology Process', layer: 'technology', color: '#ccffcc' },
    'technology-interaction': { id: 'technology-interaction', name: 'Technology Interaction', layer: 'technology', color: '#ccffcc' },
    'technology-event': { id: 'technology-event', name: 'Technology Event', layer: 'technology', color: '#ccffcc' },
    'technology-service': { id: 'technology-service', name: 'Technology Service', layer: 'technology', color: '#ccffcc' },
    'artifact': { id: 'artifact', name: 'Artifact', layer: 'technology', color: '#ccffcc' },

    // PHYSICAL LAYER
    'equipment': { id: 'equipment', name: 'Equipment', layer: 'physical', color: '#ccffcc' },
    'facility': { id: 'facility', name: 'Facility', layer: 'physical', color: '#ccffcc' },
    'distribution-network': { id: 'distribution-network', name: 'Distribution Network', layer: 'physical', color: '#ccffcc' },
    'material': { id: 'material', name: 'Material', layer: 'physical', color: '#ccffcc' },

    // MOTIVATION LAYER
    'stakeholder': { id: 'stakeholder', name: 'Stakeholder', layer: 'motivation', color: '#ccccff' },
    'driver': { id: 'driver', name: 'Driver', layer: 'motivation', color: '#ccccff' },
    'assessment': { id: 'assessment', name: 'Assessment', layer: 'motivation', color: '#ccccff' },
    'goal': { id: 'goal', name: 'Goal', layer: 'motivation', color: '#ccccff' },
    'outcome': { id: 'outcome', name: 'Outcome', layer: 'motivation', color: '#ccccff' },
    'principle': { id: 'principle', name: 'Principle', layer: 'motivation', color: '#ccccff' },
    'requirement': { id: 'requirement', name: 'Requirement', layer: 'motivation', color: '#ccccff' },
    'constraint': { id: 'constraint', name: 'Constraint', layer: 'motivation', color: '#ccccff' },
    'meaning': { id: 'meaning', name: 'Meaning', layer: 'motivation', color: '#ccccff' },
    'value': { id: 'value', name: 'Value', layer: 'motivation', color: '#ccccff' },

    // IMPLEMENTATION & MIGRATION LAYER
    'work-package': { id: 'work-package', name: 'Work Package', layer: 'implementation', color: '#ffe0e0' },
    'deliverable': { id: 'deliverable', name: 'Deliverable', layer: 'implementation', color: '#ffe0e0' },
    'implementation-event': { id: 'implementation-event', name: 'Implementation Event', layer: 'implementation', color: '#ffe0e0' },
    'plateau': { id: 'plateau', name: 'Plateau', layer: 'implementation', color: '#ffe0e0' },
    'gap': { id: 'gap', name: 'Gap', layer: 'implementation', color: '#ffe0e0' },

    // OTHER
    'location': { id: 'location', name: 'Location', layer: 'other', color: '#f5deaa' },
    'group': { id: 'group', name: 'Group', layer: 'other', color: '#f5f5f5' },
    'junction': { id: 'junction', name: 'Junction', layer: 'other', color: '#000000' },
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
        case 'other': return '#f5f5f5';
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

/**
 * ARCHIMATE VALIDATION ENGINE (Simplified)
 * Based on ArchiMate 3.2 specification rules
 */

export const canConnect = (
    sourceType: string,
    targetType: string,
    relationship: RelationshipType
): boolean => {
    // Association is always allowed in ArchiMate as a fallback
    if (relationship === 'association') return true;

    // Grouping can connect to anything or anything to group
    if (sourceType === 'group' || targetType === 'group') return true;

    const sourceMeta = ARCHIMATE_METAMODEL[sourceType];
    const targetMeta = ARCHIMATE_METAMODEL[targetType];

    if (!sourceMeta || !targetMeta) return false;

    // Layer-based rules (Simplified)
    // 1. Specialization: Same type or strictly related
    if (relationship === 'specialization') {
        return sourceMeta.id === targetMeta.id || sourceMeta.layer === targetMeta.layer;
    }

    // 2. Composition/Aggregation: Hierarchy (Downwards or within same layer)
    if (relationship === 'composition' || relationship === 'aggregation') {
        if (sourceMeta.layer === 'other' || targetMeta.layer === 'other') return true;

        const layers = ['strategy', 'motivation', 'business', 'application', 'technology', 'physical', 'implementation'];
        const sourceIdx = layers.indexOf(sourceMeta.layer);
        const targetIdx = layers.indexOf(targetMeta.layer);
        return sourceIdx <= targetIdx;
    }

    // 3. Realization: Upwards (e.g., Application realizes Business)
    if (relationship === 'realization') {
        const layersOrder = { 'physical': 0, 'technology': 1, 'application': 2, 'business': 3, 'strategy': 4, 'motivation': 5 };
        // @ts-expect-error: dynamic property access on layersOrder
        return layersOrder[sourceMeta.layer] < layersOrder[targetMeta.layer] || sourceMeta.layer === targetMeta.layer;
    }

    return true; // Default to true for now to avoid blocking users
};

export const getValidRelationships = (sourceType: string, targetType: string): RelationshipType[] => {
    return (Object.keys(ARCHIMATE_RELATIONS) as RelationshipType[]).filter(rel =>
        canConnect(sourceType, targetType, rel)
    );
};

/**
 * DERIVED RELATIONSHIPS ENGINE
 * Based on the ArchiMate derivation rule: A -> r1 -> B -> r2 -> C => A -> r3 -> C
 * where r3 is the weakest relationship in the chain.
 */
export const RELATIONSHIP_STRENGTH: Record<RelationshipType, number> = {
    composition: 10,
    aggregation: 9,
    assignment: 8,
    realization: 7,
    serving: 6,
    access: 5,
    influence: 4,
    triggering: 3,
    flow: 2,
    specialization: 1,
    association: 0,
};

export const getDerivedRelationship = (rel1: RelationshipType, rel2: RelationshipType): RelationshipType => {
    const s1 = RELATIONSHIP_STRENGTH[rel1] ?? 0;
    const s2 = RELATIONSHIP_STRENGTH[rel2] ?? 0;

    const weakerScore = Math.min(s1, s2);
    const result = Object.entries(RELATIONSHIP_STRENGTH).find(([, score]) => score === weakerScore);
    return (result?.[0] as RelationshipType) || 'association';
};
