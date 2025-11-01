import type { Node, Edge } from '@xyflow/react';
import { BuildingSpecialty } from '../types/buildings';
import { BaseBuilding } from './buildings/BaseBuilding';
import { BuildingRegistry } from '../managers/BuildingRegistry';
import { ConnectionManager } from '../managers/ConnectionManager';
import { ParallelProcessor } from '../utils/ParallelProcessor';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { OptimizationManager } from '../config/optimization.config';
import type { IEventBus } from '../services/interfaces/IEventBus';
import type { ProductionCompletedEvent, EnergyShortageEvent } from '../events/BuildingEvents';

export class TickProcessor {
    private static connectionManager = new ConnectionManager();
    private static performanceMonitor = new PerformanceMonitor();

    static async processTick(buildingRegistry: BuildingRegistry, edges: Edge[], nodes: Node[], eventBus?: IEventBus): Promise<void> {
        // Ensure BuildingRegistry has access to ConnectionManager for cleanup
        buildingRegistry.setConnectionManager(this.connectionManager);

        const endTimer = OptimizationManager.isEnabled('ENABLE_PERFORMANCE_MONITORING')
            ? this.performanceMonitor.startTimer('tick_processing')
            : () => {};

        // Subscribe to building events during processing
        const unsubscribers: (() => void)[] = [];
        if (eventBus) {
            const productionHandler = (event: ProductionCompletedEvent) => {
                // Handle production completion
                this.handleProductionCompleted(event, buildingRegistry);
            };
            const energyShortageHandler = (event: EnergyShortageEvent) => {
                // Handle energy shortage
                this.handleEnergyShortage(event, buildingRegistry);
            };

            unsubscribers.push(eventBus.subscribe('production_completed', productionHandler));
            unsubscribers.push(eventBus.subscribe('energy_shortage', energyShortageHandler));
        }

        const buildings = buildingRegistry.getAll();

        // Ensure all buildings have current edge/node references for supplier calculations
        buildings.forEach(building => {
            building.updateConnections(edges, nodes);
        });

        // Only update connection cache if edges have changed (if optimization enabled)
        const connectionsChanged = OptimizationManager.isEnabled('ENABLE_CONNECTION_CHANGE_DETECTION')
            ? this.connectionManager.updateConnectionsIfChanged(edges, nodes, buildings)
            : true; // Always update if optimization disabled

        // Update cached connections only if changed
        if (connectionsChanged) {
            buildings.forEach(building => {
                const connections = this.connectionManager.getConnections(building.id);
                if (connections) {
                    building.updateConnectionsFromCache(connections);
                    // allEdges is already set above, so supplier calculations will work
                }
            });
        }

        // Establish supplier relationships using cached suppliers
        buildings.forEach(building => {
            building.resetEnergyShortage();
        });

        // Update supplier cache only if connections changed (if optimization enabled)
        if (connectionsChanged && OptimizationManager.isEnabled('ENABLE_SUPPLIER_CACHE')) {
            buildingRegistry.updateSupplierCache(edges);
        }

        // Set suppliers - both cached and direct versions need all buildings for proper energy supplier setup
        const buildingsMap: Record<string, BaseBuilding> = {};
        buildings.forEach(building => {
            buildingsMap[building.id] = building;
        });
        buildings.forEach(building => {
            building.setSuppliers(buildingsMap);
        });

        // Collect state updates for batch processing
        const stateUpdates: Array<{ buildingId: string; changes: Partial<any> }> = [];

        // Process in separate phases: produce, pull, consume-produce
        buildings.filter(b => b.specialty === BuildingSpecialty.POWER_PLANT).forEach(building => {
            building.phasePull();
            // Collect state changes instead of immediate sync
            stateUpdates.push({
                buildingId: building.id,
                changes: {
                    inventory: building.inventory.getAll(),
                    energyShortage: building.energyShortage
                }
            });
        });
        buildings.filter(b => b.specialty === BuildingSpecialty.POWER_PLANT).forEach(building => {
            building.phaseConsumeAndProduce();
            // Collect state changes instead of immediate sync
            stateUpdates.push({
                buildingId: building.id,
                changes: {
                    inventory: building.inventory.getAll(),
                    energyShortage: building.energyShortage
                }
            });
        });

        // Process miners in parallel for better performance with large building counts
        const miners = buildings.filter(b => b.specialty === BuildingSpecialty.MINER);
        await ParallelProcessor.processInParallelSync(
            miners,
            async (building) => {
                building.phaseProduce();
                // Collect state changes instead of immediate sync
                stateUpdates.push({
                    buildingId: building.id,
                    changes: {
                        inventory: building.inventory.getAll(),
                        energyShortage: building.energyShortage
                    }
                });
            }
        );
        buildings.filter(b => b.specialty !== BuildingSpecialty.POWER_PLANT).forEach(building => {
            building.phasePull();
            // Collect state changes instead of immediate sync
            stateUpdates.push({
                buildingId: building.id,
                changes: {
                    inventory: building.inventory.getAll(),
                    energyShortage: building.energyShortage
                }
            });
        });
        buildings.filter(b => b.specialty === BuildingSpecialty.FACTORY || b.specialty === BuildingSpecialty.UTILITY).forEach(building => {
            building.phaseConsumeAndProduce();
            // Collect state changes instead of immediate sync
            stateUpdates.push({
                buildingId: building.id,
                changes: {
                    inventory: building.inventory.getAll(),
                    energyShortage: building.energyShortage
                }
            });
        });

        // Batch update all state changes at the end
        if (stateUpdates.length > 0) {
            buildingRegistry.batchUpdateState(stateUpdates);
        }

        // Record performance metrics
        endTimer();
        this.performanceMonitor.recordMemoryUsage('tick_end');

        // Clean up event subscriptions
        unsubscribers.forEach(unsub => unsub());

        // Periodic memory optimization
        if (OptimizationManager.isEnabled('ENABLE_MEMORY_OPTIMIZATION')) {
            buildingRegistry.optimizeMemory();
        }
    }

    private static handleProductionCompleted(event: ProductionCompletedEvent, buildingRegistry: BuildingRegistry): void {
        // Handle production completion - could trigger downstream processing
        const building = buildingRegistry.get(event.buildingId);
        if (building) {
            // Additional logic for production completion could go here
            // For example, triggering connected buildings or updating statistics
        }
    }

    private static handleEnergyShortage(event: EnergyShortageEvent, buildingRegistry: BuildingRegistry): void {
        // Handle energy shortage - could trigger energy redistribution or alerts
        const building = buildingRegistry.get(event.buildingId);
        if (building) {
            // Additional logic for energy shortage could go here
            // For example, reducing production rates or requesting energy from grid
        }
    }
}
