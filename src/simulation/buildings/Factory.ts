import { BaseBuilding } from './BaseBuilding';
import { BUILDING_CONFIGS, BuildingType } from '../../types/buildings';

export class Factory extends BaseBuilding {
    tick(): void {
        // Check if has connected input
        if (!this.hasConnectedInput()) return;

        // Check if has connected output (consumers)
        if (!this.hasConnectedOutput()) return;

        // Check if inventory is full
        if (this.inventory.getTotal() >= this.inventory.getCapacity()) return;

        // Check if all required inputs are available from suppliers
        const config = BUILDING_CONFIGS[this.type];
        const inputs = config.inputs as Record<string, number>;
        const totalNeeded: Record<string, number> = {};

        for (const [resource, needed] of Object.entries(inputs)) {
            totalNeeded[resource] = needed;
        }

        // Try to pull from connected input buildings
        if (this.suppliers.length === 0) return;

        // Pull from suppliers, aggregate amounts
        let pulled: Record<string, number> = {};
        let canProduce = true;

        for (const [resource, needed] of Object.entries(totalNeeded)) {
            let remaining = needed;
            for (const supplier of this.suppliers) {
                const pulledAmount = supplier.pullResource(resource, remaining);
                pulled[resource] = (pulled[resource] || 0) + pulledAmount;
                remaining -= pulledAmount;
                if (remaining <= 0) break;
            }
            if (remaining > 0) {
                canProduce = false;
                break;
            }
        }

        if (canProduce) {
            // Produce outputs
            const outputs = config.outputs as Record<string, number>;
            for (const [resource, amount] of Object.entries(outputs)) {
                this.inventory.add(resource, amount);
            }
            console.log(`${this.type} consumed ${JSON.stringify(totalNeeded)} and produced ${JSON.stringify(outputs)}`);
        } else {
            // Return pulled resources if not enough
            for (const [resource, amount] of Object.entries(pulled)) {
                this.inventory.add(resource, amount);
            }
        }
    }
}
