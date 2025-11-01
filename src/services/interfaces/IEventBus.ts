export interface IEventBus {
  subscribe<T>(eventType: string, listener: (event: T) => void): () => void;
  publish<T>(eventType: string, event: T): void;
  clear(): void;
}
