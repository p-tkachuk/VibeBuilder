import type { Node, Edge } from '@xyflow/react';
import { BuildingType, BuildingSpecialty, BUILDING_CONFIGS } from '../../types/buildings';
import { ResourceType } from '../../types/terrain';

export interface InventoryManager {
    add(resource: string, amount: number): boolean;
    remove(resource: string, amount: number): number;
    get(resource: string): number;
    getTotal(): number;
    getCapacity(): number;
    has(resource: string, amount: number): boolean;
}

export class SimpleInventory implements InventoryManager {
    private inventory: Record<string, number> = {};
    private capacity: number;

    constructor(capacity: number) {
        this.capacity = capacity;
    }

    add(resource: string, amount: number): boolean {
        const currentTotal = this.getTotal();
        const spaceAvailable = this.capacity - currentTotal;
        if (spaceAvailable <= 0) return false;

        const addAmount = Math.min(amount, spaceAvailable);
        this.inventory[resource] = (this.inventory[resource] || 0) + addAmount;
        return addAmount > 0;
    }

    remove(resource: string, amount: number): number {
        const available = this.inventory[resource] || 0;
        const removeAmount = Math.min(amount, available);
        this.inventory[resource] = available - removeAmount;
        return removeAmount;
    }

    get(resource: string): number {
        return this.inventory[resource] || 0;
    }

    getTotal(): number {
        return Object.values(this.inventory).reduce((sum, val) => sum + val, 0);
    }

    getCapacity(): number {
        return this.capacity;
    }

    has(resource: string, amount: number): boolean {
        return (this.inventory[resource] || 0) >= amount;
    }
}

export abstract class BaseBuilding {
    protected id: string;
    protected type: BuildingType;
    public specialty: BuildingSpecialty;
    protected inventory: InventoryManager;
    protected node: Node;
    protected edges: Edge[];
    protected allNodes: Node[];
    protected allEdges: Edge[];

    protected suppliers: BaseBuilding[];

    constructor(node: Node, edges: Edge[], allNodes: Node[], allEdges: Edge[]) {
        this.node = node;
        this.edges = edges;
        this.allNodes = allNodes;
        this.allEdges = allEdges;
        this.id = node.id;
        this.type = node.data.buildingType as BuildingType;
        this.specialty = BUILDING_CONFIGS[this.type].specialty;

        const config = BUILDING_CONFIGS[this.type];
        const capacity = (config as any).capacity || (config as any).inventoryCapacity || 10;
        this.inventory = new SimpleInventory(capacity);
        if (node.data.inventory) {
            // Load existing inventory
            Object.entries(node.data.inventory as Record<string, number>).forEach(([res, amt]) =>
                this.inventory.add(res, amt));
        }

        this.suppliers = []; // Set later
    }

    setSuppliers(buildings: Record<string, BaseBuilding>) {
        this.suppliers = this.getConnectedInputBuildings().map(n => buildings[n.id]).filter(b => b);
    }

    abstract tick(): void;

    protected hasConnectedInput(): boolean {
        return this.edges.some(edge => edge.target === this.id);
    }

    protected hasConnectedOutput(): boolean {
        return this.edges.some(edge => edge.source === this.id);
    }

    protected getConnectedInputBuildings(): Node[] {
        const inputEdges = this.allEdges.filter(edge => edge.target === this.id);
        return inputEdges.map(edge => this.allNodes.find(n => n.id === edge.source)).filter(n => n) as Node[];
    }

    protected getConnectedOutputBuildings(): Node[] {
        const outputEdges = this.allEdges.filter(edge => edge.source === this.id);
        return outputEdges.map(edge => this.allNodes.find(n => n.id === edge.target)).filter(n => n) as Node[];
    }

    protected pushResource(toBuilding: BaseBuilding, resource: string, amount: number): boolean {
        return false;
    }

    pullResource(resource: string, amount: number): number {
        return this.inventory.remove(resource, amount);
    }

    pullAnyResource(maxAmount: number): { resource: string, pulled: number } | null {
        // Find a resource with at least 1
        // This is a simple implementation, pulls from first resource found
        for (const res of ['iron-ore', 'coal', 'stone', 'copper-ore', ResourceType.IRON_PLATE, ResourceType.IRON_GEAR]) {
            if (this.inventory.get(res) > 0) {
                const pulled = Math.min(maxAmount, this.inventory.get(res));
                this.inventory.remove(res, pulled);
                return { resource: res, pulled };
            }
        }
        return null;
    }

    getUpdatedNode(): Node {
        const updatedInventory: Record<string, number> = {};
        // Copy all resources
        for (const res of ['iron-ore', 'coal', 'stone', 'copper-ore', ResourceType.IRON_PLATE, ResourceType.IRON_GEAR]) {
            const amt = this.inventory.get(res);
            if (amt > 0) updatedInventory[res] = amt;
        }

        return {
            ...this.node,
            data: {
                ...this.node.data,
                inventory: updatedInventory
            }
        };
    }
}
