import type { ILogger } from '../services/interfaces/ILogger';

export class Logger implements ILogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  debug(message: string, data?: any): void {
    console.debug(`[${this.context}] ${message}`, data);
  }

  info(message: string, data?: any): void {
    console.info(`[${this.context}] ${message}`, data);
  }

  warn(message: string, data?: any): void {
    console.warn(`[${this.context}] ${message}`, data);
  }

  error(message: string, error?: Error, data?: any): void {
    console.error(`[${this.context}] ${message}`, error, data);

    // Could send to error reporting service
    this.reportError(error, { message, data, context: this.context });
  }

  private reportError(error?: Error, context?: any): void {
    // Integration with error reporting service (Sentry, etc.)
    // For now, just log to console
    if (error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...context
      });
    }
  }
}
