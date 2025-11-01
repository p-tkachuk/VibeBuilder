import { Container } from '../di/Container';
import { ServiceProvider } from '../di/ServiceProvider';

export class ServiceLocator {
  private static container: Container;

  static initialize(): void {
    this.container = new Container();
    ServiceProvider.registerServices(this.container);
  }

  static get<T>(token: string): T {
    return this.container.resolve<T>(token);
  }

  static getContainer(): Container {
    return this.container;
  }

  static clear(): void {
    this.container.clear();
  }
}
