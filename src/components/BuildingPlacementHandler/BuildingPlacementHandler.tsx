import React, { useState, useCallback } from 'react';
import { useReactFlow, type Node } from '@xyflow/react';
import { BuildingType, BUILDING_CONFIGS } from '../../types/buildings';
import { GAME_CONFIG } from '../../config/game.config';
import { BuildingPlacementService } from '../../services/BuildingPlacementService';
import { useGhostPreview } from '../../hooks/useGhostPreview';
import { GhostPreview } from '../GhostPreview/GhostPreview';
import { snapToGrid } from '../../utils/position.utils';
import type { Position } from '../../utils/position.utils';
import type { ResourceField } from '../../types/terrain';
import { ResourceInventoryService } from '../../services/ResourceInventoryService';

/**
 * BuildingPlacementHandler component - handles building placement interactions
 * Follows Single Responsibility Principle - only handles placement interactions
 * Contains React Flow dependent logic since it runs inside ReactFlow context
 */
interface BuildingPlacementHandlerProps {
    selectedBuildingType: BuildingType | null;
    onBuildingPlaced: (node: Node) => void | Promise<void>;
    onNodesUpdate: (nodes: Node[]) => void;
    resourceFields: ResourceField[];
    existingNodes: Node[];
    onShowToast: (message: string) => void;
    resourceInventory: ResourceInventoryService;
}

export const BuildingPlacementHandler: React.FC<BuildingPlacementHandlerProps> = ({
    selectedBuildingType,
    onBuildingPlaced,
    onNodesUpdate,
    resourceFields,
    existingNodes,
    onShowToast,
    resourceInventory,
}) => {
    const { screenToFlowPosition } = useReactFlow();
    const [mousePosition, setMousePosition] = useState<Position | null>(null);

    const handleMouseMove = useCallback(
        (event: React.MouseEvent) => {
            if (!selectedBuildingType) return;

            const flowPos = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            // Snap to grid
            const snappedPos = snapToGrid(flowPos);
            setMousePosition(snappedPos);
        },
        [selectedBuildingType, screenToFlowPosition]
    );

    const handleMouseLeave = useCallback(() => {
        setMousePosition(null);
    }, []);

    const handlePaneClick = useCallback(
        (event: React.MouseEvent) => {
            if (!selectedBuildingType) return;

            const buildingConfig = BUILDING_CONFIGS[selectedBuildingType];
            if (buildingConfig.cost && !resourceInventory.hasTotalResources(buildingConfig.cost, existingNodes)) {
                onShowToast('Not enough resources to build this!');
                return;
            }

            const screenPosition = { x: event.clientX, y: event.clientY };
            const validation = BuildingPlacementService.validatePlacement(
                selectedBuildingType,
                screenPosition,
                resourceFields,
                existingNodes,
                screenToFlowPosition
            );

            if (!validation.canPlace) {
                onShowToast(validation.errorMessage!);
                return;
            }

            const newNode = BuildingPlacementService.createBuildingNode(
                selectedBuildingType,
                screenPosition,
                screenToFlowPosition
            );

            // Deduct cost
            if (buildingConfig.cost) {
                const result = resourceInventory.removeTotalResources(buildingConfig.cost, existingNodes);
                if (result.success) {
                    onNodesUpdate(result.updatedNodes);
                }
            }

            // If storage building, increase capacity
            if (selectedBuildingType === BuildingType.STORAGE) {
                resourceInventory.increaseStorageCapacity(GAME_CONFIG.storageCapacity);
            }

            onBuildingPlaced(newNode);
        },
        [selectedBuildingType, resourceInventory, resourceFields, existingNodes, onBuildingPlaced, onNodesUpdate, screenToFlowPosition, onShowToast]
    );

    const ghostPreview = useGhostPreview(selectedBuildingType, mousePosition);

    return (
        <>
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: selectedBuildingType ? 'auto' : 'none',
                    zIndex: 10,
                }}
                onClick={handlePaneClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            />
            <GhostPreview
                selectedBuildingType={selectedBuildingType}
                ghostPreview={ghostPreview}
            />
        </>
    );
};
