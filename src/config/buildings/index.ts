import { BuildingSpecialty } from '../../types/buildings';
import { minerConfigs } from './miners';
import { factoryConfigs } from './factories';
import { utilityConfigs } from './utilities';
import { storageConfigs } from './storage';
import { powerPlantConfigs } from './powerPlants';

export interface BuildingConfig {
  name: string;
  description: string;
  color: string;
  icon: string;
  inputs: Record<string, number>;
  outputs: Record<string, number>;
  cost: Record<string, number>;
  specialty: BuildingSpecialty;
  inventoryCapacity: number;
  energyConsumption: number;
  miningSpeed?: number;
  miningRange?: number;
}

export const BUILDING_CONFIGS = {
  ...minerConfigs,
  ...factoryConfigs,
  ...utilityConfigs,
  ...storageConfigs,
  ...powerPlantConfigs,
};

export function loadBuildingConfigs(): Promise<typeof BUILDING_CONFIGS> {
  // In production, this could load from external JSON files
  return Promise.resolve(BUILDING_CONFIGS);
}
