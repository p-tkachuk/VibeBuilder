import type { GameState, BuildingState, StateChange } from '../types/game-state';

export class GameStateManager {
  private state: GameState;
  private listeners: ((change: StateChange) => void)[] = [];

  constructor(initialState?: Partial<GameState>) {
    this.state = {
      buildings: {},
      globalInventory: {},
      storageCapacity: 100,
      tickCount: 0,
      ...initialState
    };
  }

  getState(): Readonly<GameState> {
    return { ...this.state };
  }

  updateBuilding(buildingId: string, updates: Partial<BuildingState>): void {
    const currentBuilding = this.state.buildings[buildingId];
    if (!currentBuilding) return;

    const newBuildingState = { ...currentBuilding, ...updates };
    this.state = {
      ...this.state,
      buildings: {
        ...this.state.buildings,
        [buildingId]: newBuildingState
      }
    };

    this.notifyListeners({
      type: 'inventory_updated',
      buildingId,
      changes: updates
    });
  }

  addBuilding(buildingState: BuildingState): void {
    this.state = {
      ...this.state,
      buildings: {
        ...this.state.buildings,
        [buildingState.id]: buildingState
      }
    };

    this.notifyListeners({
      type: 'building_created',
      buildingId: buildingState.id,
      changes: buildingState
    });
  }

  removeBuilding(buildingId: string): void {
    const { [buildingId]: removed, ...remainingBuildings } = this.state.buildings;
    this.state = {
      ...this.state,
      buildings: remainingBuildings
    };

    this.notifyListeners({
      type: 'building_destroyed',
      buildingId,
      changes: {}
    });
  }

  subscribe(listener: (change: StateChange) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(change: StateChange): void {
    this.listeners.forEach(listener => listener(change));
  }
}
