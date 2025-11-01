import type { GameState, BuildingState, StateChange } from '../../types/game-state';

export interface IGameStateManager {
  getState(): Readonly<GameState>;
  updateBuilding(buildingId: string, updates: Partial<BuildingState>): void;
  addBuilding(buildingState: BuildingState): void;
  removeBuilding(buildingId: string): void;
  subscribe(listener: (change: StateChange) => void): () => void;
  batchUpdate(updates: Array<{ buildingId: string; changes: Partial<BuildingState> }>): void;
}
