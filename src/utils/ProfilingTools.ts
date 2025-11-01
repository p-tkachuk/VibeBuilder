import { PerformanceMonitor } from './PerformanceMonitor';
import { OptimizationManager } from '../config/optimization.config';
import { TickProcessor } from '../simulation/TickProcessor';
import { BuildingRegistry } from '../managers/BuildingRegistry';
import { BuildingSpecialty } from '../types/buildings';
import type { Node, Edge } from '@xyflow/react';

export class ProfilingTools {
  private static monitor = new PerformanceMonitor();
  private static isActive = false;

  /**
   * Start comprehensive profiling session
   */
  static startProfiling(): void {
    this.isActive = true;
    this.monitor.reset();
    console.log('🔍 Profiling session started');
  }

  /**
   * Stop profiling and generate report
   */
  static stopProfiling(): void {
    this.isActive = false;
    this.generateReport();
    console.log('🔍 Profiling session ended');
  }

  /**
   * Profile a single tick
   */
  static async profileTick(
    buildingRegistry: BuildingRegistry,
    edges: Edge[],
    nodes: Node[]
  ): Promise<void> {
    if (!this.isActive) return;

    const startTime = performance.now();
    const initialMemory = this.monitor.getMemoryUsage();

    // Profile individual phases
    await this.profileTickPhases(buildingRegistry, edges, nodes);

    const endTime = performance.now();
    const finalMemory = this.monitor.getMemoryUsage();

    // Record overall metrics
    this.monitor.recordTime('tick_total', endTime - startTime);

    if (initialMemory && finalMemory) {
      this.monitor.recordTime('tick_memory_delta',
        finalMemory.used - initialMemory.used);
    }
  }

  /**
   * Profile individual phases of tick processing
   */
  private static async profileTickPhases(
    buildingRegistry: BuildingRegistry,
    edges: Edge[],
    nodes: Node[]
  ): Promise<void> {
    const buildings = buildingRegistry.getAll();

    // Profile connection updates
    if (OptimizationManager.isEnabled('ENABLE_CONNECTION_CHANGE_DETECTION')) {
      const connStart = performance.now();
      // Simulate connection checking logic
      const connectionManager = (TickProcessor as any).connectionManager;
      if (connectionManager) {
        connectionManager.updateConnectionsIfChanged(edges, nodes, buildings);
      }
      this.monitor.recordTime('connections_update', performance.now() - connStart);
    }

    // Profile supplier setup
    const supplierStart = performance.now();
    buildings.forEach(building => {
      building.resetEnergyShortage();
    });

    if (OptimizationManager.isEnabled('ENABLE_SUPPLIER_CACHE')) {
      buildingRegistry.updateSupplierCache(edges);
      buildings.forEach(building => {
        const suppliers = buildingRegistry.getSuppliers(building.id);
        building.setSuppliers(Object.fromEntries(suppliers.map(s => [s.id, s])));
      });
    }
    this.monitor.recordTime('suppliers_setup', performance.now() - supplierStart);

    // Profile processing phases
    const processingStart = performance.now();

    // Power plants
    const powerPlantStart = performance.now();
    buildings.filter(b => b.specialty === BuildingSpecialty.POWER_PLANT).forEach(building => {
      building.phasePull();
      building.phaseConsumeAndProduce();
    });
    this.monitor.recordTime('power_plants', performance.now() - powerPlantStart);

    // Miners (potentially parallel)
    const minerStart = performance.now();
    const miners = buildings.filter(b => b.specialty === BuildingSpecialty.MINER);
    if (OptimizationManager.isEnabled('ENABLE_PARALLEL_PROCESSING') && miners.length > 10) {
      // Parallel processing would happen here
      miners.forEach(building => building.phaseProduce());
    } else {
      miners.forEach(building => building.phaseProduce());
    }
    this.monitor.recordTime('miners', performance.now() - minerStart);

    // Other buildings
    const otherStart = performance.now();
    buildings.filter(b => b.specialty !== BuildingSpecialty.POWER_PLANT).forEach(building => {
      building.phasePull();
    });
    buildings.filter(b => b.specialty === BuildingSpecialty.FACTORY || b.specialty === BuildingSpecialty.UTILITY).forEach(building => {
      building.phaseConsumeAndProduce();
    });
    this.monitor.recordTime('other_buildings', performance.now() - otherStart);

    this.monitor.recordTime('processing_total', performance.now() - processingStart);
  }

  /**
   * Generate comprehensive profiling report
   */
  private static generateReport(): void {
    console.group('📊 Performance Profiling Report');

    const metrics = this.monitor.getAllMetrics();

    // Overall performance
    if (metrics.tick_total) {
      console.log('🎯 Overall Performance:');
      console.log(`  Average tick time: ${metrics.tick_total.average.toFixed(2)}ms`);
      console.log(`  95th percentile: ${metrics.tick_total.p95.toFixed(2)}ms`);
      console.log(`  Max tick time: ${metrics.tick_total.max.toFixed(2)}ms`);
    }

    // Phase breakdown
    console.log('🔧 Phase Breakdown:');
    const phases = ['connections_update', 'suppliers_setup', 'power_plants', 'miners', 'other_buildings', 'processing_total'];
    phases.forEach(phase => {
      if (metrics[phase]) {
        const percentage = metrics.tick_total
          ? (metrics[phase].average / metrics.tick_total.average * 100).toFixed(1)
          : 'N/A';
        console.log(`  ${phase}: ${metrics[phase].average.toFixed(2)}ms (${percentage}%)`);
      }
    });

    // Memory analysis
    if (metrics.tick_memory_delta) {
      console.log('💾 Memory Analysis:');
      console.log(`  Average memory delta: ${metrics.tick_memory_delta.average.toFixed(0)} bytes`);
      console.log(`  Memory growth rate: ${(metrics.tick_memory_delta.average / 1000).toFixed(2)} KB/tick`);
    }

    // Recommendations
    this.generateRecommendations(metrics);

    console.groupEnd();
  }

  /**
   * Generate optimization recommendations based on profiling data
   */
  private static generateRecommendations(metrics: any): void {
    console.log('💡 Recommendations:');

    const recommendations: string[] = [];

    // Check for bottlenecks
    if (metrics.connections_update && metrics.tick_total) {
      const connPercentage = metrics.connections_update.average / metrics.tick_total.average;
      if (connPercentage > 0.3) {
        recommendations.push('High connection update overhead - consider optimizing edge change detection');
      }
    }

    if (metrics.suppliers_setup && metrics.tick_total) {
      const supplierPercentage = metrics.suppliers_setup.average / metrics.tick_total.average;
      if (supplierPercentage > 0.2) {
        recommendations.push('Supplier setup is significant - ensure caching is working properly');
      }
    }

    if (metrics.miners && metrics.tick_total) {
      const minerPercentage = metrics.miners.average / metrics.tick_total.average;
      if (minerPercentage > 0.5 && !OptimizationManager.isEnabled('ENABLE_PARALLEL_PROCESSING')) {
        recommendations.push('Miners dominate processing time - consider enabling parallel processing');
      }
    }

    // Memory recommendations
    if (metrics.tick_memory_delta) {
      const growthRate = metrics.tick_memory_delta.average;
      if (growthRate > 10000) { // 10KB per tick
        recommendations.push('High memory growth detected - check for memory leaks');
      }
    }

    // Performance targets
    if (metrics.tick_total) {
      const avgTime = metrics.tick_total.average;
      if (avgTime > 16) { // 60 FPS target
        recommendations.push(`Average tick time (${avgTime.toFixed(2)}ms) exceeds 60 FPS target (16ms)`);
      }
      if (metrics.tick_total.p95 > 33) { // 30 FPS minimum
        recommendations.push(`95th percentile (${metrics.tick_total.p95.toFixed(2)}ms) may cause frame drops`);
      }
    }

    if (recommendations.length === 0) {
      console.log('  ✅ Performance looks good! No major issues detected.');
    } else {
      recommendations.forEach(rec => console.log(`  ⚠️  ${rec}`));
    }
  }

  /**
   * Export profiling data for external analysis
   */
  static exportData(): string {
    const metrics = this.monitor.getAllMetrics();
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      config: OptimizationManager.getConfig(),
      metrics
    }, null, 2);
  }

  /**
   * Compare current run with baseline
   */
  static compareWithBaseline(baselineData: string): void {
    try {
      const baseline = JSON.parse(baselineData);
      const current = this.monitor.getAllMetrics();

      console.group('📈 Performance Comparison');

      if (baseline.metrics.tick_total && current.tick_total) {
        const baselineAvg = baseline.metrics.tick_total.average;
        const currentAvg = current.tick_total.average;
        const change = ((currentAvg - baselineAvg) / baselineAvg * 100).toFixed(1);

        console.log(`Tick time: ${baselineAvg.toFixed(2)}ms → ${currentAvg.toFixed(2)}ms (${change}%)`);
      }

      console.groupEnd();
    } catch (error) {
      console.error('Failed to parse baseline data:', error);
    }
  }

  /**
   * Real-time monitoring for development
   */
  static startRealtimeMonitoring(intervalMs: number = 5000): () => void {
    console.log('🔴 Started real-time performance monitoring');

    const interval = setInterval(() => {
      const metrics = this.monitor.getAllMetrics();

      if (metrics.tick_total && metrics.tick_total.count > 0) {
        const recentTicks = Math.min(10, metrics.tick_total.count);
        const recentAvg = metrics.tick_total.average;

        const status = recentAvg < 16 ? '🟢' : recentAvg < 33 ? '🟡' : '🔴';
        console.log(`${status} Avg tick time (last ${recentTicks}): ${recentAvg.toFixed(2)}ms`);
      }
    }, intervalMs);

    return () => {
      clearInterval(interval);
      console.log('🔴 Stopped real-time performance monitoring');
    };
  }
}

// Development helpers
export const createProfilingSession = () => ({
  start: () => ProfilingTools.startProfiling(),
  stop: () => ProfilingTools.stopProfiling(),
  export: () => ProfilingTools.exportData(),
  realtime: (interval?: number) => ProfilingTools.startRealtimeMonitoring(interval)
});

// Quick profiling helpers for development
export const profile = {
  start: ProfilingTools.startProfiling.bind(ProfilingTools),
  stop: ProfilingTools.stopProfiling.bind(ProfilingTools),
  session: createProfilingSession
};
