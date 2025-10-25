import React from 'react';
import { ResourceType, RESOURCE_COLORS, RESOURCE_PATTERNS } from '../types/terrain';
import { resourceNodeStyles } from '../styles/components.styles';
import { OPACITY } from '../constants/game.constants';

interface ResourceNodeData {
  resourceType: ResourceType;
  width: number;
  height: number;
  intensity: number;
}

interface ResourceNodeProps {
  data: ResourceNodeData;
}

/**
 * ResourceNode component - displays a resource field
 * Follows Single Responsibility Principle - only handles resource field rendering
 */
export const ResourceNode: React.FC<ResourceNodeProps> = ({ data }) => {
  const containerStyle = {
    ...resourceNodeStyles.container,
    width: data.width,
    height: data.height,
    backgroundColor: RESOURCE_COLORS[data.resourceType],
    opacity: OPACITY.RESOURCE_FIELD,
    border: `2px solid ${RESOURCE_COLORS[data.resourceType]}`,
  };

  return (
    <div style={containerStyle}>
      {RESOURCE_PATTERNS[data.resourceType]}
    </div>
  );
};
