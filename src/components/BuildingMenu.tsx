import React, { useState } from 'react';
import { BuildingType, BUILDING_CONFIGS } from '../types/buildings';
import styles from './BuildingMenu.module.css';

const MINER_TYPES = [
  BuildingType.COPPER_MINER,
  BuildingType.COAL_MINER,
  BuildingType.IRON_MINER,
  BuildingType.STONE_MINER,
];

const NON_MINER_BUILDINGS = [
  BuildingType.SMELTER,
  BuildingType.ASSEMBLER,
  BuildingType.SPLITTER,
  BuildingType.STORAGE,
];

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
  const [minersExpanded, setMinersExpanded] = useState(false);

  const isMinerSelected = selectedBuildingType && MINER_TYPES.includes(selectedBuildingType);

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

      {/* Miners category */}
      <button
        onClick={() => setMinersExpanded(!minersExpanded)}
        className={`${styles.button} ${isMinerSelected && !minersExpanded ? styles.selected : ''}`}
        style={{ backgroundColor: minersExpanded ? '#4A5568' : '#2D3748' }}
      >
        <span className={styles.icon}>⛏️</span>
        <div>
          <div className={styles.text}>Miners</div>
          <div className={styles.description}>
            Select a resource to mine
            {minersExpanded ? ' ▼' : ' ▶'}
          </div>
        </div>
      </button>

      {minersExpanded && (
        <div className={styles.submenu}>
          {MINER_TYPES.map((buildingType) => {
            const config = BUILDING_CONFIGS[buildingType];
            const isSelected = selectedBuildingType === buildingType;

            return (
              <button
                key={buildingType}
                onClick={() => onBuildingSelect(buildingType)}
                className={`${styles.button} ${styles.subButton} ${isSelected ? styles.selected : ''}`}
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
      )}

      {/* Other buildings */}
      {NON_MINER_BUILDINGS.map((buildingType) => {
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
