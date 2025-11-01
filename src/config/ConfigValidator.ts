import { BuildingSpecialty } from '../types/buildings';
import type { BuildingConfig } from './buildings/index';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class ConfigValidator {
  static validateBuildingConfig(config: any): ValidationResult {
    const errors: string[] = [];

    if (!config.name || typeof config.name !== 'string') {
      errors.push('Building name is required and must be a string');
    }

    if (!config.specialty || !Object.values(BuildingSpecialty).includes(config.specialty)) {
      errors.push('Valid specialty is required');
    }

    if (config.energyConsumption < 0) {
      errors.push('Energy consumption cannot be negative');
    }

    if (config.inventoryCapacity <= 0) {
      errors.push('Inventory capacity must be positive');
    }

    if (!config.cost || typeof config.cost !== 'object') {
      errors.push('Cost configuration is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateAllConfigs(configs: Record<string, BuildingConfig>): ValidationResult {
    const allErrors: string[] = [];

    Object.entries(configs).forEach(([buildingType, config]) => {
      const result = this.validateBuildingConfig(config);
      if (!result.valid) {
        allErrors.push(`${buildingType}: ${result.errors.join(', ')}`);
      }
    });

    return {
      valid: allErrors.length === 0,
      errors: allErrors
    };
  }
}
