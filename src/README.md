# Services Documentation

This document provides an overview of the modernized service architecture.

## Core Services

### IGameStateManager
Manages the global game state including buildings, inventory, and game statistics.

**Key Methods:**
- `getState()`: Get readonly game state
- `updateBuilding(id, updates)`: Update building state
- `addBuilding(state)`: Add new building
- `removeBuilding(id)`: Remove building
- `subscribe(listener)`: Subscribe to state changes

### IBuildingRegistry
Manages building instances and their lifecycle.

**Key Methods:**
- `register(building)`: Register building instance
- `unregister(id)`: Remove building instance
- `get(id)`: Get building by ID
- `createBuildingInstance(...)`: Create new building from node data

### IEventBus
Central event system for decoupled communication.

**Key Methods:**
- `subscribe(eventType, listener)`: Subscribe to events
- `publish(eventType, event)`: Publish events
- `clear()`: Clear all subscriptions

### IConfigService
Manages building configurations and validation.

**Key Methods:**
- `getBuildingConfig(type)`: Get config for building type
- `getAllBuildingConfigs()`: Get all configurations
- `validateConfig()`: Validate configurations
- `reloadConfig()`: Reload configurations

### ILogger
Structured logging interface.

**Key Methods:**
- `debug(message, data?)`: Debug level logging
- `info(message, data?)`: Info level logging
- `warn(message, data?)`: Warning level logging
- `error(message, error?, data?)`: Error level logging

## Event System

### Game Events
- `BuildingCreatedEvent`: Fired when building is created
- `BuildingDestroyedEvent`: Fired when building is destroyed
- `ResourceTransferredEvent`: Fired when resources move between buildings
- `GameTickEvent`: Fired on each game tick
- `ResourceShortageEvent`: Fired when building lacks resources
- `EnergyGridUpdateEvent`: Fired when energy grid changes

### Building Events
- `ProductionCompletedEvent`: Fired when building completes production
- `EnergyShortageEvent`: Fired when building lacks energy
- `BuildingStateChangedEvent`: Fired when building state changes
- `MaintenanceRequiredEvent`: Fired when building needs maintenance
- `EfficiencyChangedEvent`: Fired when building efficiency changes
- `ResourceProcessedEvent`: Fired when resources are processed
- `BuildingUpgradedEvent`: Fired when building is upgraded

## Plugin System

### IPlugin Interface
Plugins can extend the system without modifying core code.

**Required Methods:**
- `initialize(container)`: Initialize plugin with DI container
- `destroy()`: Clean up plugin resources

### PluginManager
Manages plugin lifecycle.

**Key Methods:**
- `loadPlugin(plugin)`: Load and initialize plugin
- `unloadPlugin(name)`: Unload plugin
- `getPlugin(name)`: Get loaded plugin

## Configuration System

Building configurations are externalized and validated at runtime.

### Structure
```
src/config/buildings/
├── index.ts          # Main config loader
├── miners.ts         # Miner configurations
├── factories.ts      # Factory configurations
├── utilities.ts      # Utility configurations
├── storage.ts        # Storage configurations
└── powerPlants.ts    # Power plant configurations
```

### Validation
Configurations are validated using `ConfigValidator` to ensure:
- Required fields are present
- Specialty values are valid
- Energy consumption is non-negative
- Inventory capacity is positive

## Dependency Injection

Services are registered in `ServiceProvider` and resolved through `ServiceLocator`.

### Usage
```typescript
import { ServiceLocator } from './services/ServiceLocator';

// Initialize services
ServiceLocator.initialize();

// Get service
const gameStateManager = ServiceLocator.get<IGameStateManager>('IGameStateManager');
```

## Error Handling

Errors are handled through `ErrorHandler` with structured logging.

### Usage
```typescript
import { ErrorHandler } from './utils/ErrorHandler';

// Wrap async functions
const safeFunction = ErrorHandler.wrapAsync(myAsyncFunction, 'context');

// Wrap sync functions
const safeSyncFunction = ErrorHandler.wrapSync(mySyncFunction, 'context');
