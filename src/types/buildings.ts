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

export const BUILDING_CONFIGS = {
  [BuildingType.COPPER_MINER]: {
    name: 'Copper Miner',
    description: 'Extracts copper ore from resource nodes',
    color: '#B87333',
    icon: '⛏️',
    inputs: [],
    outputs: ['copper-ore']
  },
  [BuildingType.COAL_MINER]: {
    name: 'Coal Miner',
    description: 'Extracts coal from resource nodes',
    color: '#2F2F2F',
    icon: '⛏️',
    inputs: [],
    outputs: ['coal']
  },
  [BuildingType.IRON_MINER]: {
    name: 'Iron Miner',
    description: 'Extracts iron ore from resource nodes',
    color: '#8B4513',
    icon: '⛏️',
    inputs: [],
    outputs: ['iron-ore']
  },
  [BuildingType.STONE_MINER]: {
    name: 'Stone Miner',
    description: 'Extracts stone from resource nodes',
    color: '#696969',
    icon: '⛏️',
    inputs: [],
    outputs: ['stone']
  },
  [BuildingType.SMELTER]: {
    name: 'Iron Smelter',
    description: 'Smelts iron ore into iron plates',
    color: '#FF4500',
    icon: '🔥',
    inputs: ['iron-ore'],
    outputs: ['iron-plate']
  },
  [BuildingType.ASSEMBLER]: {
    name: 'Iron Gear Assembler',
    description: 'Assembles iron plates into iron gears',
    color: '#4169E1',
    icon: '⚙️',
    inputs: ['iron-plate'],
    outputs: ['iron-gear']
  },
  [BuildingType.SPLITTER]: {
    name: 'Item Splitter',
    description: 'Splits incoming items into two outputs',
    color: '#9370DB',
    icon: '↔️',
    inputs: ['any'],
    outputs: ['any', 'any']
  },
  [BuildingType.STORAGE]: {
    name: 'Storage',
    description: 'Stores items for later use',
    color: '#FFD700',
    icon: '📦',
    inputs: ['any'],
    outputs: ['any']
  }
};
