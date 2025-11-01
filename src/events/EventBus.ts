// EventBus.ts - Central event system
export class EventBus {
  private listeners = new Map<string, Set<(event: any) => void>>();

  subscribe<T>(eventType: string, listener: (event: T) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  publish<T>(eventType: string, event: T): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
