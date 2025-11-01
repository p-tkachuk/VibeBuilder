import type { IConfigService } from '../services/interfaces/IConfigService';
import type { ValidationResult } from './ConfigValidator';

export class ConfigManager {
  private static instance: ConfigManager;
  private services = new Map<string, IConfigService>();

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  registerService(name: string, service: IConfigService): void {
    this.services.set(name, service);
  }

  async reloadAllConfigs(): Promise<void> {
    const promises = Array.from(this.services.values()).map(service =>
      service.reloadConfig()
    );
    await Promise.all(promises);
  }

  validateAllConfigs(): ValidationResult {
    const allErrors: string[] = [];

    for (const [name, service] of this.services) {
      const result = service.validateConfig();
      if (!result.valid) {
        allErrors.push(`${name}: ${result.errors.join(', ')}`);
      }
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors
    };
  }

  getService(name: string): IConfigService | undefined {
    return this.services.get(name);
  }

  getAllServices(): IConfigService[] {
    return Array.from(this.services.values());
  }
}
