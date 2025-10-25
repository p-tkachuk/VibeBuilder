import type { Node } from '@xyflow/react';
import type { ResourceField } from '../types/terrain';
import { ResourceType } from '../types/terrain';

/**
 * Service for managing resource field operations
 * Follows Single Responsibility Principle - only handles resource field logic
 */
export class ResourceFieldService {
    /**
     * Generates initial resource fields for the game
     */
    static generateResourceFields(): ResourceField[] {
        const fields: ResourceField[] = [];

        // Iron ore fields
        fields.push(
            {
                id: 'iron-ore-1',
                type: ResourceType.IRON_ORE,
                x: 200,
                y: 150,
                width: 200,
                height: 120,
                intensity: 0.8,
            },
            {
                id: 'iron-ore-2',
                type: ResourceType.IRON_ORE,
                x: 600,
                y: 300,
                width: 150,
                height: 100,
                intensity: 0.6,
            }
        );

        // Coal fields
        fields.push({
            id: 'coal-1',
            type: ResourceType.COAL,
            x: 100,
            y: 400,
            width: 180,
            height: 140,
            intensity: 0.7,
        });

        // Copper ore fields
        fields.push({
            id: 'copper-ore-1',
            type: ResourceType.COPPER_ORE,
            x: 500,
            y: 100,
            width: 160,
            height: 80,
            intensity: 0.9,
        });

        // Stone fields
        fields.push({
            id: 'stone-1',
            type: ResourceType.STONE,
            x: 800,
            y: 200,
            width: 120,
            height: 90,
            intensity: 0.5,
        });

        return fields;
    }

    /**
     * Converts resource fields to React Flow nodes
     */
    static convertToNodes(resourceFields: ResourceField[]): Node[] {
        return resourceFields.map((field) => ({
            id: field.id,
            type: 'resource',
            position: { x: field.x, y: field.y },
            data: {
                resourceType: field.type,
                width: field.width,
                height: field.height,
                intensity: field.intensity,
            },
            draggable: false,
            selectable: false,
            deletable: false,
        }));
    }
}
