import { BaseBuilding } from './BaseBuilding';

export class Storage extends BaseBuilding {
    tick(): void {
        // Check if has connected input
        if (!this.hasConnectedInput()) return;

        // Check if inventory is full
        if (this.inventory.getTotal() >= this.inventory.getCapacity()) return;

        // Pull resources from connected input buildings
        if (this.suppliers.length === 0) return;

        // Pull any available resources from suppliers until full or no more
        for (const supplier of this.suppliers) {
            while (this.inventory.getTotal() < this.inventory.getCapacity()) {
                const result = supplier.pullAnyResource(1);
                if (!result) break; // No more resources in this supplier
                this.inventory.add(result.resource, result.pulled);
                console.log(`Storage pulled ${result.pulled} ${result.resource}`);
            }
        }
    }
}
