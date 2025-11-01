import { Container } from '../di/Container';
import type { IPlugin } from './interfaces/IPlugin';
import { Logger } from '../utils/Logger';

export class BuildingPlugin implements IPlugin {
  name = 'custom-buildings';
  version = '1.0.0';
  private logger = new Logger('BuildingPlugin');

  async initialize(_container: Container): Promise<void> {
    this.logger.info('Initializing custom buildings plugin');

    // Plugin initialization - could register custom services or modify existing ones
    // For now, just log that the plugin is loaded
    // Future: Could extend config service with custom configs

    this.logger.info('Custom buildings plugin initialized');
  }

  async destroy(): Promise<void> {
    this.logger.info('Destroying custom buildings plugin');
    // Cleanup logic here
  }
}
