import { BuildingType } from '../../types/buildings';
import type { BuildingConfig } from '../../config/buildings/index';
import type { ValidationResult } from '../../config/ConfigValidator';

export interface IConfigService {
  getBuildingConfig(buildingType: BuildingType): BuildingConfig | undefined;
  getAllBuildingConfigs(): Record<string, BuildingConfig>;
  validateConfig(): ValidationResult;
  reloadConfig(): Promise<void>;
}
