import React, { useState, useCallback } from 'react';
import { useReactFlow, type Node } from '@xyflow/react';
import { BuildingType } from '../types/buildings';
import { BuildingPlacementService } from '../services/BuildingPlacementService';
import { useGhostPreview } from '../hooks/useGhostPreview';
import { GhostPreview } from './GhostPreview';
import { snapToGrid } from '../utils/position.utils';
import type { Position } from '../utils/position.utils';
import type { ResourceField } from '../types/terrain';

/**
 * BuildingPlacementHandler component - handles building placement interactions
 * Follows Single Responsibility Principle - only handles placement interactions
 * Contains React Flow dependent logic since it runs inside ReactFlow context
 */
interface BuildingPlacementHandlerProps {
    selectedBuildingType: BuildingType | null;
    onBuildingPlaced: (node: Node) => void;
    resourceFields: ResourceField[];
    onShowToast: (message: string) => void;
}

export const BuildingPlacementHandler: React.FC<BuildingPlacementHandlerProps> = ({
    selectedBuildingType,
    onBuildingPlaced,
    resourceFields,
    onShowToast,
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

            const screenPosition = { x: event.clientX, y: event.clientY };
            const validation = BuildingPlacementService.validatePlacement(
                selectedBuildingType,
                screenPosition,
                resourceFields,
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

            onBuildingPlaced(newNode);
        },
        [selectedBuildingType, resourceFields, onBuildingPlaced, screenToFlowPosition, onShowToast]
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
