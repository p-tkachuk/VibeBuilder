import React, { useState } from 'react';
import { ResourceType, RESOURCE_COLORS, RESOURCE_PATTERNS, isOreType } from '../../types/terrain';
import styles from './ResourceNode.module.css';
import { OPACITY } from '../../constants/game.constants';

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
  const [isHovered, setIsHovered] = useState(false);
  const isOre = isOreType(data.resourceType);

  const dynamicStyle = {
    width: data.width,
    height: data.height,
    backgroundColor: RESOURCE_COLORS[data.resourceType],
    color: RESOURCE_COLORS[data.resourceType],
    textShadow: '-1px -1px 3px white, 1px -1px 3px white, -1px 1px 3px white, 1px 1px 3px white',
    opacity: OPACITY.RESOURCE_FIELD,
    border: `2px solid ${RESOURCE_COLORS[data.resourceType]}`,
    cursor: isOre ? 'pointer' : 'default',
    pointerEvents: isOre ? 'auto' : 'none',
  } as React.CSSProperties;

  return (
    <div
      className={styles.container}
      style={dynamicStyle}
      onMouseEnter={() => isOre && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {RESOURCE_PATTERNS[data.resourceType]}
      {isHovered && isOre && (
        <div className={styles.miningIcon}>⛏️</div>
      )}
    </div>
  );
};


