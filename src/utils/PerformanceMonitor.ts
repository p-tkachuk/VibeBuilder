export class PerformanceMonitor {
  private metrics = new Map<string, number[]>();
  private startTimes = new Map<string, number>();

  startTimer(label: string): () => void {
    const start = performance.now();
    this.startTimes.set(label, start);

    return () => {
      const duration = performance.now() - start;
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      this.metrics.get(label)!.push(duration);
      this.startTimes.delete(label);
    };
  }

  recordTime(label: string, duration: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(duration);
  }

  getAverage(label: string): number {
    const times = this.metrics.get(label) || [];
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  getMedian(label: string): number {
    const times = [...(this.metrics.get(label) || [])].sort((a, b) => a - b);
    const mid = Math.floor(times.length / 2);
    return times.length > 0 ? times[mid] : 0;
  }

  getPercentile(label: string, percentile: number): number {
    const times = [...(this.metrics.get(label) || [])].sort((a, b) => a - b);
    if (times.length === 0) return 0;

    const index = Math.floor((percentile / 100) * (times.length - 1));
    return times[index];
  }

  getMin(label: string): number {
    const times = this.metrics.get(label) || [];
    return times.length > 0 ? Math.min(...times) : 0;
  }

  getMax(label: string): number {
    const times = this.metrics.get(label) || [];
    return times.length > 0 ? Math.max(...times) : 0;
  }

  getCount(label: string): number {
    return this.metrics.get(label)?.length || 0;
  }

  getAllMetrics(): Record<string, {
    count: number;
    average: number;
    median: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  }> {
    const result: Record<string, any> = {};

    for (const label of this.metrics.keys()) {
      result[label] = {
        count: this.getCount(label),
        average: this.getAverage(label),
        median: this.getMedian(label),
        min: this.getMin(label),
        max: this.getMax(label),
        p95: this.getPercentile(label, 95),
        p99: this.getPercentile(label, 99)
      };
    }

    return result;
  }

  reset(label?: string): void {
    if (label) {
      this.metrics.delete(label);
      this.startTimes.delete(label);
    } else {
      this.metrics.clear();
      this.startTimes.clear();
    }
  }

  logSummary(): void {
    console.group('Performance Monitor Summary');
    const metrics = this.getAllMetrics();

    for (const [label, data] of Object.entries(metrics)) {
      console.log(`${label}:`, {
        count: data.count,
        avg: `${data.average.toFixed(2)}ms`,
        median: `${data.median.toFixed(2)}ms`,
        min: `${data.min.toFixed(2)}ms`,
        max: `${data.max.toFixed(2)}ms`,
        p95: `${data.p95.toFixed(2)}ms`,
        p99: `${data.p99.toFixed(2)}ms`
      });
    }
    console.groupEnd();
  }

  // Memory monitoring
  getMemoryUsage(): { used: number; total: number; limit: number } | null {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const mem = (performance as any).memory;
      return {
        used: mem.usedJSHeapSize,
        total: mem.totalJSHeapSize,
        limit: mem.jsHeapSizeLimit
      };
    }
    return null;
  }

  recordMemoryUsage(label: string): void {
    const memory = this.getMemoryUsage();
    if (memory) {
      this.recordTime(`${label}_memory_used`, memory.used);
      this.recordTime(`${label}_memory_total`, memory.total);
    }
  }
}
