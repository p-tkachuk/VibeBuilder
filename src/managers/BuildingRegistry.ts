import type { Node, Edge } from '@xyflow/react';
import { BaseBuilding } from '../simulation/buildings/BaseBuilding';
import { GameStateManager } from './GameStateManager';
import type { BuildingState } from '../types/game-state';
import type { ResourceField } from '../types/terrain';
import { createBuildingInstance } from './BuildingFactory';

export class BuildingRegistry {
  private buildings = new Map<string, BaseBuilding>();
  private gameStateManager: GameStateManager;

  constructor(gameStateManager: GameStateManager) {
    this.gameStateManager = gameStateManager;
  }

  register(building: BaseBuilding): void {
    this.buildings.set(building.id, building);

    // Sync initial state to game state manager
    const initialState: BuildingState = {
      id: building.id,
      type: building.type,
      position: { x: 0, y: 0 }, // Will be set from node
      inventory: {},
      energyShortage: false,
      connections: { inputs: [], outputs: [], energyInputs: [] }
    };

    this.gameStateManager.addBuilding(initialState);
  }

  unregister(buildingId: string): void {
    this.buildings.delete(buildingId);
    this.gameStateManager.removeBuilding(buildingId);
  }

  get(buildingId: string): BaseBuilding | undefined {
    return this.buildings.get(buildingId);
  }

  getAll(): BaseBuilding[] {
    return Array.from(this.buildings.values());
  }

  updateBuildingState(buildingId: string): void {
    const building = this.buildings.get(buildingId);
    if (!building) return;

    // Sync building state to game state manager
    this.gameStateManager.updateBuilding(buildingId, {
      inventory: this.getBuildingInventory(building),
      energyShortage: building.energyShortage
    });
  }

  async createBuildingInstance(
    node: Node,
    edges: Edge[],
    allNodes: Node[],
    allEdges: Edge[],
    resourceFields?: ResourceField[],
    resourceInventory?: any
  ): Promise<BaseBuilding | null> {
    return await createBuildingInstance(
      node,
      edges,
      allNodes,
      allEdges,
      this.gameStateManager,
      this,
      resourceFields,
      resourceInventory
    );
  }

  private getBuildingInventory(building: BaseBuilding): Record<string, number> {
    // Extract inventory from building
    const inventory: Record<string, number> = {};
    const resourceTypes = ['iron-ore', 'coal', 'stone', 'copper-ore', 'iron-plate', 'copper-plate', 'steel-plate', 'iron-gear', 'steel-gear'];

    for (const resource of resourceTypes) {
      const amount = building.inventory.get(resource);
      if (amount > 0) {
        inventory[resource] = amount;
      }
    }

    return inventory;
  }
}
