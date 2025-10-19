import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { BuildingType, BUILDING_CONFIGS } from '../types/buildings';

export interface BuildingNodeData {
  buildingType: BuildingType;
  label: string;
}

interface BuildingNodeProps {
  data: BuildingNodeData;
}

export const BuildingNode: React.FC<BuildingNodeProps> = ({ data }) => {
  const config = BUILDING_CONFIGS[data.buildingType];
  
  return (
    <div
      style={{
        backgroundColor: config.color,
        borderRadius: '8px',
        padding: '12px',
        minWidth: '120px',
        textAlign: 'center',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        border: '2px solid rgba(255, 255, 255, 0.3)'
      }}
    >
      <div style={{ fontSize: '20px', marginBottom: '4px' }}>
        {config.icon}
      </div>
      <div>{data.label}</div>
      
      {/* Input handles */}
      {config.inputs.length > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#555', width: '8px', height: '8px' }}
        />
      )}
      
      {/* Output handles */}
      {config.outputs.length > 0 && config.outputs.map((_, index) => {
        if (config.outputs.length === 1) {
          return (
            <Handle
              key={index}
              type="source"
              position={Position.Right}
              style={{ background: '#555', width: '8px', height: '8px' }}
            />
          );
        } else {
          // For splitters, place outputs on top and bottom
          return (
            <Handle
              key={index}
              type="source"
              position={index === 0 ? Position.Top : Position.Bottom}
              style={{ 
                background: '#555', 
                width: '8px', 
                height: '8px',
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            />
          );
        }
      })}
    </div>
  );
};
