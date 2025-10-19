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
  STONE = 'stone'
}

export const RESOURCE_COLORS = {
  [ResourceType.IRON_ORE]: '#8B4513',
  [ResourceType.COAL]: '#2F2F2F',
  [ResourceType.COPPER_ORE]: '#CD7F32',
  [ResourceType.STONE]: '#A9A9A9'
};

export const RESOURCE_PATTERNS = {
  [ResourceType.IRON_ORE]: '🔶',
  [ResourceType.COAL]: '⬛',
  [ResourceType.COPPER_ORE]: '🟠',
  [ResourceType.STONE]: '⬜'
};
