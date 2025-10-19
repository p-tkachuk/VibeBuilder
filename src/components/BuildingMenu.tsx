import React from 'react';
import { BuildingType, BUILDING_CONFIGS } from '../types/buildings';

interface BuildingMenuProps {
  onBuildingSelect: (buildingType: BuildingType) => void;
  selectedBuildingType: BuildingType | null;
}

export const BuildingMenu: React.FC<BuildingMenuProps> = ({ onBuildingSelect, selectedBuildingType }) => {
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
      
      {selectedBuildingType && (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          padding: '8px',
          borderRadius: '4px',
          marginBottom: '8px',
          fontSize: '12px',
          color: 'white'
        }}>
          <strong>Selected:</strong> {BUILDING_CONFIGS[selectedBuildingType].name}
          <br />
          <em>Click on the map to place</em>
        </div>
      )}
      
      {buildingTypes.map((buildingType) => {
        const config = BUILDING_CONFIGS[buildingType];
        const isSelected = selectedBuildingType === buildingType;
        
        return (
          <button
            key={buildingType}
            onClick={() => onBuildingSelect(buildingType)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px',
              backgroundColor: isSelected ? '#4CAF50' : config.color,
              color: 'white',
              border: isSelected ? '2px solid #81C784' : 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }
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
