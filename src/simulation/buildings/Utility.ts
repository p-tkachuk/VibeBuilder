import { BaseBuilding } from './BaseBuilding';
import { BUILDING_CONFIGS } from '../../types/buildings';
import { ResourceType } from '../../types/terrain';

export class Utility extends BaseBuilding {
    tick(): void {
        this.phasePull();
        this.phaseConsumeAndProduce();
    }

    phaseProduce(): void {
        // No direct production
    }

    phasePull(): void {
        // Check if has connected input
        if (!this.hasConnectedInput()) return;

        // Check if inventory is full
        if (this.inventory.getTotal() >= this.inventory.getCapacity()) return;

        // Pull 2 units of any resource from suppliers
        if (this.suppliers.length === 0) return;

        let pulledAmount = 0;
        let pulledResource = 'any';

        for (const supplier of this.suppliers) {
            const result = supplier.pullAnyResource(2);
            if (result) {
                pulledAmount = result.pulled;
                pulledResource = result.resource;
                break; // Take from first supplier
            }
        }

        if (pulledAmount > 0) {
            this.inventory.add(pulledResource, pulledAmount);
        }
    }

    phaseConsumeAndProduce(): void {
        // Check if has connected outputs
        if (!this.hasConnectedOutput()) return;

        const config = BUILDING_CONFIGS[this.type];
        const inputs = config.inputs as Record<string, number>;
        // For splitter, inputs { 'any': 2 }

        // Find any resource with at least 2
        let consumeResource = '';
        let consumeAmount = 0;
        for (const res of ['iron-ore', 'coal', 'stone', 'copper-ore', ResourceType.IRON_PLATE, ResourceType.IRON_GEAR]) {
            if (this.inventory.get(res) >= 2) {
                consumeResource = res;
                consumeAmount = 2;
                break;
            }
        }

        if (consumeAmount >= 2) {
            // Consume
            this.inventory.remove(consumeResource, consumeAmount);

            // Produce 1 unit for each output port
            const outputs = config.outputs as Record<string, number>;
            for (const [outputLabel, amount] of Object.entries(outputs)) {
                if (outputLabel.includes('any-') && amount > 0) {
                    // Add to inventory as the consumed resource
                    this.inventory.add(consumeResource, amount);
                }
            }

            console.log(`${this.type} consumed ${consumeAmount} ${consumeResource} and produced to outputs`);
        }
    }
}
