import type { Node } from '@xyflow/react';
import { BuildingType } from '../types/buildings';
import type { BuildingState, GameState } from '../types/game-state';

/**
 * Migration utilities for converting between old node-based state and new game state
 */

// Convert ReactFlow nodes to BuildingState objects
export function nodesToBuildingStates(nodes: Node[]): BuildingState[] {
  return nodes
    .filter(node => node.type === 'building')
    .map(node => ({
      id: node.id,
      type: node.data.buildingType as BuildingType,
      position: node.position,
      inventory: (node.data.inventory as Record<string, number>) || {},
      energyShortage: (node.data.energyShortage as boolean) || false,
      connections: {
        inputs: [], // Will be populated from edges
        outputs: [], // Will be populated from edges
        energyInputs: [] // Will be populated from edges
      }
    }));
}

// Convert BuildingState objects back to ReactFlow nodes
export function buildingStatesToNodes(buildingStates: BuildingState[]): Node[] {
  return buildingStates.map(state => ({
    id: state.id,
    type: 'building',
    position: state.position,
    data: {
      buildingType: state.type,
      inventory: state.inventory,
      energyShortage: state.energyShortage
    }
  }));
}

// Create a complete GameState from nodes and edges
export function createGameStateFromNodes(nodes: Node[], edges: any[]): GameState {
  const buildingStates = nodesToBuildingStates(nodes);

  // Populate connections from edges
  edges.forEach(edge => {
    const sourceBuilding = buildingStates.find(b => b.id === edge.source);
    const targetBuilding = buildingStates.find(b => b.id === edge.target);

    if (sourceBuilding && targetBuilding) {
      if (edge.targetHandle === 'energy-input') {
        targetBuilding.connections.energyInputs.push(edge.source);
      } else {
        sourceBuilding.connections.outputs.push(edge.target);
        targetBuilding.connections.inputs.push(edge.source);
      }
    }
  });

  return {
    buildings: Object.fromEntries(buildingStates.map(state => [state.id, state])),
    globalInventory: {},
    storageCapacity: 100,
    tickCount: 0
  };
}

// Validate migration data
export function validateMigration(gameState: GameState): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for duplicate building IDs
  const ids = Object.keys(gameState.buildings);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    errors.push('Duplicate building IDs found');
  }

  // Check for invalid building types
  Object.values(gameState.buildings).forEach(building => {
    if (!Object.values(BuildingType).includes(building.type)) {
      errors.push(`Invalid building type: ${building.type} for building ${building.id}`);
    }
  });

  // Check for negative inventory values
  Object.values(gameState.buildings).forEach(building => {
    Object.entries(building.inventory).forEach(([resource, amount]) => {
      if (amount < 0) {
        errors.push(`Negative inventory for ${resource} in building ${building.id}`);
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

// Feature flag for gradual migration
export const MIGRATION_FLAGS = {
  USE_NEW_STATE_MANAGEMENT: true,
  ENABLE_STATE_VALIDATION: true,
  LOG_MIGRATION_EVENTS: false
} as const;
