import type { Node } from '@xyflow/react';
import type { ResourceField } from '../types/terrain';
import { ResourceType } from '../types/terrain';
import { GAME_CONFIG } from '../config/game.config';

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

        // Generate fields for each resource type based on config
        Object.entries(GAME_CONFIG.resourceCount).forEach(([resourceType, count]) => {
            for (let i = 0; i < count; i++) {
                const field = this.generateRandomResourceField(resourceType as ResourceType, fields);
                fields.push(field);
            }
        });

        return fields;
    }

    /**
     * Generates a random resource field with collision detection
     */
    private static generateRandomResourceField(type: ResourceType, existingFields: ResourceField[]): ResourceField {
        const maxAttempts = 100;
        let attempts = 0;

        while (attempts < maxAttempts) {
            // Generate random position within map bounds
            const x = Math.random() * (GAME_CONFIG.mapWidth - GAME_CONFIG.resourceFieldSize.maxWidth);
            const y = Math.random() * (GAME_CONFIG.mapHeight - GAME_CONFIG.resourceFieldSize.maxHeight);

            // Generate random size within config bounds
            const width = GAME_CONFIG.resourceFieldSize.minWidth +
                Math.random() * (GAME_CONFIG.resourceFieldSize.maxWidth - GAME_CONFIG.resourceFieldSize.minWidth);
            const height = GAME_CONFIG.resourceFieldSize.minHeight +
                Math.random() * (GAME_CONFIG.resourceFieldSize.maxHeight - GAME_CONFIG.resourceFieldSize.minHeight);

            // Generate random intensity
            const intensity = GAME_CONFIG.resourceIntensity.min +
                Math.random() * (GAME_CONFIG.resourceIntensity.max - GAME_CONFIG.resourceIntensity.min);

            const newField: ResourceField = {
                id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type,
                x,
                y,
                width,
                height,
                intensity,
            };

            // Check for collisions with existing fields
            if (!this.checkCollision(newField, existingFields)) {
                return newField;
            }

            attempts++;
        }

        // Fallback: place at a safe position if random placement fails
        return {
            id: `${type}-fallback-${Date.now()}`,
            type,
            x: GAME_CONFIG.mapWidth / 2,
            y: GAME_CONFIG.mapHeight / 2,
            width: GAME_CONFIG.resourceFieldSize.minWidth,
            height: GAME_CONFIG.resourceFieldSize.minHeight,
            intensity: GAME_CONFIG.resourceIntensity.min,
        };
    }

    /**
     * Checks if a resource field collides with any existing fields
     */
    private static checkCollision(newField: ResourceField, existingFields: ResourceField[]): boolean {
        const buffer = 20; // Minimum distance between fields

        return existingFields.some(existing => {
            return !(
                newField.x + newField.width + buffer < existing.x ||
                existing.x + existing.width + buffer < newField.x ||
                newField.y + newField.height + buffer < existing.y ||
                existing.y + existing.height + buffer < newField.y
            );
        });
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
