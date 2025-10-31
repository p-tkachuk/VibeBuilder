export interface ResourceField {
  id: string;
  type: ResourceType;
  x: number;
  y: number;
  width: number;
  height: number;
  intensity: number; // 0-1, affects visual appearance
}

export enum ResourceType {
  IRON_ORE = 'iron-ore',
  COAL = 'coal',
  COPPER_ORE = 'copper-ore',
  STONE = 'stone',
  IRON_PLATE = 'iron-plate',
  COPPER_PLATE = 'copper-plate',
  STEEL_PLATE = 'steel-plate',
  IRON_GEAR = 'iron-gear',
  STEEL_GEAR = 'steel-gear',
  ENERGY = 'energy'
}

export const RESOURCE_COLORS = {
  [ResourceType.IRON_ORE]: '#8B4513',
  [ResourceType.COAL]: '#2F2F2F',
  [ResourceType.COPPER_ORE]: '#CD7F32',
  [ResourceType.STONE]: '#A9A9A9',
  [ResourceType.IRON_PLATE]: '#B22222',
  [ResourceType.COPPER_PLATE]: '#FFD700',
  [ResourceType.STEEL_PLATE]: '#708090',
  [ResourceType.IRON_GEAR]: '#696969',
  [ResourceType.STEEL_GEAR]: '#C0C0C0',
  [ResourceType.ENERGY]: '#FFFF00'
};

export const RESOURCE_PATTERNS = {
  [ResourceType.IRON_ORE]: '◆',
  [ResourceType.COAL]: '◆',
  [ResourceType.COPPER_ORE]: '◆',
  [ResourceType.STONE]: '◆',
  [ResourceType.IRON_PLATE]: '■',
  [ResourceType.COPPER_PLATE]: '■',
  [ResourceType.STEEL_PLATE]: '■',
  [ResourceType.IRON_GEAR]: '⚙',
  [ResourceType.STEEL_GEAR]: '⚙',
  [ResourceType.ENERGY]: '⚡'
};

export const ORE_TYPES = [
  ResourceType.IRON_ORE,
  ResourceType.COAL,
  ResourceType.COPPER_ORE,
  ResourceType.STONE
];

export const isOreType = (resourceType: ResourceType): boolean => {
  return ORE_TYPES.includes(resourceType);
};
