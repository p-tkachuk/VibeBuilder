import React from 'react';
import { useReactFlow, type Node, useStore } from '@xyflow/react';
import { BuildingType, BUILDING_CONFIGS } from '../types/buildings';
import type { ResourceField } from '../types/terrain';
import { ResourceType } from '../types/terrain';
import { BuildingNode } from './BuildingNode';

interface ClickHandlerProps {
  selectedBuildingType: BuildingType | null;
  onBuildingPlaced: (node: Node) => void;
  resourceFields: ResourceField[];
  isPositionInResourceField: (x: number, y: number, resourceType?: ResourceType) => boolean;
}

export const ClickHandler: React.FC<ClickHandlerProps> = ({
  selectedBuildingType,
  onBuildingPlaced,
  resourceFields,
  isPositionInResourceField
}) => {
  const { screenToFlowPosition } = useReactFlow();
  const [transform] = useStore((state: any) => [state.transform]); // [x, y, zoom]

  // Track mouse position
  const [mousePos, setMousePos] = React.useState<{ x: number, y: number } | null>(null);

  // Mouse move handler for preview
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!selectedBuildingType) return;
    let flowPos = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    // Snap to grid
    const gridSize = 40;
    flowPos.x = Math.round(flowPos.x / gridSize) * gridSize;
    flowPos.y = Math.round(flowPos.y / gridSize) * gridSize;
    setMousePos(flowPos);
  };

  // Clear preview on leave
  const handleMouseLeave = () => setMousePos(null);

  const handlePaneClick = React.useCallback((event: React.MouseEvent) => {
    if (!selectedBuildingType) return;

    const config = BUILDING_CONFIGS[selectedBuildingType];
    const newNodeId = `building-${Date.now()}`;

    // Convert screen coordinates to React Flow coordinates
    let position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    // Snap to grid (40px)
    const gridSize = 40;
    position.x = Math.round(position.x / gridSize) * gridSize;
    position.y = Math.round(position.y / gridSize) * gridSize;

    // Offset position to center the building (approximate building size: 120px wide, 80px tall)
    const buildingWidth = 120;
    const buildingHeight = 80;
    position.x = position.x - buildingWidth / 2;
    position.y = position.y - buildingHeight / 2;

    // Validate placement based on building type
    let canPlace = true;
    let errorMessage = '';

    if (selectedBuildingType === BuildingType.MINER) {
      // Check center of building for resource field validation
      if (!isPositionInResourceField(position.x + buildingWidth / 2, position.y + buildingHeight / 2, ResourceType.IRON_ORE)) {
        canPlace = false;
        errorMessage = 'Miners can only be placed on iron ore fields!';
      }
    }

    if (!canPlace) {
      alert(errorMessage);
      return;
    }

    const newNode: Node = {
      id: newNodeId,
      type: 'building',
      position,
      data: {
        buildingType: selectedBuildingType,
        label: config.name,
      },
    };

    onBuildingPlaced(newNode);
  }, [selectedBuildingType, screenToFlowPosition, onBuildingPlaced, isPositionInResourceField]);

  // Compute ghost CSS coordinates (screen), respecting pan+zoom
  let ghostScreen = null;
  if (selectedBuildingType && mousePos && transform) {
    const [tx, ty, zoom] = transform;
    ghostScreen = {
      left: mousePos.x * zoom + tx,
      top: mousePos.y * zoom + ty
    };
  }

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
          zIndex: 10
        }}
        onClick={handlePaneClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      {/* Render ghost building preview (at correct screen coords under zoom/pan) */}
      {selectedBuildingType && mousePos && ghostScreen && transform && (
        <div
          style={{
            position: 'absolute',
            left: ghostScreen.left,
            top: ghostScreen.top,
            pointerEvents: 'none',
            opacity: 0.45,
            transform: `translate(-50%, -50%) scale(${transform[2]})`,
            zIndex: 100
          }}
        >
          <BuildingNode data={{ buildingType: selectedBuildingType, label: BUILDING_CONFIGS[selectedBuildingType].name }} ghost />
        </div>
      )}
    </>
  );
};
