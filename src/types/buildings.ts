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
  MINER = 'miner',
  SMELTER = 'smelter',
  ASSEMBLER = 'assembler',
  SPLITTER = 'splitter'
}

export const BUILDING_CONFIGS = {
  [BuildingType.MINER]: {
    name: 'Iron Ore Miner',
    description: 'Extracts iron ore from resource nodes',
    color: '#8B4513',
    icon: '⛏️',
    inputs: [],
    outputs: ['iron-ore']
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
  }
};
