import type { Node, Edge } from '@xyflow/react';
import { getBuildingCenter } from '../../utils/position.utils';
import { isPositionInResourceField } from '../../utils/position.utils';
import { BaseBuilding } from './BaseBuilding';
import { BUILDING_CONFIGS } from '../../types/buildings';
import { ResourceType } from '../../types/terrain';
import type { ResourceField } from '../../types/terrain';

export class Miner extends BaseBuilding {
    private resourceFieldType: string;
    private resourceFields: ResourceField[];

    constructor(node: Node, edges: Edge[], allNodes: Node[], allEdges: Edge[], resourceFields?: ResourceField[]) {
        super(node, edges, allNodes, allEdges);

        // Map output resource string
        const outputKeys = Object.keys(BUILDING_CONFIGS[this.type].outputs as Record<string, any>);
        this.resourceFieldType = outputKeys.length > 0 ? outputKeys[0] : 'iron-ore';
        this.resourceFields = resourceFields || [];
    }

    tick(): void {
        this.phaseProduce();
    }

    phaseProduce(): void {
        // Check if placed over resource field
        const center = getBuildingCenter(this.node.position);
        if (!isPositionInResourceField(center, this.resourceFields, this.resourceFieldType as ResourceType)) return;

        // Check if has connected consumer
        if (!this.hasConnectedOutput()) return;

        // Check if inventory is full
        if (this.inventory.getTotal() >= this.inventory.getCapacity()) return;

        // Produce 1 resource
        const amount = 1;
        if (this.inventory.add(this.resourceFieldType, amount)) {
            console.log(`${this.type} produced ${amount} ${this.resourceFieldType}`);
        }
    }

    phasePull(): void {
        // Doesn't pull
    }

    phaseConsumeAndProduce(): void {
        // Doesn't consume/produce
    }
}
