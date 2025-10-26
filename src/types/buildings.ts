import { GAME_CONFIG } from "../config/game.config";
import { ResourceType } from "./terrain";

export interface Building {
  id: string;
  type: BuildingType;
  position: { x: number; y: number };
  name: string;
  description: string;
  color: string;
  icon: string;
}

export enum BuildingType {
  COPPER_MINER = 'copper-miner',
  COAL_MINER = 'coal-miner',
  IRON_MINER = 'iron-miner',
  STONE_MINER = 'stone-miner',
  SMELTER = 'smelter',
  ASSEMBLER = 'assembler',
  SPLITTER = 'splitter',
  STORAGE = 'storage'
}

export enum BuildingSpecialty {
  MINER = 'copper-miner',
  FACTORY = 'factory',
  UTILITY = 'utility',
  STORAGE = 'storage',
}

export const BUILDING_CONFIGS = {
  [BuildingType.COPPER_MINER]: {
    name: 'Copper Miner',
    description: 'Extracts copper ore from resource nodes',
    color: '#B87333',
    icon: '⛏️',
    inputs: {},
    outputs: { 'copper-ore': 2 },
    cost: { stone: 5 },
    specialty: BuildingSpecialty.MINER,
    inventoryCapacity: 10
  },
  [BuildingType.COAL_MINER]: {
    name: 'Coal Miner',
    description: 'Extracts coal from resource nodes',
    color: '#2F2F2F',
    icon: '⛏️',
    inputs: {},
    outputs: { 'coal': 2 },
    cost: { stone: 5 },
    specialty: BuildingSpecialty.MINER,
    inventoryCapacity: 10
  },
  [BuildingType.IRON_MINER]: {
    name: 'Iron Miner',
    description: 'Extracts iron ore from resource nodes',
    color: '#8B4513',
    icon: '⛏️',
    inputs: {},
    outputs: { 'iron-ore': 2 },
    cost: { stone: 5 },
    specialty: BuildingSpecialty.MINER,
    inventoryCapacity: 10
  },
  [BuildingType.STONE_MINER]: {
    name: 'Stone Miner',
    description: 'Extracts stone from resource nodes',
    color: '#696969',
    icon: '⛏️',
    inputs: {},
    outputs: { stone: 2 },
    cost: { stone: 5 },
    specialty: BuildingSpecialty.MINER,
    inventoryCapacity: 10
  },
  [BuildingType.SMELTER]: {
    name: 'Iron Smelter',
    description: 'Smelts iron ore into iron plates',
    color: '#FF4500',
    icon: '🔥',
    inputs: { [ResourceType.IRON_ORE]: 2 },
    outputs: { [ResourceType.IRON_PLATE]: 1 },
    cost: { stone: 10, [ResourceType.IRON_ORE]: 5 },
    specialty: BuildingSpecialty.FACTORY,
    inventoryCapacity: 10
  },
  [BuildingType.ASSEMBLER]: {
    name: 'Iron Gear Assembler',
    description: 'Assembles iron plates into iron gears',
    color: '#4169E1',
    icon: '⚙️',
    inputs: { [ResourceType.IRON_PLATE]: 2 },
    outputs: { [ResourceType.IRON_GEAR]: 1 },
    cost: { stone: 10, [ResourceType.IRON_PLATE]: 10 },
    specialty: BuildingSpecialty.FACTORY,
    inventoryCapacity: 10
  },
  [BuildingType.SPLITTER]: {
    name: 'Item Splitter',
    description: 'Splits incoming items into two outputs',
    color: '#9370DB',
    icon: '↔️',
    inputs: { 'any': 2 },
    outputs: { 'any-0': 1, 'any-1': 1 },
    cost: { [ResourceType.IRON_PLATE]: 5, [ResourceType.COPPER_ORE]: 5 },
    specialty: BuildingSpecialty.UTILITY,
    inventoryCapacity: 10
  },
  [BuildingType.STORAGE]: {
    name: 'Storage',
    description: 'Stores items for later use',
    color: '#FFD700',
    icon: '📦',
    inputs: { 'any': 2 },
    outputs: { 'any': 2 },
    cost: { stone: 10 },
    capacity: GAME_CONFIG.storageCapacity,
    specialty: BuildingSpecialty.STORAGE
  }
};
