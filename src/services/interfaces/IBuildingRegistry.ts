import type { Node, Edge } from '@xyflow/react';
import type { BaseBuilding } from '../../simulation/buildings/BaseBuilding';
import type { ResourceField } from '../../types/terrain';

export interface IBuildingRegistry {
  register(building: BaseBuilding): void;
  unregister(buildingId: string): void;
  get(buildingId: string): BaseBuilding | undefined;
  getAll(): BaseBuilding[];
  updateBuildingState(buildingId: string): void;
  updateBuildingStateWithChangeDetection(buildingId: string): void;
  createBuildingInstance(
    node: Node,
    edges: Edge[],
    allNodes: Node[],
    allEdges: Edge[],
    resourceFields?: ResourceField[],
    resourceInventory?: any
  ): Promise<BaseBuilding | null>;
  getSuppliers(buildingId: string): BaseBuilding[];
  updateSupplierCache(edges: Edge[]): void;
  batchUpdateState(updates: Array<{ buildingId: string; changes: Partial<any> }>): void;
  optimizeMemory(): void;
}
