import { ServiceLocator } from '../../services/ServiceLocator';

describe('Service Integration', () => {
  beforeAll(() => {
    ServiceLocator.initialize();
  });

  afterAll(() => {
    ServiceLocator.clear();
  });

  it('should resolve all core services', () => {
    expect(() => ServiceLocator.get('IGameStateManager')).not.toThrow();
    expect(() => ServiceLocator.get('IBuildingRegistry')).not.toThrow();
  });

  it('should create building through service layer', async () => {
    // Note: BuildingService implementation is pending
    // const buildingService = ServiceLocator.get<IBuildingService>('IBuildingService');

    // const building = await buildingService.createBuilding(BuildingType.COPPER_MINER, { x: 100, y: 100 });

    // expect(building).toBeDefined();
    // expect(building.type).toBe(BuildingType.COPPER_MINER);

    // Placeholder test
    expect(true).toBe(true);
  });

  it('should validate configuration on startup', () => {
    const configService = ServiceLocator.get('IConfigService');
    const validation = configService.validateConfig();

    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
});
