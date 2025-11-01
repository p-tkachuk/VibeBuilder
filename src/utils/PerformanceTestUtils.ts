import { PerformanceMonitor } from './PerformanceMonitor';

export class PerformanceTestUtils {
  private static performanceMonitor = new PerformanceMonitor();

  /**
   * Runs a performance benchmark for a given function
   */
  static async benchmark<T>(
    name: string,
    fn: () => Promise<T> | T,
    iterations: number = 100,
    warmupIterations: number = 10
  ): Promise<PerformanceResult> {
    // Warmup phase
    for (let i = 0; i < warmupIterations; i++) {
      await fn();
    }

    // Benchmark phase
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);
    }

    return {
      name,
      iterations,
      average: times.reduce((a, b) => a + b, 0) / times.length,
      median: this.calculateMedian(times),
      min: Math.min(...times),
      max: Math.max(...times),
      p95: this.calculatePercentile(times, 95),
      p99: this.calculatePercentile(times, 99),
      standardDeviation: this.calculateStandardDeviation(times)
    };
  }

  /**
   * Compares performance between two functions
   */
  static async comparePerformance<T1, T2>(
    baselineName: string,
    baselineFn: () => Promise<T1> | T1,
    comparisonName: string,
    comparisonFn: () => Promise<T2> | T2,
    iterations: number = 50
  ): Promise<PerformanceComparison> {
    const baselineResult = await this.benchmark(baselineName, baselineFn, iterations);
    const comparisonResult = await this.benchmark(comparisonName, comparisonFn, iterations);

    const improvement = ((baselineResult.average - comparisonResult.average) / baselineResult.average) * 100;

    return {
      baseline: baselineResult,
      comparison: comparisonResult,
      improvement,
      isFaster: comparisonResult.average < baselineResult.average
    };
  }

  /**
   * Tests memory usage over time
   */
  static async memoryLeakTest(
    name: string,
    fn: () => Promise<void> | void,
    iterations: number = 1000
  ): Promise<MemoryLeakResult> {
    const initialMemory = this.performanceMonitor.getMemoryUsage();

    if (!initialMemory) {
      throw new Error('Memory monitoring not available');
    }

    // Run the function many times
    for (let i = 0; i < iterations; i++) {
      await fn();
    }

    const finalMemory = this.performanceMonitor.getMemoryUsage();

    if (!finalMemory) {
      throw new Error('Memory monitoring not available');
    }

    const memoryIncrease = finalMemory.used - initialMemory.used;
    const memoryIncreasePerIteration = memoryIncrease / iterations;

    return {
      name,
      iterations,
      initialMemory: initialMemory.used,
      finalMemory: finalMemory.used,
      memoryIncrease,
      memoryIncreasePerIteration,
      hasLeak: memoryIncreasePerIteration > 1000 // More than 1KB per iteration
    };
  }

  /**
   * Tests scalability with increasing input sizes
   */
  static async scalabilityTest<T>(
    name: string,
    fn: (input: T) => Promise<void> | void,
    inputs: T[],
    iterationsPerInput: number = 10
  ): Promise<ScalabilityResult> {
    const results: Array<{ input: T; performance: PerformanceResult }> = [];

    for (const input of inputs) {
      const result = await this.benchmark(
        `${name}_input_${inputs.indexOf(input)}`,
        () => fn(input),
        iterationsPerInput
      );
      results.push({ input, performance: result });
    }

    // Calculate scaling factor
    const firstResult = results[0].performance.average;
    const lastResult = results[results.length - 1].performance.average;
    const scalingFactor = lastResult / firstResult;

    return {
      name,
      results,
      scalingFactor,
      isLinear: scalingFactor <= inputs.length * 1.5 // Allow some overhead
    };
  }

  /**
   * Runs comprehensive performance suite
   */
  static async runPerformanceSuite(
    suiteName: string,
    tests: Array<{
      name: string;
      fn: () => Promise<void> | void;
      type: 'benchmark' | 'memory' | 'scalability';
      options?: any;
    }>
  ): Promise<PerformanceSuiteResult> {
    console.group(`🧪 Performance Suite: ${suiteName}`);

    const results: Record<string, any> = {};
    let totalTime = 0;

    for (const test of tests) {
      console.log(`Running ${test.name}...`);
      const startTime = performance.now();

      try {
        switch (test.type) {
          case 'benchmark':
            results[test.name] = await this.benchmark(
              test.name,
              test.fn,
              test.options?.iterations || 100
            );
            break;
          case 'memory':
            results[test.name] = await this.memoryLeakTest(
              test.name,
              test.fn,
              test.options?.iterations || 1000
            );
            break;
          case 'scalability':
            results[test.name] = await this.scalabilityTest(
              test.name,
              test.fn,
              test.options?.inputs || [],
              test.options?.iterationsPerInput || 10
            );
            break;
        }
      } catch (error) {
        console.error(`Test ${test.name} failed:`, error);
        results[test.name] = { error: error instanceof Error ? error.message : String(error) };
      }

      const endTime = performance.now();
      totalTime += (endTime - startTime);
    }

    console.log(`Suite completed in ${totalTime.toFixed(2)}ms`);
    console.groupEnd();

    return {
      suiteName,
      totalTime,
      results,
      timestamp: new Date().toISOString()
    };
  }

  private static calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  private static calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.floor((percentile / 100) * (sorted.length - 1));
    return sorted[index];
  }

  private static calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }
}

export interface PerformanceResult {
  name: string;
  iterations: number;
  average: number;
  median: number;
  min: number;
  max: number;
  p95: number;
  p99: number;
  standardDeviation: number;
}

export interface PerformanceComparison {
  baseline: PerformanceResult;
  comparison: PerformanceResult;
  improvement: number; // Percentage improvement
  isFaster: boolean;
}

export interface MemoryLeakResult {
  name: string;
  iterations: number;
  initialMemory: number;
  finalMemory: number;
  memoryIncrease: number;
  memoryIncreasePerIteration: number;
  hasLeak: boolean;
}

export interface ScalabilityResult {
  name: string;
  results: Array<{ input: any; performance: PerformanceResult }>;
  scalingFactor: number;
  isLinear: boolean;
}

export interface PerformanceSuiteResult {
  suiteName: string;
  totalTime: number;
  results: Record<string, any>;
  timestamp: string;
}
