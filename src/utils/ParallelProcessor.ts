export class ParallelProcessor {
  static async processInParallel<T>(
    items: T[],
    processor: (item: T) => Promise<void>,
    concurrency = 4
  ): Promise<void> {
    const chunks = this.chunkArray(items, concurrency);
    await Promise.all(chunks.map(chunk =>
      Promise.all(chunk.map(processor))
    ));
  }

  static async processInParallelSync<T>(
    items: T[],
    processor: (item: T) => void,
    concurrency = 4
  ): Promise<void> {
    const chunks = this.chunkArray(items, concurrency);
    for (const chunk of chunks) {
      await Promise.all(chunk.map(item => Promise.resolve(processor(item))));
    }
  }

  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  static async processWithTimeout<T>(
    items: T[],
    processor: (item: T) => Promise<void>,
    timeoutMs = 100,
    concurrency = 4
  ): Promise<void> {
    const chunks = this.chunkArray(items, concurrency);

    for (const chunk of chunks) {
      const promises = chunk.map(async (item) => {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Processing timeout')), timeoutMs)
        );

        return Promise.race([
          processor(item),
          timeoutPromise
        ]);
      });

      await Promise.all(promises);
    }
  }
}
