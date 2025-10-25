import React from 'react';
import { BuildingType, BUILDING_CONFIGS } from '../types/buildings';
import { buildingMenuStyles, buildingButtonStyles } from '../styles/components.styles';

interface BuildingMenuProps {
  onBuildingSelect: (buildingType: BuildingType) => void;
  selectedBuildingType: BuildingType | null;
}

/**
 * BuildingMenu component - displays available buildings for placement
 * Follows Single Responsibility Principle - only handles building selection UI
 */
export const BuildingMenu: React.FC<BuildingMenuProps> = ({
  onBuildingSelect,
  selectedBuildingType,
}) => {
  const buildingTypes = Object.values(BuildingType);

  return (
    <div style={buildingMenuStyles.container}>
      <h3 style={buildingMenuStyles.title}>Building Menu</h3>

      {selectedBuildingType && (
        <div style={buildingMenuStyles.selectedInfo}>
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
              ...buildingButtonStyles.base,
              ...(isSelected
                ? buildingButtonStyles.selected
                : { backgroundColor: config.color, color: 'white' }),
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
            <span style={buildingButtonStyles.icon}>{config.icon}</span>
            <div>
              <div style={buildingButtonStyles.text}>{config.name}</div>
              <div style={buildingButtonStyles.description}>{config.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
