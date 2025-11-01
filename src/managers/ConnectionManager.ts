import type { Node, Edge } from '@xyflow/react';
import { BaseBuilding } from '../simulation/buildings/BaseBuilding';
import { SpatialIndex } from '../utils/SpatialIndex';

interface ConnectionData {
  inputs: string[];
  outputs: string[];
  energyInputs: string[];
}

export class ConnectionManager {
  private lastEdgesHash: string = '';
  private connectionCache = new Map<string, ConnectionData>();
  private spatialIndex = new SpatialIndex<BaseBuilding>();

  updateConnectionsIfChanged(edges: Edge[], _nodes: Node[], buildings: BaseBuilding[]): boolean {
    const edgesHash = this.hashEdges(edges);
    if (edgesHash === this.lastEdgesHash) return false; // No changes

    this.lastEdgesHash = edgesHash;
    this.rebuildConnections(edges, buildings);
    return true;
  }

  private hashEdges(edges: Edge[]): string {
    // Simple hash of edge connections
    return edges.map(e => `${e.source}-${e.target}-${e.targetHandle}`).sort().join('|');
  }

  private rebuildConnections(edges: Edge[], buildings: BaseBuilding[]): void {
    // Rebuild connection cache and spatial index
    this.connectionCache.clear();
    this.spatialIndex.clear();

    // Index buildings spatially for fast nearby queries
    buildings.forEach(building => {
      const position = building.getCurrentPosition();
      this.spatialIndex.add(building, position);
    });

    // Group edges by target building
    const edgesByTarget = new Map<string, Edge[]>();
    edges.forEach(edge => {
      if (!edgesByTarget.has(edge.target)) {
        edgesByTarget.set(edge.target, []);
      }
      edgesByTarget.get(edge.target)!.push(edge);
    });

    // Build connection data for each building
    buildings.forEach(building => {
      const buildingEdges = edgesByTarget.get(building.id) || [];
      const connectionData: ConnectionData = {
        inputs: [],
        outputs: [],
        energyInputs: []
      };

      buildingEdges.forEach(edge => {
        const sourceBuilding = buildings.find(b => b.id === edge.source);
        if (!sourceBuilding) return;

        if (edge.targetHandle === 'input') {
          connectionData.inputs.push(edge.source);
        } else if (edge.targetHandle === 'energy') {
          connectionData.energyInputs.push(edge.source);
        }
      });

      // Find output connections (edges where this building is the source)
      const outputEdges = edges.filter(edge => edge.source === building.id);
      connectionData.outputs = outputEdges.map(edge => edge.target);

      this.connectionCache.set(building.id, connectionData);
    });
  }

  getConnections(buildingId: string): ConnectionData | undefined {
    return this.connectionCache.get(buildingId);
  }

  getAllConnections(): Map<string, ConnectionData> {
    return new Map(this.connectionCache);
  }

  removeBuilding(buildingId: string): void {
    this.connectionCache.delete(buildingId);

    // Remove from spatial index if it exists
    // Note: We don't have direct access to the building object here,
    // so we'd need the position. This should be called from BuildingRegistry
    // where we have access to the building.
  }

  removeBuildingFromSpatialIndex(building: BaseBuilding): void {
    const position = building.getCurrentPosition();
    this.spatialIndex.remove(building, position);
  }
}
