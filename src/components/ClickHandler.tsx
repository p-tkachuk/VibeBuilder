import React from 'react';
import { useReactFlow, type Node } from '@xyflow/react';
import { BuildingType, BUILDING_CONFIGS } from '../types/buildings';
import type { ResourceField } from '../types/terrain';
import { ResourceType } from '../types/terrain';

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

  const handlePaneClick = React.useCallback((event: React.MouseEvent) => {
    if (!selectedBuildingType) return;

    const config = BUILDING_CONFIGS[selectedBuildingType];
    const newNodeId = `building-${Date.now()}`;
    
    // Convert screen coordinates to React Flow coordinates
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    
    // Validate placement based on building type
    let canPlace = true;
    let errorMessage = '';
    
    if (selectedBuildingType === BuildingType.MINER) {
      if (!isPositionInResourceField(position.x, position.y, ResourceType.IRON_ORE)) {
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

  return (
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
    />
  );
};
