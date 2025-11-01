import type { Node, Edge } from '@xyflow/react';
import { BuildingSpecialty } from '../types/buildings';
import { BaseBuilding } from './buildings/BaseBuilding';
import { BuildingRegistry } from '../managers/BuildingRegistry';

export class TickProcessor {
    static processTick(buildingRegistry: BuildingRegistry, edges: Edge[], nodes: Node[]): void {
        const buildings = buildingRegistry.getAll();

        // Update buildings with current edges and nodes for connection detection
        buildings.forEach(building => {
            // Update the building's edge/node references (we'll need to add methods for this)
            building.updateConnections(edges, nodes);
        });

        // Establish supplier relationships
        const buildingsMap: Record<string, BaseBuilding> = {};
        buildings.forEach(building => {
            buildingsMap[building.id] = building;
            building.resetEnergyShortage();
        });

        Object.values(buildings).forEach(building => {
            building.setSuppliers(buildingsMap);
        });

        // Process in separate phases: produce, pull, consume-produce
        buildings.filter(b => b.specialty === BuildingSpecialty.POWER_PLANT).forEach(building => {
            building.phasePull();
            building.getUpdatedNode(); // Sync state after phase
        });
        buildings.filter(b => b.specialty === BuildingSpecialty.POWER_PLANT).forEach(building => {
            building.phaseConsumeAndProduce();
            building.getUpdatedNode(); // Sync state after phase
        });

        buildings.filter(b => b.specialty === BuildingSpecialty.MINER).forEach(building => {
            building.phaseProduce();
            building.getUpdatedNode(); // Sync state after phase
        });
        buildings.filter(b => b.specialty !== BuildingSpecialty.POWER_PLANT).forEach(building => {
            building.phasePull();
            building.getUpdatedNode(); // Sync state after phase
        });
        buildings.filter(b => b.specialty === BuildingSpecialty.FACTORY || b.specialty === BuildingSpecialty.UTILITY).forEach(building => {
            building.phaseConsumeAndProduce();
            building.getUpdatedNode(); // Sync state after phase
        });

        // State is updated through registry - no return value needed
    }
}
