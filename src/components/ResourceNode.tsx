import React from 'react';
import { ResourceType, RESOURCE_COLORS, RESOURCE_PATTERNS, isOreType } from '../types/terrain';
import styles from './ResourceNode.module.css';
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
  const isOre = isOreType(data.resourceType);

  const dynamicStyle = {
    width: data.width,
    height: data.height,
    backgroundColor: RESOURCE_COLORS[data.resourceType],
    opacity: OPACITY.RESOURCE_FIELD,
    border: `2px solid ${RESOURCE_COLORS[data.resourceType]}`,
    cursor: isOre ? 'pointer' : 'default',
  };

  return (
    <div className={styles.container} style={dynamicStyle}>
      {RESOURCE_PATTERNS[data.resourceType]}
      {/* Pickaxe icon will be added via CSS pseudo-element or overlay */}
    </div>
  );
};
