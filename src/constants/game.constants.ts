/**
 * Game-wide constants
 */

// Grid and Layout
export const GRID_SIZE = 40;
export const BUILDING_WIDTH = 120;
export const BUILDING_HEIGHT = 80;

// Z-Index layers
export const Z_INDEX = {
    RESOURCE_FIELD: 0,
    BUILDING: 1,
    UI_OVERLAY: 10,
    GHOST_PREVIEW: 100,
    MENU: 1000,
} as const;

// Colors
export const COLORS = {
    TERRAIN_PRIMARY: '#2d5016',
    TERRAIN_SECONDARY: '#3a5f1a',
    MENU_BACKGROUND: 'rgba(0, 0, 0, 0.8)',
    MENU_ITEM_HOVER: 'rgba(255, 255, 255, 0.1)',
    SELECTED_BUILDING: '#4CAF50',
    SELECTED_BORDER: '#81C784',
    HANDLE_BACKGROUND: '#555',
} as const;

// Sizes
export const SIZES = {
    HANDLE: 8,
    MENU_GAP: 8,
    MENU_PADDING: 16,
    BUTTON_PADDING: 12,
    ICON_SIZE: 18,
    MENU_MIN_WIDTH: 200,
} as const;

// Opacity
export const OPACITY = {
    RESOURCE_FIELD: 0.8,
    TERRAIN_PATTERN: 0.3,
    GHOST_BUILDING: 0.45,
} as const;
