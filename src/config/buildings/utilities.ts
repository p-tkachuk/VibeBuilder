import { BuildingType, BuildingSpecialty } from '../../types/buildings';
import { ResourceType } from '../../types/terrain';
import type { BuildingConfig } from './index';

export const utilityConfigs: Record<string, BuildingConfig> = {
  [BuildingType.SPLITTER]: {
    name: 'Item Splitter',
    description: 'Splits incoming items into two outputs',
    color: '#9370DB',
    icon: '↔️',
    inputs: { 'any': 2 },
    outputs: { 'any-0': 1, 'any-1': 1 },
    cost: { [ResourceType.IRON_PLATE]: 5, [ResourceType.COPPER_ORE]: 5 },
    specialty: BuildingSpecialty.UTILITY,
    inventoryCapacity: 10,
    energyConsumption: 0,
  },
};
