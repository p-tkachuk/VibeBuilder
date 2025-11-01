// BuildingEvents.ts - Building-specific events
export interface ProductionCompletedEvent {
  buildingId: string;
  resources: Record<string, number>;
}

export interface EnergyShortageEvent {
  buildingId: string;
  requiredEnergy: number;
  availableEnergy: number;
}

export interface BuildingStateChangedEvent {
  buildingId: string;
  previousState: string;
  newState: string;
  reason?: string;
}

export interface MaintenanceRequiredEvent {
  buildingId: string;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface EfficiencyChangedEvent {
  buildingId: string;
  previousEfficiency: number;
  newEfficiency: number;
  factor: string; // e.g., 'energy', 'maintenance', 'overclock'
}

export interface ResourceProcessedEvent {
  buildingId: string;
  inputResources: Record<string, number>;
  outputResources: Record<string, number>;
  processingTime: number;
}

export interface BuildingUpgradedEvent {
  buildingId: string;
  previousLevel: number;
  newLevel: number;
  upgradeCost: Record<string, number>;
}
