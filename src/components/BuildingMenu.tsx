import React, { useState } from 'react';
import { BuildingType, BUILDING_CONFIGS } from '../types/buildings';
import { ResourceInventoryService } from '../services/ResourceInventoryService';
import type { Node } from '@xyflow/react';
import styles from './BuildingMenu.module.css';

const MINER_TYPES = [
  BuildingType.COPPER_MINER,
  BuildingType.COAL_MINER,
  BuildingType.IRON_MINER,
  BuildingType.STONE_MINER,
];

const SMELTER_TYPES = [
  BuildingType.SMELTER,
  BuildingType.COPPER_SMELTER,
  BuildingType.STEEL_FURNACE,
];

const ASSEMBLER_TYPES = [
  BuildingType.ASSEMBLER,
  BuildingType.STEEL_ASSEMBLER,
];

const UTILITY_BUILDINGS = [
  BuildingType.SPLITTER,
  BuildingType.STORAGE,
];

interface BuildingMenuProps {
  onBuildingSelect: (buildingType: BuildingType) => void;
  selectedBuildingType: BuildingType | null;
  resourceInventory: ResourceInventoryService;
  nodes: Node[];
}

const renderBuildingButton = (
  buildingType: BuildingType,
  onBuildingSelect: (buildingType: BuildingType) => void,
  selectedBuildingType: BuildingType | null,
  resourceInventory: ResourceInventoryService,
  nodes: Node[],
  isSubButton = false
) => {
  const config = BUILDING_CONFIGS[buildingType];
  const isSelected = selectedBuildingType === buildingType;
  const isAffordable = config.cost ? resourceInventory.hasResources(config.cost, nodes) : true;
  const costText = config.cost ? Object.entries(config.cost).map(([res, amt]) => `${res}: ${amt}`).join(', ') : 'Free';

  return (
    <button
      key={buildingType}
      onClick={() => onBuildingSelect(buildingType)}
      disabled={!isAffordable}
      className={`${styles.button} ${isSubButton ? styles.subButton : ''} ${isSelected ? styles.selected : ''} ${!isAffordable ? styles.disabled : ''}`}
      style={!isSelected ? { backgroundColor: isAffordable ? config.color : '#666' } : undefined}
    >
      <span className={styles.icon}>{config.icon}</span>
      <div>
        <div className={styles.text}>{config.name}</div>
        <div className={styles.description}>{config.description}</div>
        <div className={styles.cost}>Cost: {costText}</div>
      </div>
    </button>
  );
};

/**
 * BuildingMenu component - displays available buildings for placement
 * Follows Single Responsibility Principle - only handles building selection UI
 */
export const BuildingMenu: React.FC<BuildingMenuProps> = ({
  onBuildingSelect,
  selectedBuildingType,
  resourceInventory,
  nodes,
}) => {
  const [minersExpanded, setMinersExpanded] = useState(false);
  const [smeltersExpanded, setSmeltersExpanded] = useState(false);
  const [assemblersExpanded, setAssemblersExpanded] = useState(false);

  const isMinerSelected = selectedBuildingType && MINER_TYPES.includes(selectedBuildingType);
  const isSmelterSelected = selectedBuildingType && SMELTER_TYPES.includes(selectedBuildingType);
  const isAssemblerSelected = selectedBuildingType && ASSEMBLER_TYPES.includes(selectedBuildingType);

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
          {MINER_TYPES.map((buildingType) =>
            renderBuildingButton(buildingType, onBuildingSelect, selectedBuildingType, resourceInventory, nodes, true)
          )}
        </div>
      )}

      {/* Smelters category */}
      <button
        onClick={() => setSmeltersExpanded(!smeltersExpanded)}
        className={`${styles.button} ${isSmelterSelected && !smeltersExpanded ? styles.selected : ''}`}
        style={{ backgroundColor: smeltersExpanded ? '#4A5568' : '#2D3748' }}
      >
        <span className={styles.icon}>🔥</span>
        <div>
          <div className={styles.text}>Smelters & Furnaces</div>
          <div className={styles.description}>
            Convert ores into materials
            {smeltersExpanded ? ' ▼' : ' ▶'}
          </div>
        </div>
      </button>

      {smeltersExpanded && (
        <div className={styles.submenu}>
          {SMELTER_TYPES.map((buildingType) =>
            renderBuildingButton(buildingType, onBuildingSelect, selectedBuildingType, resourceInventory, nodes, true)
          )}
        </div>
      )}

      {/* Assemblers category */}
      <button
        onClick={() => setAssemblersExpanded(!assemblersExpanded)}
        className={`${styles.button} ${isAssemblerSelected && !assemblersExpanded ? styles.selected : ''}`}
        style={{ backgroundColor: assemblersExpanded ? '#4A5568' : '#2D3748' }}
      >
        <span className={styles.icon}>⚙️</span>
        <div>
          <div className={styles.text}>Assemblers</div>
          <div className={styles.description}>
            Assemble materials into components
            {assemblersExpanded ? ' ▼' : ' ▶'}
          </div>
        </div>
      </button>

      {assemblersExpanded && (
        <div className={styles.submenu}>
          {ASSEMBLER_TYPES.map((buildingType) =>
            renderBuildingButton(buildingType, onBuildingSelect, selectedBuildingType, resourceInventory, nodes, true)
          )}
        </div>
      )}

      {/* Other buildings */}
      {UTILITY_BUILDINGS.map((buildingType) =>
        renderBuildingButton(buildingType, onBuildingSelect, selectedBuildingType, resourceInventory, nodes)
      )}
    </div>
  );
};
