import type { Node, Edge } from '@xyflow/react';
import { BaseBuilding } from './BaseBuilding';
import { BUILDING_CONFIGS } from '../../types/buildings';
import { GameStateManager } from '../../managers/GameStateManager';
import { BuildingRegistry } from '../../managers/BuildingRegistry';

export class Storage extends BaseBuilding {
    constructor(
        node: Node,
        edges: Edge[],
        allNodes: Node[],
        allEdges: Edge[],
        gameStateManager: GameStateManager,
        buildingRegistry: BuildingRegistry
    ) {
        super(node, edges, allNodes, allEdges, gameStateManager, buildingRegistry);
    }
    phaseProduce(): void {
        // Doesn't produce
    }

    phasePull(): void {
        // Check if has connected input
        if (!this.hasConnectedInput()) return;

        // Check if inventory is full
        if (this.inventory.getTotal() >= this.inventory.getCapacity()) return;

        const config = BUILDING_CONFIGS[this.type];
        const inputs = config.inputs as Record<string, number>;
        const pullAmount = inputs['any'] || 1;

        // Pull resources from connected input buildings
        if (this.suppliers.length === 0) return;

        // Pull any available resources from suppliers until full or no more
        for (const supplier of this.suppliers) {
            const result = supplier.pullAnyResource(pullAmount);
            if (!result) break; // No more resources in this supplier
            this.inventory.add(result.resource, result.pulled);
            console.log(`Storage pulled ${result.pulled} ${result.resource}`);
        }
    }

    phaseConsumeAndProduce(): void {
        // Doesn't consume/produce
    }
}
