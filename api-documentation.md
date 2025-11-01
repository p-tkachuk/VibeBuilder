# API Documentation

## Service Interfaces

### IGameStateManager

```typescript
interface IGameStateManager {
  getState(): Readonly<GameState>;
  updateBuilding(buildingId: string, updates: Partial<BuildingState>): void;
  addBuilding(buildingState: BuildingState): void;
  removeBuilding(buildingId: string): void;
  subscribe(listener: (change: StateChange) => void): () => void;
  batchUpdate(updates: Array<{ buildingId: string; changes: Partial<BuildingState> }>): void;
}
```

### IBuildingRegistry

```typescript
interface IBuildingRegistry {
  register(building: BaseBuilding): void;
  unregister(buildingId: string): void;
  get(buildingId: string): BaseBuilding | undefined;
  getAll(): BaseBuilding[];
  updateBuildingState(buildingId: string): void;
  updateBuildingStateWithChangeDetection(buildingId: string): void;
  createBuildingInstance(
    node: Node,
    edges: Edge[],
    allNodes: Node[],
    allEdges: Edge[],
    resourceFields?: ResourceField[],
    resourceInventory?: any
  ): Promise<BaseBuilding | null>;
  getSuppliers(buildingId: string): BaseBuilding[];
  updateSupplierCache(edges: Edge[]): void;
  batchUpdateState(updates: Array<{ buildingId: string; changes: Partial<any> }>): void;
  optimizeMemory(): void;
}
```

### IEventBus

```typescript
interface IEventBus {
  subscribe<T>(eventType: string, listener: (event: T) => void): () => void;
  publish<T>(eventType: string, event: T): void;
  clear(): void;
}
```

### IConfigService

```typescript
interface IConfigService {
  getBuildingConfig(buildingType: BuildingType): BuildingConfig | undefined;
  getAllBuildingConfigs(): Record<string, BuildingConfig>;
  validateConfig(): ValidationResult;
  reloadConfig(): Promise<void>;
}
```

### ILogger

```typescript
interface ILogger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: Error, data?: any): void;
}
```

## Event Types

### Game Events

```typescript
interface BuildingCreatedEvent {
  buildingId: string;
  buildingType: BuildingType;
  position: Position;
}

interface BuildingDestroyedEvent {
  buildingId: string;
}

interface ResourceTransferredEvent {
  fromBuildingId: string;
  toBuildingId: string;
  resource: string;
  amount: number;
}

interface GameTickEvent {
  tickCount: number;
  deltaTime: number;
}

interface ResourceShortageEvent {
  buildingId: string;
  resource: string;
  required: number;
  available: number;
}

interface EnergyGridUpdateEvent {
  totalEnergyProduced: number;
  totalEnergyConsumed: number;
  energyBalance: number;
}
```

### Building Events

```typescript
interface ProductionCompletedEvent {
  buildingId: string;
  resources: Record<string, number>;
}

interface EnergyShortageEvent {
  buildingId: string;
  requiredEnergy: number;
  availableEnergy: number;
}

interface BuildingStateChangedEvent {
  buildingId: string;
  previousState: string;
  newState: string;
  reason?: string;
}

interface MaintenanceRequiredEvent {
  buildingId: string;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface EfficiencyChangedEvent {
  buildingId: string;
  previousEfficiency: number;
  newEfficiency: number;
  factor: string;
}

interface ResourceProcessedEvent {
  buildingId: string;
  inputResources: Record<string, number>;
  outputResources: Record<string, number>;
  processingTime: number;
}

interface BuildingUpgradedEvent {
  buildingId: string;
  previousLevel: number;
  newLevel: number;
  upgradeCost: Record<string, number>;
}
```

## Plugin API

### IPlugin

```typescript
interface IPlugin {
  name: string;
  version: string;
  initialize(container: Container): Promise<void>;
  destroy(): Promise<void>;
}
```

### PluginManager

```typescript
class PluginManager {
  constructor(container: Container);

  loadPlugin(plugin: IPlugin): Promise<void>;
  unloadPlugin(name: string): Promise<void>;
  getPlugin<T extends IPlugin>(name: string): T | undefined;
  getAllPlugins(): IPlugin[];
  unloadAllPlugins(): Promise<void>;
}
```

## Configuration Types

### BuildingConfig

```typescript
interface BuildingConfig {
  name: string;
  description: string;
  color: string;
  icon: string;
  inputs: Record<string, number>;
  outputs: Record<string, number>;
  cost: Record<string, number>;
  specialty: BuildingSpecialty;
  inventoryCapacity: number;
  energyConsumption: number;
  miningSpeed?: number;
  miningRange?: number;
}
```

### ValidationResult

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

## Usage Examples

### Using ServiceLocator

```typescript
import { ServiceLocator } from './services/ServiceLocator';

// Initialize all services
ServiceLocator.initialize();

// Get services
const gameStateManager = ServiceLocator.get<IGameStateManager>('IGameStateManager');
const eventBus = ServiceLocator.get<IEventBus>('IEventBus');
const configService = ServiceLocator.get<IConfigService>('IConfigService');
```

### Publishing Events

```typescript
// Publish a building event
eventBus.publish('production_completed', {
  buildingId: 'building-123',
  resources: { 'iron-plate': 5 }
});

// Subscribe to events
const unsubscribe = eventBus.subscribe('energy_shortage', (event) => {
  console.log('Energy shortage detected:', event);
});

// Clean up subscription
unsubscribe();
```

### Creating a Plugin

```typescript
import { Container } from '../di/Container';
import type { IPlugin } from '../plugins/interfaces/IPlugin';

export class MyCustomPlugin implements IPlugin {
  name = 'my-custom-plugin';
  version = '1.0.0';

  async initialize(container: Container): Promise<void> {
    // Register custom services or modify existing ones
    console.log('Custom plugin initialized');
  }

  async destroy(): Promise<void> {
    // Clean up resources
    console.log('Custom plugin destroyed');
  }
}
```

### Error Handling

```typescript
import { ErrorHandler } from './utils/ErrorHandler';

// Wrap functions for automatic error handling
const safeAsyncFunction = ErrorHandler.wrapAsync(
  async (param: string) => {
    // Function logic that might throw
    if (!param) throw new Error('Invalid parameter');
    return param.toUpperCase();
  },
  'safeAsyncFunction'
);

const safeSyncFunction = ErrorHandler.wrapSync(
  (param: string) => {
    // Function logic that might throw
    if (!param) throw new Error('Invalid parameter');
    return param.toLowerCase();
  },
  'safeSyncFunction'
);
