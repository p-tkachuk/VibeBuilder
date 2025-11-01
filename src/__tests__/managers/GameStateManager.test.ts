import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameStateManager } from '../../managers/GameStateManager';
import { BuildingType } from '../../types/buildings';
import type { BuildingState } from '../../types/game-state';

describe('GameStateManager', () => {
  let gameStateManager: GameStateManager;

  beforeEach(() => {
    gameStateManager = new GameStateManager();
  });

  it('should initialize with default state', () => {
    const state = gameStateManager.getState();
    expect(state.buildings).toEqual({});
    expect(state.globalInventory).toEqual({});
    expect(state.storageCapacity).toBe(100);
    expect(state.tickCount).toBe(0);
  });

  it('should add buildings', () => {
    const buildingState: BuildingState = {
      id: 'test-building',
      type: BuildingType.COPPER_MINER,
      position: { x: 10, y: 20 },
      inventory: { 'copper-ore': 5 },
      energyShortage: false,
      connections: { inputs: [], outputs: [], energyInputs: [] }
    };

    gameStateManager.addBuilding(buildingState);

    const state = gameStateManager.getState();
    expect(state.buildings['test-building']).toEqual(buildingState);
  });

  it('should update buildings', () => {
    const buildingState: BuildingState = {
      id: 'test-building',
      type: BuildingType.COPPER_MINER,
      position: { x: 10, y: 20 },
      inventory: { 'copper-ore': 5 },
      energyShortage: false,
      connections: { inputs: [], outputs: [], energyInputs: [] }
    };

    gameStateManager.addBuilding(buildingState);
    gameStateManager.updateBuilding('test-building', {
      inventory: { 'copper-ore': 10 },
      energyShortage: true
    });

    const state = gameStateManager.getState();
    expect(state.buildings['test-building'].inventory['copper-ore']).toBe(10);
    expect(state.buildings['test-building'].energyShortage).toBe(true);
  });

  it('should remove buildings', () => {
    const buildingState: BuildingState = {
      id: 'test-building',
      type: BuildingType.COPPER_MINER,
      position: { x: 10, y: 20 },
      inventory: { 'copper-ore': 5 },
      energyShortage: false,
      connections: { inputs: [], outputs: [], energyInputs: [] }
    };

    gameStateManager.addBuilding(buildingState);
    gameStateManager.removeBuilding('test-building');

    const state = gameStateManager.getState();
    expect(state.buildings['test-building']).toBeUndefined();
  });

  it('should notify listeners on state changes', () => {
    const mockListener = vi.fn();
    gameStateManager.subscribe(mockListener);

    const buildingState: BuildingState = {
      id: 'test-building',
      type: BuildingType.COPPER_MINER,
      position: { x: 10, y: 20 },
      inventory: { 'copper-ore': 5 },
      energyShortage: false,
      connections: { inputs: [], outputs: [], energyInputs: [] }
    };

    gameStateManager.addBuilding(buildingState);

    expect(mockListener).toHaveBeenCalledWith({
      type: 'building_created',
      buildingId: 'test-building',
      changes: buildingState
    });
  });

  it('should allow unsubscribing from listeners', () => {
    const mockListener = vi.fn();
    const unsubscribe = gameStateManager.subscribe(mockListener);

    unsubscribe();

    const buildingState: BuildingState = {
      id: 'test-building',
      type: BuildingType.COPPER_MINER,
      position: { x: 10, y: 20 },
      inventory: { 'copper-ore': 5 },
      energyShortage: false,
      connections: { inputs: [], outputs: [], energyInputs: [] }
    };

    gameStateManager.addBuilding(buildingState);

    expect(mockListener).not.toHaveBeenCalled();
  });
});
