import { BuildingType, BuildingSpecialty } from '../../types/buildings';
import { GAME_CONFIG } from '../../config/game.config';
import type { BuildingConfig } from './index';

export const storageConfigs: Record<string, BuildingConfig> = {
  [BuildingType.STORAGE]: {
    name: 'Storage',
    description: 'Stores items for later use',
    color: '#FFD700',
    icon: '📦',
    inputs: { 'any': 2 },
    outputs: { 'any': 2 },
    cost: { stone: 10 },
    inventoryCapacity: GAME_CONFIG.storageCapacity,
    specialty: BuildingSpecialty.STORAGE,
    energyConsumption: 0,
  },
};
