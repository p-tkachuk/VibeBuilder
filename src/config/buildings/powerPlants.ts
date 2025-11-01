import { BuildingType, BuildingSpecialty } from '../../types/buildings';
import { ResourceType } from '../../types/terrain';
import type { BuildingConfig } from './index';

export const powerPlantConfigs: Record<string, BuildingConfig> = {
  [BuildingType.COAL_POWER_PLANT]: {
    name: 'Coal Power Plant',
    description: 'Burns coal to generate energy',
    color: '#8B0000',
    icon: '🏭',
    inputs: { 'coal': 1 },
    outputs: { [ResourceType.ENERGY]: 5 },
    cost: { stone: 20 },
    specialty: BuildingSpecialty.POWER_PLANT,
    inventoryCapacity: 10,
    energyConsumption: 0,
  },
};
