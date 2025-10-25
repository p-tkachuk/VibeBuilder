import type { Node } from '@xyflow/react';
import { BuildingType, BUILDING_CONFIGS } from '../types/buildings';
import { ResourceType } from '../types/terrain';
import { BUILDING_WIDTH, BUILDING_HEIGHT } from '../constants/game.constants';
import { GAME_CONFIG } from '../config/game.config';
import { isPositionInResourceField, snapToGrid, centerBuildingPosition, doRectanglesOverlap } from '../utils/position.utils';
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
        existingNodes: Node[],
        screenToFlowPosition: (position: Position) => Position
    ): { canPlace: boolean; errorMessage?: string } {
        // Convert screen coordinates to flow coordinates first
        const flowPosition = screenToFlowPosition(position);
        // Snap to grid to match the actual placement logic
        const snappedPosition = snapToGrid(flowPosition);
        const newBuildingPosition = centerBuildingPosition(snappedPosition);

        // Check for collision with existing buildings
        const newBuildingRect = {
            x: newBuildingPosition.x,
            y: newBuildingPosition.y,
            width: BUILDING_WIDTH,
            height: BUILDING_HEIGHT,
        };

        const hasCollision = existingNodes.some((node) => {
            if (node.type !== 'building') return false;
            const existingRect = {
                x: node.position.x,
                y: node.position.y,
                width: BUILDING_WIDTH,
                height: BUILDING_HEIGHT,
            };
            return doRectanglesOverlap(newBuildingRect, existingRect);
        });

        if (hasCollision) {
            return {
                canPlace: false,
                errorMessage: 'Cannot place building on top of another building!',
            };
        }

        // Check if building is within map borders
        const { mapWidth, mapHeight } = GAME_CONFIG;
        if (
            newBuildingPosition.x < 0 ||
            newBuildingPosition.y < 0 ||
            newBuildingPosition.x + BUILDING_WIDTH > mapWidth ||
            newBuildingPosition.y + BUILDING_HEIGHT > mapHeight
        ) {
            return {
                canPlace: false,
                errorMessage: 'Cannot place building outside the map border!',
            };
        }

        // Check if building requires specific resource field
        if (buildingType === BuildingType.COPPER_MINER) {
            if (!isPositionInResourceField(snappedPosition, resourceFields, ResourceType.COPPER_ORE)) {
                return {
                    canPlace: false,
                    errorMessage: 'Copper miners can only be placed on copper ore fields!',
                };
            }
        } else if (buildingType === BuildingType.COAL_MINER) {
            if (!isPositionInResourceField(snappedPosition, resourceFields, ResourceType.COAL)) {
                return {
                    canPlace: false,
                    errorMessage: 'Coal miners can only be placed on coal fields!',
                };
            }
        } else if (buildingType === BuildingType.IRON_MINER) {
            if (!isPositionInResourceField(snappedPosition, resourceFields, ResourceType.IRON_ORE)) {
                return {
                    canPlace: false,
                    errorMessage: 'Iron miners can only be placed on iron ore fields!',
                };
            }
        } else if (buildingType === BuildingType.STONE_MINER) {
            if (!isPositionInResourceField(snappedPosition, resourceFields, ResourceType.STONE)) {
                return {
                    canPlace: false,
                    errorMessage: 'Stone miners can only be placed on stone fields!',
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
