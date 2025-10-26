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
  IRON_GEAR = 'iron-gear'
}

export const RESOURCE_COLORS = {
  [ResourceType.IRON_ORE]: '#8B4513',
  [ResourceType.COAL]: '#2F2F2F',
  [ResourceType.COPPER_ORE]: '#CD7F32',
  [ResourceType.STONE]: '#A9A9A9',
  [ResourceType.IRON_PLATE]: '#696969',
  [ResourceType.IRON_GEAR]: '#808080'
};

export const RESOURCE_PATTERNS = {
  [ResourceType.IRON_ORE]: '🔶',
  [ResourceType.COAL]: '⬛',
  [ResourceType.COPPER_ORE]: '🟠',
  [ResourceType.STONE]: '⬜',
  [ResourceType.IRON_PLATE]: '🟫',
  [ResourceType.IRON_GEAR]: '⚙️'
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
