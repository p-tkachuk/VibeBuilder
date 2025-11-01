// Core game state interfaces
import { BuildingType } from './buildings';

export interface BuildingState {
  id: string;
  type: BuildingType;
  position: { x: number; y: number };
  inventory: Record<string, number>;
  energyShortage: boolean;
  connections: {
    inputs: string[]; // building IDs
    outputs: string[]; // building IDs
    energyInputs: string[]; // building IDs
  };
}

export interface GameState {
  buildings: Record<string, BuildingState>;
  globalInventory: Record<string, number>;
  storageCapacity: number;
  tickCount: number;
}

export interface StateChange {
  type: 'building_created' | 'building_destroyed' | 'inventory_updated' | 'connections_changed' | 'batch_update';
  buildingId?: string;
  changes: Partial<BuildingState> | Array<{ buildingId: string; changes: Partial<BuildingState> }>;
}
