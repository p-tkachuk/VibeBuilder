import { COLORS, SIZES, Z_INDEX, OPACITY } from '../constants/game.constants';

/**
 * Shared style objects for components
 * Eliminates inline styles and promotes DRY principle
 */

export const buildingMenuStyles = {
    container: {
        position: 'absolute' as const,
        top: '20px',
        left: '20px',
        zIndex: Z_INDEX.MENU,
        backgroundColor: COLORS.MENU_BACKGROUND,
        borderRadius: '8px',
        padding: SIZES.MENU_PADDING,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: SIZES.MENU_GAP,
        minWidth: SIZES.MENU_MIN_WIDTH,
    },
    title: {
        color: 'white',
        margin: '0 0 12px 0',
        fontSize: '16px',
        fontWeight: 'bold' as const,
    },
    selectedInfo: {
        backgroundColor: COLORS.MENU_ITEM_HOVER,
        padding: '8px',
        borderRadius: '4px',
        marginBottom: '8px',
        fontSize: '12px',
        color: 'white',
    },
};

export const buildingButtonStyles = {
    base: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: SIZES.BUTTON_PADDING,
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500' as const,
        transition: 'all 0.2s ease',
        textAlign: 'left' as const,
    },
    selected: {
        backgroundColor: COLORS.SELECTED_BUILDING,
        border: `2px solid ${COLORS.SELECTED_BORDER}`,
        color: 'white',
    },
    icon: {
        fontSize: SIZES.ICON_SIZE,
    },
    text: {
        fontWeight: 'bold' as const,
    },
    description: {
        fontSize: '12px',
        opacity: 0.9,
    },
};

export const buildingNodeStyles = {
    container: {
        borderRadius: '8px',
        padding: '12px',
        minWidth: '120px',
        textAlign: 'center' as const,
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold' as const,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    },
    ghost: {
        border: '2px dashed rgba(255,255,255,0.8)',
        opacity: OPACITY.GHOST_BUILDING,
        pointerEvents: 'none' as const,
        filter: 'blur(0.5px) grayscale(0.3)',
    },
    icon: {
        fontSize: '20px',
        marginBottom: '4px',
    },
};

export const resourceNodeStyles = {
    container: {
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold' as const,
        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
        pointerEvents: 'none' as const,
        zIndex: Z_INDEX.RESOURCE_FIELD,
    },
};

export const terrainOverlayStyles = {
    background: {
        background: `linear-gradient(45deg, ${COLORS.TERRAIN_PRIMARY} 25%, ${COLORS.TERRAIN_SECONDARY} 25%, ${COLORS.TERRAIN_SECONDARY} 50%, ${COLORS.TERRAIN_PRIMARY} 50%, ${COLORS.TERRAIN_PRIMARY} 75%, ${COLORS.TERRAIN_SECONDARY} 75%)`,
        backgroundSize: '40px 40px',
        opacity: OPACITY.TERRAIN_PATTERN,
    },
};

export const handleStyles = {
    background: COLORS.HANDLE_BACKGROUND,
    width: SIZES.HANDLE,
    height: SIZES.HANDLE,
};
