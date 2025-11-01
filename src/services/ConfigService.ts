import { BuildingType } from '../types/buildings';
import type { BuildingConfig } from '../config/buildings/index';
import { BUILDING_CONFIGS, loadBuildingConfigs } from '../config/buildings/index';
import { ConfigValidator, type ValidationResult } from '../config/ConfigValidator';
import type { IConfigService } from './interfaces/IConfigService';

export class ConfigService implements IConfigService {
  private configs: Record<string, BuildingConfig> = {};
  private configVersion = 0;

  constructor() {
    // Initialize with compiled configs
    this.configs = BUILDING_CONFIGS;
  }

  async loadConfigs(): Promise<void> {
    try {
      // In development, load from local files
      // In production, could load from CDN or API
      const loadedConfigs = await loadBuildingConfigs();
      this.configs = loadedConfigs;
      this.configVersion++;

      // Publish config reloaded event if event bus is available
      // this.eventBus?.publish('config_reloaded', { version: this.configVersion });
    } catch (error) {
      console.error('Failed to load building configs:', error);
      // Fallback to compiled configs
      this.configs = BUILDING_CONFIGS;
    }
  }

  async reloadConfig(): Promise<void> {
    await this.loadConfigs();
  }

  getBuildingConfig(buildingType: BuildingType): BuildingConfig | undefined {
    return this.configs[buildingType];
  }

  getAllBuildingConfigs(): Record<string, BuildingConfig> {
    return { ...this.configs };
  }

  validateConfig(): ValidationResult {
    return ConfigValidator.validateAllConfigs(this.configs);
  }
}
