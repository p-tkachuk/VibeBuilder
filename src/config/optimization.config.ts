export const OPTIMIZATION_CONFIG = {
  // Connection optimization
  ENABLE_CONNECTION_CHANGE_DETECTION: true,
  ENABLE_SPATIAL_INDEX: true,

  // State synchronization optimization
  ENABLE_BATCH_UPDATES: true,
  ENABLE_CHANGE_DETECTION: true,

  // Processing optimization
  ENABLE_PARALLEL_PROCESSING: true,
  MAX_CONCURRENCY: 4,

  // Performance monitoring
  ENABLE_PERFORMANCE_MONITORING: true,
  LOG_PERFORMANCE_SUMMARY: false, // Set to true for debugging

  // Memory optimization
  ENABLE_MEMORY_OPTIMIZATION: true,
  CACHE_INVALIDATION_INTERVAL: 1000, // ticks

  // Spatial indexing
  SPATIAL_CELL_SIZE: 50, // pixels

  // Supplier relationship caching
  ENABLE_SUPPLIER_CACHE: true,

  // Advanced features (can be disabled for compatibility)
  ENABLE_ADVANCED_OPTIMIZATIONS: true,
};

export type OptimizationConfig = {
  ENABLE_CONNECTION_CHANGE_DETECTION: boolean;
  ENABLE_SPATIAL_INDEX: boolean;
  ENABLE_BATCH_UPDATES: boolean;
  ENABLE_CHANGE_DETECTION: boolean;
  ENABLE_PARALLEL_PROCESSING: boolean;
  MAX_CONCURRENCY: number;
  ENABLE_PERFORMANCE_MONITORING: boolean;
  LOG_PERFORMANCE_SUMMARY: boolean;
  ENABLE_MEMORY_OPTIMIZATION: boolean;
  CACHE_INVALIDATION_INTERVAL: number;
  SPATIAL_CELL_SIZE: number;
  ENABLE_SUPPLIER_CACHE: boolean;
  ENABLE_ADVANCED_OPTIMIZATIONS: boolean;
};

// Runtime configuration management
export class OptimizationManager {
  private static config = { ...OPTIMIZATION_CONFIG };

  static getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  static updateConfig(updates: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  static resetConfig(): void {
    this.config = { ...OPTIMIZATION_CONFIG };
  }

  static isEnabled(feature: keyof OptimizationConfig): boolean {
    return this.config[feature] as boolean;
  }

  static getNumberValue(feature: keyof OptimizationConfig): number {
    return this.config[feature] as number;
  }

  // Performance-based configuration adjustments
  static adjustForPerformance(averageTickTime: number, buildingCount: number): void {
    // Auto-disable parallel processing for small building counts
    if (buildingCount < 10 && averageTickTime < 5) {
      this.updateConfig({ ENABLE_PARALLEL_PROCESSING: false });
    }

    // Auto-enable parallel processing for large building counts
    if (buildingCount > 50 && averageTickTime > 10) {
      this.updateConfig({ ENABLE_PARALLEL_PROCESSING: true });
    }

    // Adjust concurrency based on performance
    if (averageTickTime > 20) {
      this.updateConfig({ MAX_CONCURRENCY: Math.max(2, this.config.MAX_CONCURRENCY - 1) });
    } else if (averageTickTime < 5 && buildingCount > 20) {
      this.updateConfig({ MAX_CONCURRENCY: Math.min(8, this.config.MAX_CONCURRENCY + 1) });
    }
  }
}
