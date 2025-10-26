import { BaseBuilding } from './BaseBuilding';
import { BUILDING_CONFIGS } from '../../types/buildings';

export class Utility extends BaseBuilding {
    tick(): void {
        // Check if has connected input
        if (!this.hasConnectedInput()) return;

        // Check if has connected outputs
        if (!this.hasConnectedOutput()) return;

        // Check if inventory is full
        if (this.inventory.getTotal() >= this.inventory.getCapacity()) return;

        // Pull 2 units of any resource from suppliers
        if (this.suppliers.length === 0) return;

        let result: { resource: string, pulled: number } | null = null;

        for (const supplier of this.suppliers) {
            result = supplier.pullAnyResource(2);
            if (result && result.pulled >= 2) break; // Found one with at least 2
        }

        if (!result || result.pulled < 2) return;

        const pulledResource = result.resource;

        // Produce 1 unit for each output port
        const config = BUILDING_CONFIGS[this.type];
        const outputs = config.outputs as Record<string, number>;
        for (const [outputLabel, amount] of Object.entries(outputs)) {
            if (outputLabel.startsWith('any-') && amount > 0) {
                // Add to inventory as the pulled resource
                this.inventory.add(pulledResource, amount);
            }
        }

        console.log(`Splitter consumed ${result.pulled} ${pulledResource} and produced to outputs`);
    }
}
