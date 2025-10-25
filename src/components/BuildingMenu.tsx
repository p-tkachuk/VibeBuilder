import React from 'react';
import { BuildingType, BUILDING_CONFIGS } from '../types/buildings';
import styles from './BuildingMenu.module.css';

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
    <div className={styles.container}>
      <h3 className={styles.title}>Building Menu</h3>

      {selectedBuildingType && (
        <div className={styles.selectedInfo}>
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
            className={`${styles.button} ${isSelected ? styles.selected : ''}`}
            style={!isSelected ? { backgroundColor: config.color } : undefined}
          >
            <span className={styles.icon}>{config.icon}</span>
            <div>
              <div className={styles.text}>{config.name}</div>
              <div className={styles.description}>{config.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
