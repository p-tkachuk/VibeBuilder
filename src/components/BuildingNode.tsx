import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Edge } from '@xyflow/react';
import { BuildingType, BUILDING_CONFIGS, BuildingSpecialty } from '../types/buildings';
import styles from './BuildingNode.module.css';

export interface BuildingNodeData {
  buildingType: BuildingType;
  label: string;
  id: string;
  edges: Edge[];
  specialty: string;
  inventory?: Record<string, number>;
  energyShortage?: boolean;
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
  const [isHovered, setIsHovered] = useState(false);
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
    const hasInputs = Object.keys(config.inputs || {}).length > 0;
    const hasEnergyInput = data.specialty === BuildingSpecialty.MINER || data.specialty === BuildingSpecialty.FACTORY;
    if ((!hasInputs && !hasEnergyInput) || ghost) return null;

    const handles = [];

    if (hasInputs) {
      const handleId = 'input';
      const isConnected = data.edges.some(edge => edge.target === data.id && edge.targetHandle === handleId);
      handles.push(renderHandle(handleId, 'target', Position.Left, isConnected));
    }

    if (hasEnergyInput) {
      const handleId = 'energy-input';
      const isConnected = data.edges.some(edge => edge.target === data.id && edge.targetHandle === handleId);
      handles.push(renderHandle(handleId, 'target', Position.Top, isConnected));
    }

    return handles;
  };

  const renderOutputHandles = () => {
    const outputs = config.outputs as Record<string, number | undefined>;
    const outputEntries = Object.entries(outputs);
    if (outputEntries.length === 0 || ghost) return null;

    const amt = outputEntries.length;
    const numOutputs = amt !== undefined ? amt : 1;

    if (numOutputs === 1) {
      const handleId = 'output';
      const isConnected = data.edges.some(edge => edge.source === data.id && edge.sourceHandle === handleId);
      return renderHandle(handleId, 'source', Position.Right, isConnected);
    } else {
      return Array.from({ length: numOutputs }).map((_, index) => {
        const handleId = `output-${index}`;
        const isConnected = data.edges.some(edge => edge.source === data.id && edge.sourceHandle === handleId);
        return renderHandle(handleId, 'source', index === 0 ? Position.Top : Position.Bottom, isConnected);
      });
    }
  };

  return (
    <div
      className={`${styles.container} ${ghost ? styles.ghost : ''}`}
      style={{ backgroundColor: config.color, position: 'relative' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.icon}>{config.icon}</div>
      <div>{data.label}</div>
      {data.energyShortage && (
        <>
          <div className={styles.energyShortageOverlay}></div>
          <div className={styles.energyIcon}>⚡</div>
        </>
      )}
      {config.inventoryCapacity !== undefined && data.buildingType === BuildingType.STORAGE && (
        <div className={styles.storage}>
          Storage: {data.inventory ? Object.values(data.inventory).reduce((sum, v) => sum + v, 0) : 0} / {config.inventoryCapacity}
        </div>
      )}
      {(data.buildingType !== BuildingType.STORAGE) && (Object.keys(config.outputs || {}).length > 0 || Object.keys(config.inputs || {}).length > 0) && (
        <div className={styles.production}>
          {Object.entries(config.inputs || {}).map(([res, amt]) => `${amt} ${res}`).join(', ')}
          {Object.keys(config.inputs || {}).length > 0 && Object.keys(config.outputs || {}).length > 0 ? ' → ' : ''}
          {Object.entries(config.outputs || {}).map(([res, amt]) => `${amt} ${res}`).join(', ')} /s
        </div>
      )}

      {renderInputHandles()}
      {renderOutputHandles()}

      {isHovered && data.inventory && (
        <div className={styles.tooltip}>
          <strong>Inventory:</strong><br />
          {Object.entries(data.inventory).map(([key, value]) => (
            <div key={key}>{key}: {value}</div>
          ))}
        </div>
      )}
    </div>
  );
};
