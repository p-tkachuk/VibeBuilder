import type { Node, Edge } from '@xyflow/react';
import { ResourceInventoryService } from './ResourceInventoryService';

export interface GameState {
  nodes: Node[];
  edges: Edge[];
  resourceInventory: {
    inventory: Record<string, number>;
    storageCapacity: number;
  };
  resourceFields: any[]; // ResourceField[]
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  timestamp: number;
}

/**
 * Service for saving and loading game state to/from localStorage
 */
export class SaveLoadService {
  private static readonly SAVE_SLOTS_KEY = 'atata_save_slots';
  private static readonly MAX_SLOTS = 3;

  /**
   * Save game state to a specific slot
   */
  static saveGame(slotIndex: number, nodes: Node[], edges: Edge[], resourceInventory: ResourceInventoryService, viewport: { x: number; y: number; zoom: number }, resourceFields: any[]): boolean {
    try {
      if (slotIndex < 0 || slotIndex >= this.MAX_SLOTS) {
        return false;
      }

      const gameState: GameState = {
        nodes: JSON.parse(JSON.stringify(nodes)), // Deep clone
        edges: JSON.parse(JSON.stringify(edges)), // Deep clone
        resourceInventory: {
          inventory: resourceInventory.getInventory(),
          storageCapacity: resourceInventory.getStorageCapacity(),
        },
        resourceFields: JSON.parse(JSON.stringify(resourceFields)), // Deep clone
        viewport: { ...viewport },
        timestamp: Date.now(),
      };

      const saveSlots = this.getSaveSlots();
      saveSlots[slotIndex] = gameState;

      localStorage.setItem(this.SAVE_SLOTS_KEY, JSON.stringify(saveSlots));
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  /**
   * Load game state from a specific slot
   */
  static loadGame(slotIndex: number): GameState | null {
    try {
      if (slotIndex < 0 || slotIndex >= this.MAX_SLOTS) {
        return null;
      }

      const saveSlots = this.getSaveSlots();
      return saveSlots[slotIndex] || null;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * Get all save slots with metadata
   */
  static getSaveSlots(): (GameState | null)[] {
    try {
      const saved = localStorage.getItem(this.SAVE_SLOTS_KEY);
      if (!saved) {
        return [null, null, null];
      }

      const saveSlots = JSON.parse(saved);
      // Ensure we have exactly MAX_SLOTS slots
      while (saveSlots.length < this.MAX_SLOTS) {
        saveSlots.push(null);
      }
      return saveSlots.slice(0, this.MAX_SLOTS);
    } catch (error) {
      console.error('Failed to get save slots:', error);
      return [null, null, null];
    }
  }

  /**
   * Check if a slot has a saved game
   */
  static hasSaveInSlot(slotIndex: number): boolean {
    const saveSlots = this.getSaveSlots();
    return saveSlots[slotIndex] !== null;
  }

  /**
   * Get formatted timestamp for a save slot
   */
  static getSaveTimestamp(slotIndex: number): string | null {
    const saveSlots = this.getSaveSlots();
    const save = saveSlots[slotIndex];
    if (!save) return null;

    const date = new Date(save.timestamp);
    return date.toLocaleString();
  }

  /**
   * Clear all save data (for testing/debugging)
   */
  static clearAllSaves(): void {
    localStorage.removeItem(this.SAVE_SLOTS_KEY);
  }
}
