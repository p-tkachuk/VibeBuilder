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
        // Each tick, we temporarily create building instances, process their logic, and update the nodes
        // This ensures that building logic is driven by the immutable node state
        // Node creation/update performance is acceptable for typical game configurations

        const buildings: Record<string, BaseBuilding> = {};

        // Instantiate building objects for processing this tick
        nodes.forEach(node => {
            if (node.type === 'building') {
                const building = this.createBuilding(node, edges, nodes, edges, resourceFields);
                if (building) {
                    buildings[node.id] = building;
                }
            }
        });

        // Establish supplier relationships after instantiation
        Object.values(buildings).forEach(building => {
            building.setSuppliers(buildings);
        });

        // Process in separate phases: produce, pull, consume-produce
        Object.values(buildings).filter(b => b.specialty === BuildingSpecialty.MINER).forEach(building => building.phaseProduce());
        Object.values(buildings).forEach(building => building.phasePull());
        Object.values(buildings).filter(b => b.specialty === BuildingSpecialty.FACTORY || b.specialty === BuildingSpecialty.UTILITY).forEach(building => building.phaseConsumeAndProduce());

        // Update nodes with the processed inventory states
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
