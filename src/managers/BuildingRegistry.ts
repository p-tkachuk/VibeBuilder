import type { Node, Edge } from '@xyflow/react';
import { BaseBuilding } from '../simulation/buildings/BaseBuilding';
import { GameStateManager } from './GameStateManager';
import type { BuildingState } from '../types/game-state';
import type { ResourceField } from '../types/terrain';
import type { IEventBus } from '../services/interfaces/IEventBus';
import { createBuildingInstance } from './BuildingFactory';

export class BuildingRegistry {
  private buildings = new Map<string, BaseBuilding>();
  private gameStateManager: GameStateManager;
  private eventBus: IEventBus;
  private supplierCache = new Map<string, BaseBuilding[]>();
  private lastSupplierUpdate = 0;
  private lastKnownState = new Map<string, BuildingState>();
  private connectionManager: any = null; // Will be set by TickProcessor

  constructor(gameStateManager: GameStateManager, eventBus: IEventBus) {
    this.gameStateManager = gameStateManager;
    this.eventBus = eventBus;
  }

  setConnectionManager(connectionManager: any): void {
    this.connectionManager = connectionManager;
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
    const building = this.buildings.get(buildingId);
    this.buildings.delete(buildingId);
    this.gameStateManager.removeBuilding(buildingId);

    // Clean up optimization caches
    this.supplierCache.delete(buildingId);
    this.lastKnownState.delete(buildingId);

    // Clean up spatial index
    if (building && this.connectionManager) {
      this.connectionManager.removeBuildingFromSpatialIndex(building);
    }

    // Clean up supplier references to this building
    for (const [supplierId, suppliers] of this.supplierCache.entries()) {
      const filteredSuppliers = suppliers.filter(s => s.id !== buildingId);
      if (filteredSuppliers.length !== suppliers.length) {
        this.supplierCache.set(supplierId, filteredSuppliers);
      }
    }
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

  updateBuildingStateWithChangeDetection(buildingId: string): void {
    const building = this.buildings.get(buildingId);
    if (!building) return;

    const currentState = this.extractBuildingState(building);
    const lastState = this.lastKnownState.get(buildingId);

    if (lastState && this.statesEqual(currentState, lastState)) return; // No changes

    this.lastKnownState.set(buildingId, currentState);
    this.gameStateManager.updateBuilding(buildingId, currentState);
  }

  private extractBuildingState(building: BaseBuilding): BuildingState {
    return {
      id: building.id,
      type: building.type,
      position: building.getCurrentPosition(),
      inventory: this.getBuildingInventory(building),
      energyShortage: building.energyShortage,
      connections: { inputs: [], outputs: [], energyInputs: [] } // Simplified for change detection
    };
  }

  private statesEqual(state1: BuildingState, state2: BuildingState): boolean {
    if (!state1 || !state2) return false;

    // Deep comparison of relevant fields
    return JSON.stringify(state1.inventory) === JSON.stringify(state2.inventory) &&
           state1.energyShortage === state2.energyShortage;
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
      this.eventBus,
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

  getSuppliers(buildingId: string): BaseBuilding[] {
    return this.supplierCache.get(buildingId) || [];
  }

  updateSupplierCache(edges: Edge[]): void {
    // Only rebuild if connections changed (simplified check - in real implementation
    // this would compare edge hashes or timestamps)
    this.supplierCache.clear();

    const buildings = this.getAll();
    const buildingsMap = new Map(buildings.map(b => [b.id, b]));

    // Build supplier relationships based on edges
    buildings.forEach(building => {
      const suppliers: BaseBuilding[] = [];

      // Find all edges where this building is the target
      edges.filter(edge => edge.target === building.id).forEach(edge => {
        const supplier = buildingsMap.get(edge.source);
        if (supplier) {
          suppliers.push(supplier);
        }
      });

      this.supplierCache.set(building.id, suppliers);
    });

    this.lastSupplierUpdate = Date.now();
  }

  batchUpdateState(updates: Array<{ buildingId: string; changes: Partial<any> }>): void {
    this.gameStateManager.batchUpdate(updates);
  }

  // Memory optimization: periodic cache cleanup
  optimizeMemory(): void {
    // Clear old supplier cache entries that haven't been accessed recently
    // This is a simple implementation - in production you might want more sophisticated LRU caching
    const now = Date.now();
    if (now - this.lastSupplierUpdate > 30000) { // 30 seconds
      this.supplierCache.clear();
      this.lastSupplierUpdate = now;
    }

    // Clear last known state cache periodically to prevent unbounded growth
    if (Math.random() < 0.01) { // 1% chance per call
      this.lastKnownState.clear();
    }
  }
}
