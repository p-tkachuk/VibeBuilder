import type { Node } from '@xyflow/react';
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
    canAdd(/* resource: string, */ amount: number): boolean {
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
        if (!this.canAdd(amount)) {
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
     * @param cost Cost object
     * @param nodes Optional: if provided, checks total resources including building inventories
     */
    hasResources(cost: Record<string, number>, nodes?: Node[]): boolean {
        if (nodes) {
            return this.hasTotalResources(cost, nodes);
        }
        return Object.entries(cost).every(([resource, amount]) => {
            return (this.inventory[resource] || 0) >= amount;
        });
    }

    /**
     * Check if total resources (main inventory + storage buildings) has sufficient resources
     * @param cost Cost object
     * @param nodes All building nodes to check storage inventories
     */
    hasTotalResources(cost: Record<string, number>, nodes: Node[]): boolean {
        const total: Record<string, number> = { ...this.inventory };
        nodes.forEach(node => {
            if (node.type === 'building' && node.data.inventory) {
                const inventory = node.data.inventory as Record<string, number>;
                Object.entries(inventory).forEach(([resource, amount]) => {
                    total[resource] = (total[resource] || 0) + (amount as number);
                });
            }
        });
        return Object.entries(cost).every(([resource, amount]) => {
            return (total[resource] || 0) >= amount;
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
     * Remove resources from total resources (main inventory + storage buildings)
     * @param cost Resource cost object
     * @param nodes All building nodes
     * @returns Success status and updated nodes
     */
    removeTotalResources(cost: Record<string, number>, nodes: Node[]): { success: boolean; updatedNodes: Node[] } {
        if (!this.hasTotalResources(cost, nodes)) {
            return { success: false, updatedNodes: nodes };
        }

        const remainingCost = { ...cost };

        // First deduct from main inventory
        Object.keys(remainingCost).forEach(resource => {
            const available = this.inventory[resource] || 0;
            const needed = remainingCost[resource];
            const deduct = Math.min(available, needed);
            this.inventory[resource] = available - deduct;
            remainingCost[resource] -= deduct;
        });

        // Then deduct from storage inventories
        let updatedNodes = nodes.map(node => {
            if (node.type === 'building' && node.data.inventory && Object.keys(remainingCost).some(res => remainingCost[res] > 0)) {
                const newInv = { ...(node.data.inventory as Record<string, number>) };
                Object.keys(remainingCost).forEach(resource => {
                    if (remainingCost[resource] <= 0) return;
                    const available = newInv[resource] || 0;
                    const deduct = Math.min(available, remainingCost[resource]);
                    newInv[resource] = available - deduct;
                    remainingCost[resource] -= deduct;
                });
                return {
                    ...node,
                    data: {
                        ...node.data,
                        inventory: newInv
                    }
                };
            }
            return node;
        });

        return { success: true, updatedNodes };
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
