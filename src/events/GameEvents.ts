import { BuildingType } from '../types/buildings';
import type { Position } from '../utils/position.utils';

// GameEvents.ts - Game-wide events
export interface BuildingCreatedEvent {
  buildingId: string;
  buildingType: BuildingType;
  position: Position;
}

export interface BuildingDestroyedEvent {
  buildingId: string;
}

export interface ResourceTransferredEvent {
  fromBuildingId: string;
  toBuildingId: string;
  resource: string;
  amount: number;
}

export interface GameTickEvent {
  tickCount: number;
  deltaTime: number;
}

export interface ResourceShortageEvent {
  buildingId: string;
  resource: string;
  required: number;
  available: number;
}

export interface EnergyGridUpdateEvent {
  totalEnergyProduced: number;
  totalEnergyConsumed: number;
  energyBalance: number;
}
