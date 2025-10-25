import type { Node, NodeChange } from '@xyflow/react';
import { BUILDING_WIDTH, BUILDING_HEIGHT } from '../constants/game.constants';
import { GAME_CONFIG } from '../config/game.config';
import { snapToGrid, getBuildingCenter, doRectanglesOverlap } from '../utils/position.utils';
import type { ResourceField } from '../types/terrain';

/**
 * Service for validating and processing node changes in React Flow
 * Handles position snapping, collision detection, and map boundary checks
 * Follows Single Responsibility Principle - only handles node validation
 */
export class NodeValidationService {
    /**
     * Filters node changes to ensure valid building movements
     */
    static processNodeChanges(
        changes: NodeChange[],
        resourceFields: ResourceField[],
        allNodes: Node[]
    ): NodeChange[] {
        return changes.filter(change => {
            if (!('id' in change)) {
                return true;
            }

            // Skip resource nodes and map border
            if (resourceFields.some(field => field.id === change.id) || change.id === 'map-border') {
                return false;
            }

            // For position changes, validate and snap to grid
            if (change.type === 'position' && change.position) {
                return this.validatePositionChange(change as any, allNodes.filter(node => node.id !== change.id));
            }

            // Allow other valid changes
            return true;
        });
    }

    /**
     * Validates a position change for a building node
     */
    private static validatePositionChange(
        change: { id: string; position: { x: number; y: number } },
        otherNodes: Node[]
    ): boolean {
        // Snap position to grid and center building
        const newCenter = getBuildingCenter(change.position);
        const snappedCenter = snapToGrid(newCenter);
        change.position = {
            x: snappedCenter.x - BUILDING_WIDTH / 2,
            y: snappedCenter.y - BUILDING_HEIGHT / 2,
        };

        const { mapWidth, mapHeight } = GAME_CONFIG;
        const newX = change.position.x;
        const newY = change.position.y;

        // Check map boundaries
        if (
            newX < 0 ||
            newY < 0 ||
            newX + BUILDING_WIDTH > mapWidth ||
            newY + BUILDING_HEIGHT > mapHeight
        ) {
            return false;
        }

        // Check collision with other buildings
        const proposedRect = {
            x: newX,
            y: newY,
            width: BUILDING_WIDTH,
            height: BUILDING_HEIGHT,
        };

        return !otherNodes.some(node => {
            if (node.type !== 'building') return false;

            const existingRect = {
                x: node.position.x,
                y: node.position.y,
                width: BUILDING_WIDTH,
                height: BUILDING_HEIGHT,
            };

            return doRectanglesOverlap(proposedRect, existingRect);
        });
    }

    /**
     * Checks if a position is valid for building placement
     */
    static isValidBuildingPosition(
        x: number,
        y: number,
        allNodes: Node[]
    ): boolean {
        const position = { x, y };

        // Snap and center
        const snappedCenter = snapToGrid(position);
        const snappedPosition = {
            x: snappedCenter.x - BUILDING_WIDTH / 2,
            y: snappedCenter.y - BUILDING_HEIGHT / 2,
        };

        const { mapWidth, mapHeight } = GAME_CONFIG;

        // Boundary check
        if (
            snappedPosition.x < 0 ||
            snappedPosition.y < 0 ||
            snappedPosition.x + BUILDING_WIDTH > mapWidth ||
            snappedPosition.y + BUILDING_HEIGHT > mapHeight
        ) {
            return false;
        }

        // Collision check
        const proposedRect = {
            x: snappedPosition.x,
            y: snappedPosition.y,
            width: BUILDING_WIDTH,
            height: BUILDING_HEIGHT,
        };

        return !allNodes.some(node => {
            if (node.type !== 'building') return false;

            const existingRect = {
                x: node.position.x,
                y: node.position.y,
                width: BUILDING_WIDTH,
                height: BUILDING_HEIGHT,
            };

            return doRectanglesOverlap(proposedRect, existingRect);
        });
    }
}
