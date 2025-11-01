import { Container } from '../di/Container';
import type { IPlugin } from './interfaces/IPlugin';
import { Logger } from '../utils/Logger';

export class PluginManager {
  private plugins = new Map<string, IPlugin>();
  private container: Container;
  private logger = new Logger('PluginManager');

  constructor(container: Container) {
    this.container = container;
  }

  async loadPlugin(plugin: IPlugin): Promise<void> {
    try {
      this.logger.info(`Loading plugin: ${plugin.name} v${plugin.version}`);
      await plugin.initialize(this.container);
      this.plugins.set(plugin.name, plugin);
      this.logger.info(`Plugin loaded successfully: ${plugin.name}`);
    } catch (error) {
      this.logger.error(`Failed to load plugin: ${plugin.name}`, error as Error);
      throw error;
    }
  }

  async unloadPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (plugin) {
      try {
        this.logger.info(`Unloading plugin: ${name}`);
        await plugin.destroy();
        this.plugins.delete(name);
        this.logger.info(`Plugin unloaded successfully: ${name}`);
      } catch (error) {
        this.logger.error(`Failed to unload plugin: ${name}`, error as Error);
        throw error;
      }
    }
  }

  getPlugin<T extends IPlugin>(name: string): T | undefined {
    return this.plugins.get(name) as T;
  }

  getAllPlugins(): IPlugin[] {
    return Array.from(this.plugins.values());
  }

  async unloadAllPlugins(): Promise<void> {
    const unloadPromises = Array.from(this.plugins.keys()).map(name =>
      this.unloadPlugin(name).catch(error => {
        this.logger.error(`Error unloading plugin ${name}`, error);
      })
    );
    await Promise.all(unloadPromises);
  }
}
