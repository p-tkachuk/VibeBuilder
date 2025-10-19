import React from 'react';
import { ResourceType, RESOURCE_COLORS, RESOURCE_PATTERNS } from '../types/terrain';

interface ResourceNodeData {
  resourceType: ResourceType;
  width: number;
  height: number;
  intensity: number;
}

interface ResourceNodeProps {
  data: ResourceNodeData;
}

export const ResourceNode: React.FC<ResourceNodeProps> = ({ data }) => {
  return (
    <div
      style={{
        width: data.width,
        height: data.height,
        backgroundColor: RESOURCE_COLORS[data.resourceType],
        opacity: 0.4 + (data.intensity * 0.4),
        borderRadius: '8px',
        border: `2px solid ${RESOURCE_COLORS[data.resourceType]}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
        pointerEvents: 'none'
      }}
    >
      {RESOURCE_PATTERNS[data.resourceType]}
    </div>
  );
};
