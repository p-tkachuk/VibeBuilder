import { useState, useMemo, useEffect } from 'react';
import type { Node } from '@xyflow/react';
import { ResourceFieldService } from '../services/ResourceFieldService';
import { isPositionInResourceField } from '../utils/position.utils';
import type { ResourceField } from '../types/terrain';
import { ResourceType } from '../types/terrain';

/**
 * Custom hook for managing resource fields
 * Follows Single Responsibility Principle - only handles resource field state and operations
 */
export const useResourceFields = (initialResourceFields?: ResourceField[]) => {
    const [resourceFields, setResourceFields] = useState<ResourceField[]>(() =>
        initialResourceFields || ResourceFieldService.generateResourceFields()
    );

    // Update resource fields when initialResourceFields changes (for loading saved games)
    useEffect(() => {
        if (initialResourceFields) {
            setResourceFields(initialResourceFields);
        }
    }, [initialResourceFields]);

    // Convert resource fields to React Flow nodes
    const resourceNodes: Node[] = useMemo(() => {
        return ResourceFieldService.convertToNodes(resourceFields);
    }, [resourceFields]);

    // Check if a position is within a resource field
    const checkPositionInResourceField = useMemo(
        () => (x: number, y: number, resourceType?: ResourceType): boolean => {
            return isPositionInResourceField({ x, y }, resourceFields, resourceType);
        },
        [resourceFields]
    );

    return {
        resourceFields,
        resourceNodes,
        checkPositionInResourceField,
    };
};
