import type { Node, Edge } from '@xyflow/react';
import { BuildingType, BUILDING_CONFIGS } from '../types/buildings';
import { ResourceType } from '../types/terrain';
import type { ResourceField } from '../types/terrain';
import type { BuildingNodeData } from '../components/BuildingNode';
import { isPositionInResourceField } from '../utils/position.utils';
import { getBuildingCenter } from '../utils/position.utils';

/**
 * Service for managing building operations like mining and production
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
        const updatedInventories: Record<string, Record<string, number>> = {};

        // First pass: process mining
        nodes.forEach(node => {
            if (node.type !== 'building') return;

            const data = node.data as unknown as BuildingNodeData;
            const config = BUILDING_CONFIGS[data.buildingType];

            // Mining logic for miners
            if (data.buildingType === BuildingType.IRON_MINER ||
                data.buildingType === BuildingType.COPPER_MINER ||
                data.buildingType === BuildingType.COAL_MINER ||
                data.buildingType === BuildingType.STONE_MINER) {

                // Check if output is connected
                const outputEdge = edges.find(edge => edge.source === node.id && edge.sourceHandle === 'output-0');
                if (!outputEdge) {
                    return;
                }

                // Determine resource type
                let resourceType: ResourceType;
                switch (data.buildingType) {
                    case BuildingType.IRON_MINER:
                        resourceType = ResourceType.IRON_ORE;
                        break;
                    case BuildingType.COPPER_MINER:
                        resourceType = ResourceType.COPPER_ORE;
                        break;
                    case BuildingType.COAL_MINER:
                        resourceType = ResourceType.COAL;
                        break;
                    case BuildingType.STONE_MINER:
                        resourceType = ResourceType.STONE;
                        break;
                }

                // Check if placed over resource field
                const center = getBuildingCenter(node.position);
                if (!isPositionInResourceField(center, resourceFields, resourceType)) {
                    return;
                }

                // Add 2 resources to connected building's inventory
                const connectedNodeId = outputEdge.target;
                const connectedNode = nodes.find(n => n.id === connectedNodeId);
                if (!connectedNode || connectedNode.type !== 'building') {
                    return;
                }
                const connectedData = connectedNode.data as unknown as BuildingNodeData;
                const connectedConfig = BUILDING_CONFIGS[connectedData.buildingType];
                const currentInventory = updatedInventories[connectedNodeId] || connectedData.inventory || {};
                const currentTotal = Object.values(currentInventory).reduce((sum, v) => sum + v, 0);
                let amount = 2;
                if ((connectedConfig as any).capacity !== undefined) {
                    amount = Math.min(amount, Math.max(0, (connectedConfig as any).capacity - currentTotal));
                }
                if (amount > 0) {
                    updatedInventories[connectedNodeId] = {
                        ...currentInventory,
                        [resourceType]: (currentInventory[resourceType] || 0) + amount
                    };
                }
            }
        });

        // Second pass: process production
        nodes.forEach(node => {
            if (node.type !== 'building') return;

            const data = node.data as unknown as BuildingNodeData;
            const config = BUILDING_CONFIGS[data.buildingType];

            // Production logic for smelter
            if (data.buildingType === BuildingType.SMELTER) {
                // Check if output is connected
                const outputEdge = edges.find(edge => edge.source === node.id && edge.sourceHandle === 'output-0');
                if (!outputEdge) return;

                // Check if input is connected
                const inputEdge = edges.find(edge => edge.target === node.id && edge.targetHandle === 'input');
                if (!inputEdge) return;

                const inputNode = nodes.find(n => n.id === inputEdge.source);
                if (!inputNode || inputNode.type !== 'building') return;

                const inputData = inputNode.data as unknown as BuildingNodeData;
                const inputInventory = updatedInventories[inputNode.id] || inputData.inventory || {};

                // Check if there's enough iron-ore
                if ((inputInventory['iron-ore'] || 0) < 1) return;

                // Consume iron-ore
                updatedInventories[inputNode.id] = {
                    ...inputInventory,
                    'iron-ore': inputInventory['iron-ore'] - 1
                };

                // Produce iron-plate to connected building
                const outputConnectedNodeId = outputEdge.target;
                const outputConnectedNode = nodes.find(n => n.id === outputConnectedNodeId);
                if (!outputConnectedNode || outputConnectedNode.type !== 'building') return;

                const outputData = outputConnectedNode.data as unknown as BuildingNodeData;
                const outputConfig = BUILDING_CONFIGS[outputData.buildingType];
                const outputInventory = updatedInventories[outputConnectedNodeId] || outputData.inventory || {};
                const outputCurrentTotal = Object.values(outputInventory).reduce((sum, v) => sum + v, 0);
                let prodAmount = 1;
                if ((outputConfig as any).capacity !== undefined) {
                    prodAmount = Math.min(prodAmount, Math.max(0, (outputConfig as any).capacity - outputCurrentTotal));
                }
                if (prodAmount > 0) {
                    updatedInventories[outputConnectedNodeId] = {
                        ...outputInventory,
                        'iron-plate': (outputInventory['iron-plate'] || 0) + prodAmount
                    };
                }
            }
        });

        // Return updated nodes
        return nodes.map(node => {
            if (node.type !== 'building') return node;

            const data = node.data as unknown as BuildingNodeData;
            const updatedInventory = updatedInventories[node.id] || data.inventory || {};

            return {
                ...node,
                data: {
                    ...data,
                    inventory: updatedInventory
                }
            };
        });
    }
}
