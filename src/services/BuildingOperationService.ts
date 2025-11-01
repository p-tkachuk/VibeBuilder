import type { Node, Edge } from '@xyflow/react';
import { BuildingType, BuildingSpecialty, BUILDING_CONFIGS } from '../types/buildings';
import { ResourceType } from '../types/terrain';
import type { ResourceField } from '../types/terrain';
import type { BuildingNodeData } from '../components/BuildingNode/BuildingNode';
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
        const outputEdge = edges.find(edge => edge.source === minerNode.id && allNodes.some(n => n.id === edge.target));
        if (!outputEdge) return;

        const resourceType = this.getResourceTypeForMiner(buildingType);
        const center = getBuildingCenter(minerNode.position);

        // Check if placed over resource field
        if (!isPositionInResourceField(center, resourceFields, resourceType)) return;

        const config = BUILDING_CONFIGS[buildingType];
        const outputAmount = (config.outputs as Record<string, number>)[resourceType] || 2;

        // Add to connected building's inventory
        this.addResourceToConnectedBuilding(outputEdge.target, allNodes, resourceType, outputAmount, inventoryUpdates, edges);
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
        const outputEdges = edges.filter(edge => edge.source === producerNode.id && allNodes.some(n => n.id === edge.target));
        if (outputEdges.length === 0) return;

        // Check input connections
        const inputEdges = edges.filter(edge => edge.target === producerNode.id && allNodes.some(n => n.id === edge.source));
        if (inputEdges.length === 0) return;

        // Process based on building type
        const buildingType = producerNode.data.buildingType as BuildingType;
        if (buildingType === BuildingType.SMELTER || buildingType === BuildingType.ASSEMBLER) {
            this.processGenericProductionOperation(producerNode, allNodes, inputEdges[0], outputEdges[0], inventoryUpdates, existingUpdates, BUILDING_CONFIGS[buildingType], edges);
        } else if (buildingType === BuildingType.SPLITTER) {
            this.processSplitterOperation(allNodes, inputEdges, outputEdges, inventoryUpdates, existingUpdates);
        }
    }

    /**
     * Generic process production operation for buildings with specific inputs and outputs
     */
    private static processGenericProductionOperation(
        producerNode: Node,
        allNodes: Node[],
        _inputEdge: Edge,
        outputEdge: Edge,
        inventoryUpdates: Record<string, Record<string, number>>,
        existingUpdates: Record<string, Record<string, number>>,
        config: any,
        edges: Edge[]
    ): void {
        // Check if the producer has the required inputs in its own inventory
        const producerInventory = existingUpdates[producerNode.id] || (producerNode.data as unknown as BuildingNodeData).inventory || {};

        // Check if all required inputs are available in producer's inventory
        const inputs = config.inputs as Record<string, number>;
        for (const [resource, required] of Object.entries(inputs)) {
            if ((producerInventory[resource] || 0) < required) return;
        }

        // Consume inputs from producer's inventory
        for (const [resource, required] of Object.entries(inputs)) {
            this.deductResourceFromNode(producerNode.id, resource, required, inventoryUpdates);
        }

        // Produce outputs to connected building
        const outputs = config.outputs as Record<string, number>;
        for (const [resource, amount] of Object.entries(outputs)) {
            this.addResourceToConnectedBuilding(outputEdge.target, allNodes, resource, amount, inventoryUpdates, edges);
        }
    }



    /**
     * Process splitting operation for splitters
     */
    private static processSplitterOperation(
        /* splitterNode: Node, */
        allNodes: Node[],
        inputEdges: Edge[],
        outputEdges: Edge[],
        inventoryUpdates: Record<string, Record<string, number>>,
        existingUpdates: Record<string, Record<string, number>>
    ): void {
        const inputNode = allNodes.find(n => n.id === inputEdges[0].source);
        if (!inputNode || inputNode.type !== 'building') return;

        const inputInventory = existingUpdates[inputNode.id] || (inputNode.data as unknown as BuildingNodeData).inventory || {};

        // Find a resource type with at least 1 item
        const availableResources = Object.entries(inputInventory).filter(([_, amount]) => amount >= 1);
        if (availableResources.length === 0) return;

        const [resourceType] = availableResources[0]; // Take the first available

        // Consume input
        this.deductResourceFromNode(inputNode.id, resourceType, 1, inventoryUpdates);

        // Produce to each connected output
        outputEdges.forEach(outputEdge => {
            this.addResourceToConnectedBuilding(outputEdge.target, allNodes, resourceType, 1, inventoryUpdates, /* edges for splitter */[]);
        });
    }

    /**
     * Process factory immediately when receiving resources
     */
    private static processFactoryImmediately(
        factoryNode: Node,
        allNodes: Node[],
        resourceType: string,
        amount: number,
        inventoryUpdates: Record<string, Record<string, number>>,
        edges: Edge[]
    ): void {
        const config = BUILDING_CONFIGS[factoryNode.data.buildingType as BuildingType];
        const inputs = config.inputs as Record<string, number>;

        // Check if the resource type matches the factory's input requirement
        if (!(resourceType in inputs)) return;

        const requiredAmount = inputs[resourceType];

        // Add the incoming amount to temporary inventory for processing
        const factoryInventory = inventoryUpdates[factoryNode.id] || {};

        // For simplicity, process immediately if we reach the threshold
        // Note: This doesn't handle partial accumulation well, but factories should process as much as possible
        const totalNow = (factoryInventory[resourceType] || 0) + amount;
        const batches = Math.floor(totalNow / requiredAmount);

        if (batches > 0) {
            // Find connected outputs
            const outputEdges = edges.filter(edge => edge.source === factoryNode.id);

            if (outputEdges.length === 0) return;

            // Consume inputs
            const consumed = batches * requiredAmount;
            inventoryUpdates[factoryNode.id] = {
                ...factoryInventory,
                [resourceType]: totalNow - consumed
            };

            // Produce outputs
            const outputs = config.outputs as Record<string, number>;
            for (const [outputResource, outputAmount] of Object.entries(outputs)) {
                for (const edge of outputEdges) {
                    // Send to each connected output
                    this.addResourceToConnectedBuilding(edge.target, allNodes, outputResource, outputAmount * batches, inventoryUpdates, edges);
                }
            }
        } else {
            // Accumulate the resource (though we try not to display it)
            inventoryUpdates[factoryNode.id] = {
                ...factoryInventory,
                [resourceType]: (factoryInventory[resourceType] || 0) + amount
            };
        }
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
        return [BuildingType.SMELTER, BuildingType.ASSEMBLER, BuildingType.SPLITTER].includes(buildingType);
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
        inventoryUpdates: Record<string, Record<string, number>>,
        edges: Edge[]
    ): void {
        const targetNode = allNodes.find(n => n.id === targetNodeId);
        if (!targetNode || targetNode.type !== 'building') return;

        const config = BUILDING_CONFIGS[targetNode.data.buildingType as BuildingType];

        // Only buildings with UTILITY specialty can store resources
        // FACTORY buildings process immediately and don't accumulate inventory
        if (config.specialty === BuildingSpecialty.FACTORY) {
            this.processFactoryImmediately(targetNode, allNodes, resourceType, amount, inventoryUpdates, edges);
            return;
        } else if (config.specialty !== BuildingSpecialty.UTILITY) {
            return;
        }

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
