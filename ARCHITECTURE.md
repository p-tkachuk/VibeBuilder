# Game State Management Architecture

## Overview

This document describes the modernized architecture that implements a service-oriented, event-driven system with dependency injection, external configuration management, and plugin support. The architecture separates game state from UI state, providing better performance, maintainability, and extensibility.

## Architecture Components

### 1. Core State Interfaces (`src/types/game-state.ts`)

Defines the core data structures for game state:

- `BuildingState`: Represents the state of a single building
- `GameState`: Represents the complete game state
- `StateChange`: Represents state change events for listeners

### 2. GameStateManager (`src/managers/GameStateManager.ts`)

Centralized state management class that:

- Maintains immutable game state
- Provides methods to add, update, and remove buildings
- Implements observer pattern for state change notifications
- Ensures thread-safe state updates

### 3. BuildingRegistry (`src/managers/BuildingRegistry.ts`)

Manages persistent building instances:

- Registers and unregisters building objects
- Synchronizes building state with GameStateManager
- Provides access to building instances by ID
- Extracts inventory data from building objects

### 4. StateSyncService (`src/services/StateSyncService.ts`)

Bridges game state and ReactFlow UI:

- Converts GameState to ReactFlow nodes for rendering
- Updates GameState from ReactFlow node changes
- Provides efficient state synchronization

### 5. BaseBuilding Integration (`src/simulation/buildings/BaseBuilding.ts`)

Updated to work with new state management:

- Accepts GameStateManager and BuildingRegistry in constructor
- Synchronizes state changes through registry instead of returning nodes
- Maintains backward compatibility with existing building logic

### 6. TickProcessor (`src/simulation/TickProcessor.ts`)

Updated processing logic:

- Works with persistent building instances from BuildingRegistry
- No longer creates/destroys building objects each tick
- Processes phases directly on existing instances
- State updates are handled through the registry

## Key Benefits

### Performance Improvements

- **Persistent Instances**: Buildings are created once and reused, eliminating object creation overhead
- **Efficient Updates**: Only changed state is synchronized, reducing React re-renders
- **Reduced GC Pressure**: Fewer temporary objects created during ticks

### Maintainability

- **Separation of Concerns**: Game logic separated from UI rendering logic
- **Type Safety**: Strong typing throughout the state management system
- **Observer Pattern**: Clean event-driven architecture for state changes

### Extensibility

- **Modular Design**: Easy to add new state management features
- **Migration Support**: Utilities for gradual migration from old architecture
- **Testing**: Comprehensive test coverage for all components

## Migration Guide

### From Node-Based State

The old architecture stored all building state in ReactFlow nodes. The new architecture separates this into:

1. **Game State**: Pure data structures managed by GameStateManager
2. **Building Instances**: Persistent objects managed by BuildingRegistry
3. **UI State**: ReactFlow nodes synchronized by StateSyncService

### Migration Steps

1. **Update Building Creation**: Buildings now require GameStateManager and BuildingRegistry in constructor
2. **Replace getUpdatedNode()**: Instead of returning nodes, buildings call `buildingRegistry.updateBuildingState()`
3. **Update Tick Processing**: TickProcessor now works with BuildingRegistry instead of creating instances
4. **UI Integration**: App.tsx initializes state management services and uses StateSyncService for rendering

### Backward Compatibility

The migration utilities in `src/utils/state-migration.ts` provide:

- Conversion between old node-based state and new GameState
- Validation of migrated data
- Feature flags for gradual rollout

## Usage Examples

### Creating a Building

```typescript
// Old way - creates instance each tick
const building = TickProcessor.createBuilding(node, edges, nodes, edges, resourceFields);

// New way - persistent instance
const building = new Miner(node, edges, allNodes, allEdges, gameStateManager, buildingRegistry);
buildingRegistry.register(building);
```

### State Updates

```typescript
// Old way - return updated node
getUpdatedNode(): Node {
  return { ...this.node, data: { ...this.node.data, inventory: this.inventory } };
}

// New way - sync through registry
getUpdatedNode(): void {
  this.buildingRegistry.updateBuildingState(this.id);
}
```

### Tick Processing

```typescript
// Old way - create instances each tick
const buildings = nodes.map(node => createBuilding(node, ...));
processBuildings(buildings);
return buildings.map(b => b.getUpdatedNode());

// New way - work with persistent instances
const buildings = buildingRegistry.getAll();
processBuildings(buildings);
// State automatically updated through registry
```

## Future Enhancements

- **State Persistence**: Add serialization/deserialization for save/load
- **Undo/Redo**: Implement command pattern for state changes
- **Multiplayer**: Extend for real-time synchronization
- **Performance Monitoring**: Add metrics for state update performance
- **Validation**: Enhanced state validation and error recovery

## Testing Strategy

Unit tests cover:
- GameStateManager state operations and notifications
- BuildingRegistry instance management
- StateSyncService conversion accuracy
- Migration utilities data integrity

Integration tests verify:
- End-to-end tick processing
- UI state synchronization
- Save/load compatibility
- Performance benchmarks vs old architecture

## Modernized Service-Oriented Architecture

### Service Layer Enhancement

The architecture now implements a comprehensive service layer with dependency injection:

#### Dependency Injection Framework (`src/di/`)
- **Container.ts**: Lightweight DI container with registration and resolution
- **ServiceProvider.ts**: Service registration and dependency wiring

#### Service Interfaces (`src/services/interfaces/`)
- **IGameStateManager**: Game state management abstraction
- **IBuildingRegistry**: Building instance management abstraction
- **IEventBus**: Event system abstraction
- **IConfigService**: Configuration management abstraction
- **ILogger**: Logging abstraction

### Event-Driven Architecture

Decoupled communication through a centralized event system:

#### Event System (`src/events/`)
- **EventBus.ts**: Central event bus with subscribe/publish pattern
- **GameEvents.ts**: Game-wide event definitions
- **BuildingEvents.ts**: Building-specific event definitions

#### Event Integration
- Buildings publish events instead of direct method calls
- TickProcessor subscribes to building events for reactive processing
- Loose coupling enables better testability and extensibility

### Configuration Management

Externalized, validated configuration system:

#### Configuration System (`src/config/`)
- **buildings/**: Modular building configurations by category
- **ConfigValidator.ts**: Runtime validation with detailed error reporting
- **ConfigManager.ts**: Global configuration coordination
- **ConfigService.ts**: Runtime configuration management with hot-reloading

### Plugin Architecture

Extensible system through plugin support:

#### Plugin System (`src/plugins/`)
- **IPlugin**: Plugin interface for lifecycle management
- **PluginManager**: Plugin loading, unloading, and management
- **BuildingPlugin**: Example plugin for custom buildings

### Error Handling and Logging

Comprehensive error management:

#### Error Handling (`src/utils/`)
- **Logger.ts**: Structured logging with context and levels
- **ErrorHandler.ts**: Centralized error handling with async/sync wrappers

### Service Integration

Global service access through ServiceLocator:

#### Service Locator (`src/services/`)
- **ServiceLocator.ts**: Global service registry and access
- **Service Integration Tests**: End-to-end service verification

### Key Architectural Improvements

#### Testability
- All services implement interfaces for easy mocking
- Dependency injection enables isolated unit testing
- Event-driven design allows testing of component interactions

#### Maintainability
- Clean separation of concerns through service boundaries
- Interface-based design for loose coupling
- Comprehensive documentation and API references

#### Extensibility
- Plugin system for custom functionality
- Event system for reactive extensions
- Configuration system for runtime customization

#### Reliability
- Structured error handling and logging
- Configuration validation prevents runtime errors
- Service lifecycle management ensures proper cleanup

### Migration Path

The modernized architecture maintains backward compatibility while providing a migration path:

1. **Phase 1**: Core services implemented alongside existing code
2. **Phase 2**: Gradual migration of components to use new services
3. **Phase 3**: Complete adoption with plugin and configuration systems

### Performance Characteristics

- **Memory**: Reduced object creation through persistent instances
- **CPU**: Efficient event-driven processing
- **I/O**: Async configuration loading with caching
- **Maintainability**: Interface-based design reduces coupling

This modernized architecture transforms the codebase into a maintainable, extensible, and testable system suitable for long-term development and community contributions.
