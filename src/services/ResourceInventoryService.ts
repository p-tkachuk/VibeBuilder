import { GAME_CONFIG } from '../config/game.config';

/**
 * Service for managing resource inventory
 * Handles adding/removing resources with storage capacity limits
 */
export class ResourceInventoryService {
    private inventory: Record<string, number> = {};
    private storageCapacity: number;

    constructor() {
        this.storageCapacity = GAME_CONFIG.storageCapacity;
        this.initializeStartingResources();
    }

    /**
     * Initialize inventory with starting resources
     */
    private initializeStartingResources() {
        Object.entries(GAME_CONFIG.startingResources).forEach(([resource, amount]) => {
            this.inventory[resource] = amount;
        });
    }

    /**
     * Get current inventory
     */
    getInventory(): Record<string, number> {
        return { ...this.inventory };
    }

    /**
     * Get storage capacity
     */
    getStorageCapacity(): number {
        return this.storageCapacity;
    }

    /**
     * Calculate total stored resources
     */
    getTotalStored(): number {
        return Object.values(this.inventory).reduce((sum, amount) => sum + amount, 0);
    }

    /**
     * Check if can add resources without exceeding storage
     */
    canAdd(resource: string, amount: number): boolean {
        const currentStored = this.getTotalStored();
        const newStored = currentStored + amount;
        return newStored <= this.storageCapacity;
    }

    /**
     * Add resources to inventory
     * @param resource Resource type
     * @param amount Amount to add
     * @returns Success status and actual amount added
     */
    addResource(resource: string, amount: number): { success: boolean; added: number } {
        if (!this.canAdd(resource, amount)) {
            // Calculate how much we can actually add
            const availableSpace = this.storageCapacity - this.getTotalStored();
            amount = Math.min(amount, Math.max(0, availableSpace));
        }

        if (amount > 0) {
            this.inventory[resource] = (this.inventory[resource] || 0) + amount;
            return { success: true, added: amount };
        }

        return { success: false, added: 0 };
    }

    /**
     * Check if inventory has sufficient resources
     */
    hasResources(cost: Record<string, number>): boolean {
        return Object.entries(cost).every(([resource, amount]) => {
            return (this.inventory[resource] || 0) >= amount;
        });
    }

    /**
     * Remove resources from inventory (for building costs, etc.)
     * @param cost Resource cost object
     * @returns Success status
     */
    removeResources(cost: Record<string, number>): boolean {
        if (!this.hasResources(cost)) {
            return false;
        }

        Object.entries(cost).forEach(([resource, amount]) => {
            this.inventory[resource] = (this.inventory[resource] || 0) - amount;
        });

        return true;
    }

    /**
     * Increase storage capacity
     * @param amount Amount to increase capacity by
     */
    increaseStorageCapacity(amount: number) {
        this.storageCapacity += amount;
    }

    /**
     * Decrease storage capacity
     * @param amount Amount to decrease capacity by
     */
    decreaseStorageCapacity(amount: number) {
        this.storageCapacity = Math.max(0, this.storageCapacity - amount);
    }
}
