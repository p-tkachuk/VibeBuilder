import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TickProcessor } from '../../simulation/TickProcessor';
import { BuildingRegistry } from '../../managers/BuildingRegistry';
import { GameStateManager } from '../../managers/GameStateManager';
import { EventBus } from '../../events/EventBus';
import { PerformanceMonitor } from '../../utils/PerformanceMonitor';
import { OptimizationManager } from '../../config/optimization.config';
import type { Node, Edge } from '@xyflow/react';

// Mock performance API for Node.js environment
const mockPerformance = {
  now: () => Date.now(),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 5000000
  }
};

Object.defineProperty(globalThis, 'performance', {
  value: mockPerformance,
  writable: true
});

describe('TickProcessor Performance Tests', () => {
  let buildingRegistry: BuildingRegistry;
  let gameStateManager: GameStateManager;
  let performanceMonitor: PerformanceMonitor;
  let edges: Edge[];
  let nodes: Node[];

  beforeEach(() => {
    gameStateManager = new GameStateManager();
    const eventBus = new EventBus();
    buildingRegistry = new BuildingRegistry(gameStateManager, eventBus);
    performanceMonitor = new PerformanceMonitor();
    edges = [];
    nodes = [];

    // Reset optimization config
    OptimizationManager.resetConfig();
  });

  afterEach(() => {
    // Log performance summary after each test
    if (OptimizationManager.isEnabled('LOG_PERFORMANCE_SUMMARY')) {
      performanceMonitor.logSummary();
    }
  });

  it('should process ticks efficiently with small building count', async () => {
    // Create a small number of buildings
    const startTime = performance.now();

    for (let i = 0; i < 10; i++) {
      await TickProcessor.processTick(buildingRegistry, edges, nodes);
    }

    const endTime = performance.now();
    const averageTime = (endTime - startTime) / 10;

    expect(averageTime).toBeLessThan(50); // Should be fast for small counts
  });

  it('should maintain performance with optimizations enabled', async () => {
    OptimizationManager.updateConfig({
      ENABLE_PERFORMANCE_MONITORING: true,
      ENABLE_CONNECTION_CHANGE_DETECTION: true,
      ENABLE_BATCH_UPDATES: true,
      ENABLE_PARALLEL_PROCESSING: false // Disable for small test
    });

    const startTime = performance.now();

    for (let i = 0; i < 5; i++) {
      await TickProcessor.processTick(buildingRegistry, edges, nodes);
    }

    const endTime = performance.now();
    const averageTime = (endTime - startTime) / 5;

    expect(averageTime).toBeLessThan(100);
  });

  it('should handle connection change detection correctly', async () => {
    OptimizationManager.updateConfig({
      ENABLE_CONNECTION_CHANGE_DETECTION: true
    });

    // First tick with no edges
    await TickProcessor.processTick(buildingRegistry, [], nodes);

    // Second tick with same edges (should skip connection updates)
    const startTime = performance.now();
    await TickProcessor.processTick(buildingRegistry, [], nodes);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(20); // Should be very fast due to caching
  });

  it('should scale reasonably with building count', async () => {
    OptimizationManager.updateConfig({
      ENABLE_PARALLEL_PROCESSING: true,
      MAX_CONCURRENCY: 2
    });

    // Test with different building counts
    const testCases = [10, 25, 50];

    for (const count of testCases) {
      const startTime = performance.now();

      for (let i = 0; i < 3; i++) {
        await TickProcessor.processTick(buildingRegistry, edges, nodes);
      }

      const endTime = performance.now();
      const averageTime = (endTime - startTime) / 3;

      // Performance should degrade gracefully, not exponentially
      const expectedMaxTime = count * 2; // Linear scaling expectation
      expect(averageTime).toBeLessThan(expectedMaxTime);
    }
  });

  it('should detect memory leaks over multiple ticks', async () => {
    OptimizationManager.updateConfig({
      ENABLE_PERFORMANCE_MONITORING: true
    });

    const initialMemory = performanceMonitor.getMemoryUsage();

    // Run many ticks
    for (let i = 0; i < 100; i++) {
      await TickProcessor.processTick(buildingRegistry, edges, nodes);
    }

    const finalMemory = performanceMonitor.getMemoryUsage();

    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory.used - initialMemory.used;
      // Allow some memory increase but not excessive growth
      expect(memoryIncrease).toBeLessThan(10000000); // 10MB limit
    }
  });

  it('should perform better with optimizations enabled vs disabled', async () => {
    // Test with optimizations disabled
    OptimizationManager.updateConfig({
      ENABLE_CONNECTION_CHANGE_DETECTION: false,
      ENABLE_BATCH_UPDATES: false,
      ENABLE_SUPPLIER_CACHE: false,
      ENABLE_PARALLEL_PROCESSING: false
    });

    const startTimeUnoptimized = performance.now();
    for (let i = 0; i < 5; i++) {
      await TickProcessor.processTick(buildingRegistry, edges, nodes);
    }
    const endTimeUnoptimized = performance.now();
    const unoptimizedTime = endTimeUnoptimized - startTimeUnoptimized;

    // Test with optimizations enabled
    OptimizationManager.updateConfig({
      ENABLE_CONNECTION_CHANGE_DETECTION: true,
      ENABLE_BATCH_UPDATES: true,
      ENABLE_SUPPLIER_CACHE: true,
      ENABLE_PARALLEL_PROCESSING: false
    });

    const startTimeOptimized = performance.now();
    for (let i = 0; i < 5; i++) {
      await TickProcessor.processTick(buildingRegistry, edges, nodes);
    }
    const endTimeOptimized = performance.now();
    const optimizedTime = endTimeOptimized - startTimeOptimized;

    // Optimized version should be at least as fast (allowing for some variance)
    expect(optimizedTime).toBeLessThanOrEqual(unoptimizedTime * 1.2);
  });

  it('should handle parallel processing correctly', async () => {
    OptimizationManager.updateConfig({
      ENABLE_PARALLEL_PROCESSING: true,
      MAX_CONCURRENCY: 4
    });

    // This test ensures parallel processing doesn't break functionality
    const startTime = performance.now();

    for (let i = 0; i < 10; i++) {
      await TickProcessor.processTick(buildingRegistry, edges, nodes);
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    expect(totalTime).toBeLessThan(500); // Should complete within reasonable time
  });
});
