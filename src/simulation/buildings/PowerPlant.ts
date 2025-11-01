import type { Node, Edge } from '@xyflow/react';
import { BaseBuilding } from './BaseBuilding';
import { BUILDING_CONFIGS } from '../../types/buildings';
import { ResourceInventoryService } from '../../services/ResourceInventoryService';
import { GameStateManager } from '../../managers/GameStateManager';
import { BuildingRegistry } from '../../managers/BuildingRegistry';

export class PowerPlant extends BaseBuilding {
    private resourceInventory?: ResourceInventoryService;

    constructor(
        node: Node,
        edges: Edge[],
        allNodes: Node[],
        allEdges: Edge[],
        gameStateManager: GameStateManager,
        buildingRegistry: BuildingRegistry,
        resourceInventory?: ResourceInventoryService
    ) {
        super(node, edges, allNodes, allEdges, gameStateManager, buildingRegistry);
        this.resourceInventory = resourceInventory;
    }

    phaseProduce(): void {
        // Power plants don't produce directly from resources like miners
    }

    phasePull(): void {
        // Check if inventory is full
        if (this.inventory.getTotal() >= this.inventory.getCapacity()) return;

        const config = BUILDING_CONFIGS[this.type];
        const inputs = config.inputs as Record<string, number>;
        const totalNeeded: Record<string, number> = {};
        for (const [resource, needed] of Object.entries(inputs)) {
            totalNeeded[resource] = needed;
        }

        // Try to pull from connected suppliers first
        if (this.suppliers.length > 0) {
            for (const [resource, needed] of Object.entries(totalNeeded)) {
                const availableInternal = this.inventory.get(resource);
                if (availableInternal >= needed) continue; // Already enough

                const requiredToPull = needed - availableInternal;
                let pulledAmount = 0;

                for (const supplier of this.suppliers) {
                    const pulled = supplier.pullResource(resource, requiredToPull - pulledAmount);
                    pulledAmount += pulled;
                    if (pulledAmount >= requiredToPull) break;
                }

                // Add pulled to internal regardless
                if (pulledAmount > 0) {
                    this.inventory.add(resource, pulledAmount);
                }
            }
        }

        // If we still don't have enough coal, try to pull from global inventory as fallback
        if (this.resourceInventory) {
            for (const [resource, needed] of Object.entries(totalNeeded)) {
                const availableInternal = this.inventory.get(resource);
                if (availableInternal >= needed) continue; // Already enough

                const requiredToPull = needed - availableInternal;
                const globalInventory = this.resourceInventory.getInventory();
                const availableGlobal = globalInventory[resource] || 0;

                if (availableGlobal > 0) {
                    const amountToPull = Math.min(requiredToPull, availableGlobal);
                    // Remove from global inventory
                    this.resourceInventory.removeResources({ [resource]: amountToPull });
                    // Add to building inventory
                    this.inventory.add(resource, amountToPull);
                }
            }
        }
    }

    phaseConsumeAndProduce(): void {
        // Check if has connected output (consumers)
        if (!this.hasConnectedOutput()) return;

        const config = BUILDING_CONFIGS[this.type];
        const inputs = config.inputs as Record<string, number>;
        const totalNeeded: Record<string, number> = {};
        for (const [resource, needed] of Object.entries(inputs)) {
            totalNeeded[resource] = needed;
        }

        // Check if enough in internal to consume
        let canProduce = true;
        for (const [resource, needed] of Object.entries(totalNeeded)) {
            if (this.inventory.get(resource) < needed) {
                canProduce = false;
                break;
            }
        }

        if (canProduce) {
            // Consume from internal
            for (const [resource, needed] of Object.entries(totalNeeded)) {
                this.inventory.remove(resource, needed);
            }

            // Produce outputs (energy)
            const outputs = config.outputs as Record<string, number>;
            for (const [resource, amount] of Object.entries(outputs)) {
                this.inventory.add(resource, amount);
            }
            console.log(`${this.type} consumed ${JSON.stringify(totalNeeded)} and produced ${JSON.stringify(outputs)}`);
        }
    }
}
