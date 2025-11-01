import type { Node } from '@xyflow/react';
import { GameStateManager } from '../managers/GameStateManager';
import { BUILDING_CONFIGS } from '../types/buildings';

export class StateSyncService {
  private gameStateManager: GameStateManager;

  constructor(gameStateManager: GameStateManager) {
    this.gameStateManager = gameStateManager;
  }

  // Convert game state to ReactFlow nodes for rendering
  gameStateToNodes(): Node[] {
    const gameState = this.gameStateManager.getState();

    return Object.values(gameState.buildings).map(buildingState => {
      const config = BUILDING_CONFIGS[buildingState.type];
      return {
        id: buildingState.id,
        type: 'building',
        position: buildingState.position,
        data: {
          buildingType: buildingState.type,
          label: config.name, // Building name
          inventory: buildingState.inventory,
          energyShortage: buildingState.energyShortage,
          specialty: config.specialty, // Building specialty for handle rendering
        }
      };
    });
  }

  // Update game state from ReactFlow node changes
  updateFromNodes(nodes: Node[]): void {
    const gameState = this.gameStateManager.getState();

    nodes.forEach(node => {
      if (node.type === 'building') {
        const existingBuilding = gameState.buildings[node.id];
        if (existingBuilding) {
          // Update position and any other relevant data
          this.gameStateManager.updateBuilding(node.id, {
            position: node.position
          });
        }
      }
    });
  }

  // Get minimal updates for efficient ReactFlow updates
  getStateChanges(): { nodeId: string; changes: Partial<Node> }[] {
    // Implementation for change detection and minimal updates
    return [];
  }
}
