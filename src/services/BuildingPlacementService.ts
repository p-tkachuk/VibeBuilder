import type { Node } from '@xyflow/react';
import { BuildingType, BUILDING_CONFIGS } from '../types/buildings';
import { ResourceType } from '../types/terrain';
import { isPositionInResourceField, snapToGrid, centerBuildingPosition } from '../utils/position.utils';
import type { ResourceField } from '../types/terrain';
import type { Position } from '../utils/position.utils';

/**
 * Service for managing building placement logic
 * Follows Single Responsibility Principle - only handles placement validation and node creation
 */
export class BuildingPlacementService {
    /**
     * Validates if a building can be placed at the given position
     */
    static validatePlacement(
        buildingType: BuildingType,
        position: Position,
        resourceFields: ResourceField[],
        screenToFlowPosition: (position: Position) => Position
    ): { canPlace: boolean; errorMessage?: string } {
        // Check if building requires specific resource field
        if (buildingType === BuildingType.MINER) {
            // Convert screen coordinates to flow coordinates first
            const flowPosition = screenToFlowPosition(position);
            // Snap to grid to match the actual placement logic
            const snappedPosition = snapToGrid(flowPosition);

            if (!isPositionInResourceField(snappedPosition, resourceFields, ResourceType.IRON_ORE)) {
                return {
                    canPlace: false,
                    errorMessage: 'Miners can only be placed on iron ore fields!',
                };
            }
        }

        return { canPlace: true };
    }

    /**
     * Creates a new building node at the specified position
     * Uses screenToFlowPosition function for proper coordinate transformation
     */
    static createBuildingNode(
        buildingType: BuildingType,
        screenPosition: Position,
        screenToFlowPosition: (position: Position) => Position
    ): Node {
        const config = BUILDING_CONFIGS[buildingType];
        const newNodeId = `building-${Date.now()}`;

        // Convert screen coordinates to React Flow coordinates using the provided function
        const position = screenToFlowPosition(screenPosition);

        // Snap to grid and center building
        const snappedPosition = snapToGrid(position);
        const centeredPosition = centerBuildingPosition(snappedPosition);

        return {
            id: newNodeId,
            type: 'building',
            position: centeredPosition,
            data: {
                buildingType,
                label: config.name,
            },
        };
    }
}
