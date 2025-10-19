import React from 'react';
import { BuildingType, BUILDING_CONFIGS } from '../types/buildings';

interface BuildingMenuProps {
  onBuildingSelect: (buildingType: BuildingType) => void;
}

export const BuildingMenu: React.FC<BuildingMenuProps> = ({ onBuildingSelect }) => {
  const buildingTypes = Object.values(BuildingType);

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      minWidth: '200px'
    }}>
      <h3 style={{
        color: 'white',
        margin: '0 0 12px 0',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        Building Menu
      </h3>
      
      {buildingTypes.map((buildingType) => {
        const config = BUILDING_CONFIGS[buildingType];
        return (
          <button
            key={buildingType}
            onClick={() => onBuildingSelect(buildingType)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px',
              backgroundColor: config.color,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '18px' }}>{config.icon}</span>
            <div>
              <div style={{ fontWeight: 'bold' }}>{config.name}</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>{config.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
