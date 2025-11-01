import React, { useEffect, useState } from 'react';
import { BuildingType, BUILDING_CONFIGS } from '../../types/buildings';
import { GameStateManager } from '../../managers/GameStateManager';
import { BuildingRegistry } from '../../managers/BuildingRegistry';
import type { BuildingState } from '../../types/game-state';
import styles from './BuildingInfoPanel.module.css';

interface BuildingInfoPanelProps {
  selectedBuildingId: string | null;
  gameStateManager: GameStateManager;
  buildingRegistry: BuildingRegistry;
  onClose: () => void;
}

/**
 * BuildingInfoPanel component - displays detailed information about a selected building
 * Shows real-time status, resource flow, inventory, and building statistics
 */
export const BuildingInfoPanel: React.FC<BuildingInfoPanelProps> = ({
  selectedBuildingId,
  gameStateManager,
  buildingRegistry,
  onClose,
}) => {
  const [buildingState, setBuildingState] = useState<BuildingState | null>(null);
  const [buildingInstance, setBuildingInstance] = useState<any>(null);

  useEffect(() => {
    if (!selectedBuildingId) {
      setBuildingState(null);
      setBuildingInstance(null);
      return;
    }

    // Get building state from game state manager
    const state = gameStateManager.getState();
    const building = state.buildings[selectedBuildingId];
    setBuildingState(building || null);

    // Get building instance from registry
    const instance = buildingRegistry.get(selectedBuildingId);
    setBuildingInstance(instance);

    // Subscribe to state changes
    const unsubscribe = gameStateManager.subscribe((change) => {
      if (change.buildingId === selectedBuildingId) {
        const updatedState = gameStateManager.getState().buildings[selectedBuildingId];
        setBuildingState(updatedState || null);
      }
    });

    return unsubscribe;
  }, [selectedBuildingId, gameStateManager, buildingRegistry]);

  // Handle ESC key to close panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!selectedBuildingId || !buildingState) {
    return null;
  }

  const config = BUILDING_CONFIGS[buildingState.type];

  const getEnergyStatus = () => {
    if (!buildingInstance) return { status: 'unknown', color: '#666' };

    if (buildingState.energyShortage) {
      return { status: 'disconnected', color: '#ff4444' };
    }

    // Check if building has energy input requirements
    const hasEnergyRequirement = config.energyConsumption > 0;
    if (hasEnergyRequirement) {
      return { status: 'connected', color: '#44ff44' };
    }

    return { status: 'not required', color: '#888' };
  };

  const getProductionStatus = () => {
    if (!buildingInstance) return { status: 'unknown', color: '#666' };

    // For now, assume active if not energy shortage and has inputs/outputs
    const hasIO = Object.keys(config.inputs || {}).length > 0 || Object.keys(config.outputs || {}).length > 0;
    if (!hasIO) return { status: 'idle', color: '#888' };

    if (buildingState.energyShortage) {
      return { status: 'idle', color: '#ffaa44' };
    }

    return { status: 'active', color: '#44ff44' };
  };

  const energyStatus = getEnergyStatus();
  const productionStatus = getProductionStatus();

  const connectedInputs = buildingState.connections.inputs.length;
  const connectedOutputs = buildingState.connections.outputs.length;
  const connectedEnergyInputs = buildingState.connections.energyInputs.length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.icon}>{config.icon as React.ReactNode}</div>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{config.name}</h3>
          <div className={styles.type}>{buildingState.type.replace('-', ' ').toUpperCase()}</div>
        </div>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>

      <div className={styles.content}>
        {/* Status Indicators */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Status</h4>
          <div className={styles.statusGrid}>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Energy:</span>
              <span className={styles.statusValue} style={{ color: energyStatus.color }}>
                {energyStatus.status}
              </span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Production:</span>
              <span className={styles.statusValue} style={{ color: productionStatus.color }}>
                {productionStatus.status}
              </span>
            </div>
          </div>
        </div>

        {/* Resource Flow */}
        {(Object.keys(config.inputs || {}).length > 0 || Object.keys(config.outputs || {}).length > 0) && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Resource Flow</h4>
            <div className={styles.resourceFlow}>
              {Object.keys(config.inputs || {}).length > 0 && (
                <div className={styles.inputs}>
                  <div className={styles.flowLabel}>Inputs:</div>
                  {Object.entries(config.inputs || {}).map(([resource, rate]) => (
                    <div key={resource} className={styles.resourceItem}>
                      <span className={styles.resourceName}>{resource}:</span>
                      <span className={styles.resourceRate}>{rate}/s</span>
                    </div>
                  ))}
                </div>
              )}
              {Object.keys(config.outputs || {}).length > 0 && (
                <div className={styles.outputs}>
                  <div className={styles.flowLabel}>Outputs:</div>
                  {Object.entries(config.outputs || {}).map(([resource, rate]) => (
                    <div key={resource} className={styles.resourceItem}>
                      <span className={styles.resourceName}>{resource}:</span>
                      <span className={styles.resourceRate}>{rate}/s</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Inventory */}
        {Object.keys(buildingState.inventory).length > 0 && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Inventory</h4>
            <div className={styles.inventory}>
              {Object.entries(buildingState.inventory).map(([resource, amount]) => (
                <div key={resource} className={styles.inventoryItem}>
                  <span className={styles.resourceName}>{resource}:</span>
                  <span className={styles.resourceAmount}>{amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Building Stats */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Building Stats</h4>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Energy Consumption:</span>
              <span className={styles.statValue}>{config.energyConsumption}/s</span>
            </div>
            {config.inventoryCapacity && (
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Storage Capacity:</span>
                <span className={styles.statValue}>{config.inventoryCapacity}</span>
              </div>
            )}
          </div>
        </div>

        {/* Connection Info */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Connections</h4>
          <div className={styles.connections}>
            <div className={styles.connectionItem}>
              <span className={styles.connectionLabel}>Input Connections:</span>
              <span className={styles.connectionValue}>{connectedInputs}</span>
            </div>
            <div className={styles.connectionItem}>
              <span className={styles.connectionLabel}>Output Connections:</span>
              <span className={styles.connectionValue}>{connectedOutputs}</span>
            </div>
            {config.energyConsumption > 0 && (
              <div className={styles.connectionItem}>
                <span className={styles.connectionLabel}>Energy Connections:</span>
                <span className={styles.connectionValue}>{connectedEnergyInputs}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
