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
    protected energySuppliers: BaseBuilding[];

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
        this.energySuppliers = []; // Set later
    }

    setSuppliers(buildings: Record<string, BaseBuilding>) {
        this.suppliers = this.getConnectedInputBuildings().map(n => buildings[n.id]).filter(b => b);
        this.energySuppliers = this.getConnectedEnergyBuildings().map(n => buildings[n.id]).filter(b => b);
    }

    protected getConnectedEnergyBuildings(): Node[] {
        const energyInputEdges = this.allEdges.filter(edge =>
            edge.target === this.id && edge.targetHandle === 'energy-input'
        );
        return energyInputEdges.map(edge => this.allNodes.find(n => n.id === edge.source)).filter(n => n) as Node[];
    }

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

    protected hasEnergyConnection(): boolean {
        // Check if this building has an energy input connected to a power plant
        const energyInputEdges = this.allEdges.filter(edge =>
            edge.target === this.id && edge.targetHandle === 'energy-input'
        );
        return energyInputEdges.some(edge => {
            const sourceNode = this.allNodes.find(n => n.id === edge.source);
            const sourceBuildingType = sourceNode?.data.buildingType as BuildingType;
            return BUILDING_CONFIGS[sourceBuildingType]?.specialty === BuildingSpecialty.POWER_PLANT;
        });
    }



    protected getOutputResources(): string[] {
        const config = BUILDING_CONFIGS[this.type];
        const outputs = Object.keys(config.outputs as Record<string, any>);
        if (outputs.includes('any')) {
            return ['iron-ore', 'coal', 'stone', 'copper-ore', ResourceType.IRON_PLATE, ResourceType.COPPER_PLATE, ResourceType.STEEL_PLATE, ResourceType.IRON_GEAR, ResourceType.STEEL_GEAR];
        }
        // Also include labeled outputs like 'any-0'
        const expanded = outputs.flatMap(key => {
            if (key.includes('any')) return ['iron-ore', 'coal', 'stone', 'copper-ore', ResourceType.IRON_PLATE, ResourceType.COPPER_PLATE, ResourceType.STEEL_PLATE, ResourceType.IRON_GEAR, ResourceType.STEEL_GEAR];
            return key;
        });
        return expanded;
    }

    pullResource(resource: string, amount: number): number {
        // Only allow pulling resources that this building outputs
        const outputResources = this.getOutputResources();
        if (!outputResources.includes(resource)) return 0;
        return this.inventory.remove(resource, amount);
    }

    pullAnyResource(maxAmount: number): { resource: string, pulled: number } | null {
        // Find a resource with at least 1, that is in outputs
        const outputResources = this.getOutputResources();
        for (const res of ['iron-ore', 'coal', 'stone', 'copper-ore', ResourceType.IRON_PLATE, ResourceType.COPPER_PLATE, ResourceType.STEEL_PLATE, ResourceType.IRON_GEAR, ResourceType.STEEL_GEAR]) {
            if (outputResources.includes(res) && this.inventory.get(res) > 0) {
                const pulled = Math.min(maxAmount, this.inventory.get(res));
                this.inventory.remove(res, pulled);
                return { resource: res, pulled };
            }
        }
        return null;
    }



    phaseProduce(): void {
        // Default: do nothing (miner overrides)
    }

    phasePull(): void {
        // Default: do nothing (miner needs no pull)
    }

    phaseConsumeAndProduce(): void {
        // Default: do nothing (storage needs no consume/produce)
    }

    getUpdatedNode(): Node {
        const updatedInventory: Record<string, number> = {};
        // Copy all resources
        for (const res of ['iron-ore', 'coal', 'stone', 'copper-ore', ResourceType.IRON_PLATE, ResourceType.COPPER_PLATE, ResourceType.STEEL_PLATE, ResourceType.IRON_GEAR, ResourceType.STEEL_GEAR/*, ResourceType.ENERGY*/]) {
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
