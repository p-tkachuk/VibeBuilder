// ServiceProvider.ts - Service registration
import { Container } from './Container';
import { GameStateManager } from '../managers/GameStateManager';
import { BuildingRegistry } from '../managers/BuildingRegistry';
import { EventBus } from '../events/EventBus';
import { ConfigService } from '../services/ConfigService';
import { Logger } from '../utils/Logger';

export class ServiceProvider {
  static registerServices(container: Container): void {
    // Core services
    container.register('IGameStateManager', () => new GameStateManager());
    container.register('IEventBus', () => new EventBus());
    container.register('IConfigService', () => new ConfigService());
    container.register('ILogger', () => new Logger('ServiceLocator'));

    // Dependent services
    container.register('IBuildingRegistry', () => new BuildingRegistry(
      container.resolve('IGameStateManager'),
      container.resolve('IEventBus')
    ));

    // BuildingService will be implemented later
    // container.register('IBuildingService', () => new BuildingService(
    //   container.resolve('IGameStateManager'),
    //   container.resolve('IBuildingRegistry')
    // ));
  }
}
