import { ConfigService } from '../../../services/ConfigService';
import { BuildingType } from '../../../types/buildings';

describe('ConfigService', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
  });

  it('should initialize with building configs', () => {
    const configs = configService.getAllBuildingConfigs();
    expect(configs).toBeDefined();
    expect(Object.keys(configs)).toContain(BuildingType.COPPER_MINER);
  });

  it('should get building config by type', () => {
    const config = configService.getBuildingConfig(BuildingType.COPPER_MINER);
    expect(config).toBeDefined();
    expect(config?.name).toBe('Copper Miner');
  });

  it('should validate configurations', () => {
    const validation = configService.validateConfig();
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should reload configurations', async () => {
    await configService.reloadConfig();
    const configs = configService.getAllBuildingConfigs();
    expect(configs).toBeDefined();
  });
});
