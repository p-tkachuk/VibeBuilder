import type { Node, Edge } from '@xyflow/react';
import { BuildingType, BuildingSpecialty, BUILDING_CONFIGS } from '../types/buildings';
import type { ResourceField } from '../types/terrain';
import { BaseBuilding } from './buildings/BaseBuilding';
import { Miner } from './buildings/Miner';
import { Factory } from './buildings/Factory';
import { Utility } from './buildings/Utility';
import { Storage } from './buildings/Storage';

export class TickProcessor {
    static processTick(nodes: Node[], edges: Edge[], resourceFields: ResourceField[]): Node[] {
        const buildings: Record<string, BaseBuilding> = {};

        // Instantiate building objects for all building nodes
        nodes.forEach(node => {
            if (node.type === 'building') {
                const building = this.createBuilding(node, edges, nodes, edges, resourceFields);
                if (building) {
                    buildings[node.id] = building;
                }
            }
        });

        // Set suppliers after all buildings are created
        Object.values(buildings).forEach(building => {
            building.setSuppliers(buildings);
        });

        // Process each building's tick in order: producers first
        const order: BuildingSpecialty[] = [BuildingSpecialty.MINER, BuildingSpecialty.FACTORY, BuildingSpecialty.STORAGE, BuildingSpecialty.UTILITY];
        order.forEach(specialty => {
            Object.values(buildings).filter(b => b.specialty === specialty).forEach(building => building.tick());
        });

        // Return updated nodes
        return nodes.map(node => {
            if (node.type === 'building' && buildings[node.id]) {
                return buildings[node.id].getUpdatedNode();
            }
            return node;
        });
    }

    private static createBuilding(node: Node, edges: Edge[], allNodes: Node[], allEdges: Edge[], resourceFields: ResourceField[]): BaseBuilding {
        const buildingType = node.data.buildingType as BuildingType;
        if (!buildingType) throw new Error(`Invalid building type for node ${node.id}`);

        const config = BUILDING_CONFIGS[buildingType];
        if (!config) throw new Error(`Unknown building type ${buildingType} for node ${node.id}`);

        const specialty = config.specialty;

        switch (specialty) {
            case BuildingSpecialty.MINER:
                return new Miner(node, edges, allNodes, allEdges, resourceFields);
            case BuildingSpecialty.FACTORY:
                return new Factory(node, edges, allNodes, allEdges);
            case BuildingSpecialty.UTILITY:
                return new Utility(node, edges, allNodes, allEdges);
            case BuildingSpecialty.STORAGE:
                return new Storage(node, edges, allNodes, allEdges);
            default:
                throw new Error(`Unsupported building specialty ${specialty} for node ${node.id}`);
        }
    }
}
