import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Edge } from '@xyflow/react';
import { BuildingType, BUILDING_CONFIGS } from '../types/buildings';
import styles from './BuildingNode.module.css';

export interface BuildingNodeData {
  buildingType: BuildingType;
  label: string;
  id: string;
  edges: Edge[];
  inventory?: Record<string, number>;
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

  const renderHandle = (id: string, type: 'target' | 'source', position: Position, isConnected: boolean) => (
    <Handle
      key={id}
      id={id}
      type={type}
      position={position}
      className={`${styles.handle} ${isConnected ? (type === 'target' ? styles["connected-input"] : styles["connected-output"]) : styles.unconnected}`}
    />
  );

  const renderInputHandles = () => {
    if (config.inputs.length === 0 || ghost) return null;

    const handleId = 'input';
    const isConnected = data.edges.some(edge => edge.target === data.id && edge.targetHandle === handleId);

    return renderHandle(handleId, 'target', Position.Left, isConnected);
  };

  const renderOutputHandles = () => {
    if (config.outputs.length === 0 || ghost) return null;

    return config.outputs.map((_, index) => {
      const handleId = `output-${index}`;
      const isConnected = data.edges.some(edge => edge.source === data.id && edge.sourceHandle === handleId);

      if (config.outputs.length === 1) {
        return renderHandle(handleId, 'source', Position.Right, isConnected);
      } else {
        // For splitters, place outputs on top and bottom
        return renderHandle(
          handleId,
          'source',
          index === 0 ? Position.Top : Position.Bottom,
          isConnected
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
      {(config as any).capacity !== undefined && (
        <div className={styles.storage}>
          Storage: {data.inventory ? Object.values(data.inventory).reduce((sum, v) => sum + v, 0) : 0} / {(config as any).capacity}
        </div>
      )}
      {(config as any).productionRate && (
        <div className={styles.production}>
          Production: {(config as any).productionRate}/s
        </div>
      )}
      {data.inventory && Object.keys(data.inventory).length > 0 && !(config as any).capacity && (
        <div className={styles.inventory}>
          {Object.entries(data.inventory).map(([key, value]) => `${key}: ${value}`).join(', ')}
        </div>
      )}

      {renderInputHandles()}
      {renderOutputHandles()}
    </div>
  );
};
