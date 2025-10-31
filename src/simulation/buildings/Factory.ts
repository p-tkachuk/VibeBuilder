import { BaseBuilding } from './BaseBuilding';
import { BUILDING_CONFIGS } from '../../types/buildings';
import { ResourceType } from '../../types/terrain';

export class Factory extends BaseBuilding {
    phaseProduce(): void {
        // No direct production for factory
    }

    phasePull(): void {
        // Check if has connected input
        if (!this.hasConnectedInput()) return;

        // Check if inventory is full
        if (this.inventory.getTotal() >= this.inventory.getCapacity()) return;

        const config = BUILDING_CONFIGS[this.type];
        const inputs = config.inputs as Record<string, number>;
        const totalNeeded: Record<string, number> = {};
        for (const [resource, needed] of Object.entries(inputs)) {
            totalNeeded[resource] = needed;
        }

        if (this.suppliers.length === 0) return;

        // Try to pull to fill internal to needed
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

    phaseConsumeAndProduce(): void {
        // Check if has connected output (consumers)
        if (!this.hasConnectedOutput()) return;

        const config = BUILDING_CONFIGS[this.type];
        const energyConsumption = config.energyConsumption || 0;

        if (energyConsumption > 0) {
            let pulledAmount = 0;
            for (const supplier of this.energySuppliers) {
                const pulled = supplier.pullResource(ResourceType.ENERGY, energyConsumption - pulledAmount);
                pulledAmount += pulled;
                if (pulledAmount >= energyConsumption) break;
            }

            if (pulledAmount < energyConsumption) {
                // can not produce, return
                this.setEnergyShortage();
                return;
            }
        }

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

            // Produce outputs
            const outputs = config.outputs as Record<string, number>;
            for (const [resource, amount] of Object.entries(outputs)) {
                this.inventory.add(resource, amount);
            }
            console.log(`${this.type} consumed ${JSON.stringify(totalNeeded)} and produced ${JSON.stringify(outputs)}`);
        }
    }
}
