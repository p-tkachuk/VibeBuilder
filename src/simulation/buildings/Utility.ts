import { BaseBuilding } from './BaseBuilding';
import { BUILDING_CONFIGS } from '../../types/buildings';
import { ResourceType } from '../../types/terrain';

export class Utility extends BaseBuilding {
    phaseProduce(): void {
        // No direct production
    }

    phasePull(): void {
        // Check if has connected input
        if (!this.hasConnectedInput()) return;

        // Check if inventory is full
        if (this.inventory.getTotal() >= this.inventory.getCapacity()) return;

        const config = BUILDING_CONFIGS[this.type];
        const inputs = config.inputs as Record<string, number>;
        const pullAmount = inputs['any'] || 1;

        // Pull any units of any resource from suppliers
        if (this.suppliers.length === 0) return;

        let pulledAmount = 0;
        let pulledResource = 'any';

        for (const supplier of this.suppliers) {
            const result = supplier.pullAnyResource(pullAmount);
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
        const consumeAmount = inputs['any'] || 1;

        // Find any resource with at least consumeAmount
        let consumeResource = '';
        for (const res of ['iron-ore', 'coal', 'stone', 'copper-ore', ResourceType.IRON_PLATE, ResourceType.IRON_GEAR]) {
            if (this.inventory.get(res) >= consumeAmount) {
                consumeResource = res;
                break;
            }
        }

        if (consumeResource && consumeAmount >= 1) {
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
