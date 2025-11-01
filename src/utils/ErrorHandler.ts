import { Logger } from './Logger';

export class ErrorHandler {
  private static logger = new Logger('ErrorHandler');

  static handle(error: Error, context?: string): void {
    this.logger.error(`Unhandled error in ${context || 'unknown context'}`, error);

    // Could show user-friendly error message
    // Could trigger recovery mechanisms
  }

  static wrapAsync<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context: string
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handle(error as Error, context);
        throw error;
      }
    };
  }

  static wrapSync<T extends any[], R>(
    fn: (...args: T) => R,
    context: string
  ): (...args: T) => R {
    return (...args: T): R => {
      try {
        return fn(...args);
      } catch (error) {
        this.handle(error as Error, context);
        throw error;
      }
    };
  }
}
