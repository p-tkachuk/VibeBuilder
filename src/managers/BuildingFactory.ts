import type { Node, Edge } from '@xyflow/react';
import { BaseBuilding } from '../simulation/buildings/BaseBuilding';
import { GameStateManager } from './GameStateManager';
import { BuildingRegistry } from './BuildingRegistry';
import { BuildingType } from '../types/buildings';
import type { ResourceField } from '../types/terrain';

// Lazy imports to avoid circular dependencies
const createBuildingInstance = async (
  node: Node,
  edges: Edge[],
  allNodes: Node[],
  allEdges: Edge[],
  gameStateManager: GameStateManager,
  buildingRegistry: BuildingRegistry,
  resourceFields?: ResourceField[],
  resourceInventory?: any
): Promise<BaseBuilding | null> => {
  const buildingType = node.data.buildingType as BuildingType;
  if (!buildingType) return null;

  switch (buildingType) {
    case BuildingType.COPPER_MINER:
    case BuildingType.COAL_MINER:
    case BuildingType.IRON_MINER:
    case BuildingType.STONE_MINER: {
      const { Miner } = await import('../simulation/buildings/Miner');
      return new Miner(node, edges, allNodes, allEdges, gameStateManager, buildingRegistry, resourceFields);
    }

    case BuildingType.SMELTER:
    case BuildingType.COPPER_SMELTER:
    case BuildingType.STEEL_FURNACE:
    case BuildingType.ASSEMBLER:
    case BuildingType.STEEL_ASSEMBLER: {
      const { Factory } = await import('../simulation/buildings/Factory');
      return new Factory(node, edges, allNodes, allEdges, gameStateManager, buildingRegistry);
    }

    case BuildingType.SPLITTER: {
      const { Utility } = await import('../simulation/buildings/Utility');
      return new Utility(node, edges, allNodes, allEdges, gameStateManager, buildingRegistry);
    }

    case BuildingType.STORAGE: {
      const { Storage } = await import('../simulation/buildings/Storage');
      return new Storage(node, edges, allNodes, allEdges, gameStateManager, buildingRegistry);
    }

    case BuildingType.COAL_POWER_PLANT: {
      const { PowerPlant } = await import('../simulation/buildings/PowerPlant');
      return new PowerPlant(node, edges, allNodes, allEdges, gameStateManager, buildingRegistry, resourceInventory);
    }

    default:
      console.error(`Unknown building type: ${buildingType}`);
      return null;
  }
};

export { createBuildingInstance };
