import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { BuildingType, BUILDING_CONFIGS } from '../types/buildings';
import styles from './BuildingNode.module.css';

export interface BuildingNodeData {
  buildingType: BuildingType;
  label: string;
}

interface BuildingNodeProps {
  data: BuildingNodeData;
  ghost?: boolean;
}

/**
 * BuildingNode component - displays a building with handles for connections
 * Follows Single Responsibility Principle - only handles building rendering
 * Open/Closed Principle - handle positioning is abstracted and extensible
 */
export const BuildingNode: React.FC<BuildingNodeProps> = ({ data, ghost }) => {
  const config = BUILDING_CONFIGS[data.buildingType];

  const renderHandle = (type: 'target' | 'source', position: Position, key?: number) => (
    <Handle
      key={key}
      type={type}
      position={position}
      className={styles.handle}
    />
  );

  const renderInputHandles = () => {
    if (config.inputs.length === 0 || ghost) return null;

    return renderHandle('target', Position.Left);
  };

  const renderOutputHandles = () => {
    if (config.outputs.length === 0 || ghost) return null;

    return config.outputs.map((_, index) => {
      if (config.outputs.length === 1) {
        return renderHandle('source', Position.Right, index);
      } else {
        // For splitters, place outputs on top and bottom
        return renderHandle(
          'source',
          index === 0 ? Position.Top : Position.Bottom,
          index
        );
      }
    });
  };

  return (
    <div
      className={`${styles.container} ${ghost ? styles.ghost : ''}`}
      style={{ backgroundColor: config.color }}
    >
      <div className={styles.icon}>{config.icon}</div>
      <div>{data.label}</div>

      {renderInputHandles()}
      {renderOutputHandles()}
    </div>
  );
};
