import type { Node, Edge } from '@xyflow/react';
import { BuildingType, BUILDING_CONFIGS } from '../types/buildings';
import { ResourceType } from '../types/terrain';
import type { ResourceField } from '../types/terrain';
import type { BuildingNodeData } from '../components/BuildingNode';
import { isPositionInResourceField } from '../utils/position.utils';
import { getBuildingCenter } from '../utils/position.utils';

/**
 * Service for managing building operations like mining and production
 * Follows Single Responsibility Principle by separating mining and production logic
 */
export class BuildingOperationService {
    /**
     * Process buildings to perform mining and production operations
     * @param nodes Current building nodes
     * @param edges Current edges
     * @param resourceFields Resource fields on the map
     * @returns Updated nodes with modified inventories
     */
    static processBuildings(nodes: Node[], edges: Edge[], resourceFields: ResourceField[]): Node[] {
        let updatedInventories: Record<string, Record<string, number>> = {};

        // Process mining operations
        updatedInventories = { ...updatedInventories, ...this.processMiningOperations(nodes, edges, resourceFields) };

        // Process production operations
        updatedInventories = { ...updatedInventories, ...this.processProductionOperations(nodes, edges, updatedInventories) };

        return this.applyInventoryUpdates(nodes, updatedInventories);
    }

    /**
     * Process mining operations for mining buildings
     */
    private static processMiningOperations(nodes: Node[], edges: Edge[], resourceFields: ResourceField[]): Record<string, Record<string, number>> {
        const inventoryUpdates: Record<string, Record<string, number>> = {};

        const miningBuildings = nodes.filter(node => node.type === 'building' && this.isMiningBuilding(node));

        miningBuildings.forEach(node => this.processSingleMiningOperation(node, nodes, edges, resourceFields, inventoryUpdates));

        return inventoryUpdates;
    }

    /**
     * Process a single mining operation
     */
    private static processSingleMiningOperation(
        minerNode: Node,
        allNodes: Node[],
        edges: Edge[],
        resourceFields: ResourceField[],
        inventoryUpdates: Record<string, Record<string, number>>
    ): void {
        const buildingType = minerNode.data.buildingType as BuildingType;

        // Check if output is connected
        const outputEdge = edges.find(edge => edge.source === minerNode.id);
        if (!outputEdge) return;

        const resourceType = this.getResourceTypeForMiner(buildingType);
        const center = getBuildingCenter(minerNode.position);

        // Check if placed over resource field
        if (!isPositionInResourceField(center, resourceFields, resourceType)) return;

        // Add to connected building's inventory
        this.addResourceToConnectedBuilding(outputEdge.target, allNodes, resourceType, 2, inventoryUpdates);
    }

    /**
     * Process production operations for production buildings
     */
    private static processProductionOperations(
        nodes: Node[],
        edges: Edge[],
        existingUpdates: Record<string, Record<string, number>>
    ): Record<string, Record<string, number>> {
        const inventoryUpdates: Record<string, Record<string, number>> = {};

        const productionBuildings = nodes.filter(node => node.type === 'building' && this.isProductionBuilding(node));

        productionBuildings.forEach(node => this.processSingleProductionOperation(node, nodes, edges, inventoryUpdates, existingUpdates));

        return inventoryUpdates;
    }

    /**
     * Process a single production operation
     */
    private static processSingleProductionOperation(
        producerNode: Node,
        allNodes: Node[],
        edges: Edge[],
        inventoryUpdates: Record<string, Record<string, number>>,
        existingUpdates: Record<string, Record<string, number>>
    ): void {
        // Check output connections
        const outputEdges = edges.filter(edge => edge.source === producerNode.id);
        if (outputEdges.length === 0) return;

        // Check input connections
        const inputEdges = edges.filter(edge => edge.target === producerNode.id);
        if (inputEdges.length === 0) return;

        // Process based on building type
        if (producerNode.data.buildingType === BuildingType.SMELTER) {
            this.processSmeltingOperation(allNodes, inputEdges, outputEdges, inventoryUpdates, existingUpdates);
        }
    }

    /**
     * Process smelting operation for smelters
     */
    private static processSmeltingOperation(
        /* smelterNode: Node, */
        allNodes: Node[],
        inputEdges: Edge[],
        outputEdges: Edge[],
        inventoryUpdates: Record<string, Record<string, number>>,
        existingUpdates: Record<string, Record<string, number>>
    ): void {
        const inputNode = allNodes.find(n => n.id === inputEdges[0].source);
        if (!inputNode || inputNode.type !== 'building') return;

        const inputInventory = existingUpdates[inputNode.id] || (inputNode.data as unknown as BuildingNodeData).inventory || {};

        if ((inputInventory['iron-ore'] || 0) < 1) return;

        // Consume input
        this.deductResourceFromNode(inputNode.id, 'iron-ore', 1, inventoryUpdates);

        // Produce output
        this.addResourceToConnectedBuilding(outputEdges[0].target, allNodes, 'iron-plate', 1, inventoryUpdates);
    }

    /**
     * Apply inventory updates to nodes
     */
    private static applyInventoryUpdates(nodes: Node[], inventoryUpdates: Record<string, Record<string, number>>): Node[] {
        return nodes.map(node => {
            if (node.type !== 'building') return node;

            const { id, data } = node;
            const updatedInventory = inventoryUpdates[id] || (data as unknown as BuildingNodeData).inventory || {};

            return {
                ...node,
                data: {
                    ...data,
                    inventory: updatedInventory
                }
            };
        });
    }

    /**
     * Helper methods for type checking and resource handling
     */
    private static isMiningBuilding(node: Node): boolean {
        const buildingType = node.data.buildingType as BuildingType;
        return [
            BuildingType.IRON_MINER,
            BuildingType.COPPER_MINER,
            BuildingType.COAL_MINER,
            BuildingType.STONE_MINER
        ].includes(buildingType);
    }

    private static isProductionBuilding(node: Node): boolean {
        const buildingType = node.data.buildingType as BuildingType;
        return [BuildingType.SMELTER, BuildingType.ASSEMBLER].includes(buildingType);
    }

    private static getResourceTypeForMiner(buildingType: BuildingType): ResourceType {
        const mapping: Record<string, ResourceType> = {
            [BuildingType.IRON_MINER]: ResourceType.IRON_ORE,
            [BuildingType.COPPER_MINER]: ResourceType.COPPER_ORE,
            [BuildingType.COAL_MINER]: ResourceType.COAL,
            [BuildingType.STONE_MINER]: ResourceType.STONE,
        };
        return mapping[buildingType];
    }

    private static addResourceToConnectedBuilding(
        /* sourceNodeId: string, */
        targetNodeId: string,
        allNodes: Node[],
        resourceType: string,
        amount: number,
        inventoryUpdates: Record<string, Record<string, number>>
    ): void {
        const targetNode = allNodes.find(n => n.id === targetNodeId);
        if (!targetNode || targetNode.type !== 'building') return;

        const config = BUILDING_CONFIGS[targetNode.data.buildingType as BuildingType];
        const currentInventory = inventoryUpdates[targetNodeId] || (targetNode.data as unknown as BuildingNodeData).inventory || {};
        const currentTotal = Object.values(currentInventory).reduce((sum, v) => sum + v, 0);

        let adjustedAmount = amount;
        const capacity = (config as any).capacity;
        if (capacity !== undefined && currentTotal >= capacity) {
            const availableSpace = capacity - currentTotal;
            adjustedAmount = Math.min(amount, availableSpace);
        }

        if (adjustedAmount > 0) {
            inventoryUpdates[targetNodeId] = {
                ...currentInventory,
                [resourceType]: (currentInventory[resourceType] || 0) + adjustedAmount
            };
        }
    }

    private static deductResourceFromNode(
        nodeId: string,
        resourceType: string,
        amount: number,
        inventoryUpdates: Record<string, Record<string, number>>
    ): void {
        inventoryUpdates[nodeId] = {
            ...inventoryUpdates[nodeId] || {},
            [resourceType]: Math.max(0, ((inventoryUpdates[nodeId] || {})[resourceType] || 0) - amount)
        };
    }
}
