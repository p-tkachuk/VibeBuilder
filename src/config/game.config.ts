/**
 * Game configuration file
 * Contains all configurable game options
 */

export interface GameConfig {
    // Map settings
    mapWidth: number;
    mapHeight: number;

    // Resource settings
    resourceCount: {
        [key: string]: number;
    };

    // Resource field sizes (min/max)
    resourceFieldSize: {
        minWidth: number;
        maxWidth: number;
        minHeight: number;
        maxHeight: number;
    };

    // Resource intensity range
    resourceIntensity: {
        min: number;
        max: number;
    };

    // Resource inventory settings
    storageCapacity: number;

    startingResources: {
        [key: string]: number;
    };
}

export const GAME_CONFIG: GameConfig = {
    // Map dimensions
    mapWidth: 2000,
    mapHeight: 2000,

    // Number of each resource type to generate
    resourceCount: {
        'iron-ore': 2,
        coal: 2,
        'copper-ore': 2,
        stone: 2,
    },

    // Resource field size ranges
    resourceFieldSize: {
        minWidth: 120,
        maxWidth: 200,
        minHeight: 80,
        maxHeight: 140,
    },

    // Resource intensity (resource richness)
    resourceIntensity: {
        min: 0.5,
        max: 0.9,
    },

    // Storage capacity in units
    storageCapacity: 1000,

    // Starting resources
    startingResources: {
        stone: 100,
        'iron-ore': 100,
        'copper-ore': 100,
    },
};
