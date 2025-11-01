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
    mapWidth: 8000,
    mapHeight: 8000,

    // Number of each resource type to generate
    resourceCount: {
        'iron-ore': 3,
        coal: 3,
        'copper-ore': 2,
        stone: 2,
    },

    // Resource field size ranges
    resourceFieldSize: {
        minWidth: 200,
        maxWidth: 240,
        minHeight: 140,
        maxHeight: 160,
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
    },
};
