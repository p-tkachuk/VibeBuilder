import { BaseBuilding } from './BaseBuilding';

export class Storage extends BaseBuilding {
    tick(): void {
        this.phasePull();
    }

    phaseProduce(): void {
        // Doesn't produce
    }

    phasePull(): void {
        // Check if has connected input
        if (!this.hasConnectedInput()) return;

        // Check if inventory is full
        if (this.inventory.getTotal() >= this.inventory.getCapacity()) return;

        // Pull resources from connected input buildings
        if (this.suppliers.length === 0) return;

        // Pull any available resources from suppliers until full or no more
        for (const supplier of this.suppliers) {
            const result = supplier.pullAnyResource(2);
            if (!result) break; // No more resources in this supplier
            this.inventory.add(result.resource, result.pulled);
            console.log(`Storage pulled ${result.pulled} ${result.resource}`);
        }
    }

    phaseConsumeAndProduce(): void {
        // Doesn't consume/produce
    }
}
