import { GRID_SIZE, BUILDING_WIDTH, BUILDING_HEIGHT } from '../constants/game.constants';
import type { ResourceField } from '../types/terrain';
import { ResourceType } from '../types/terrain';

export interface Position {
    x: number;
    y: number;
}

export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Snaps a position to the grid
 */
export const snapToGrid = (position: Position): Position => {
    return {
        x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(position.y / GRID_SIZE) * GRID_SIZE,
    };
};

/**
 * Centers a building position
 */
export const centerBuildingPosition = (position: Position): Position => {
    return {
        x: position.x - BUILDING_WIDTH / 2,
        y: position.y - BUILDING_HEIGHT / 2,
    };
};

/**
 * Gets the center point of a building from its top-left position
 */
export const getBuildingCenter = (position: Position): Position => {
    return {
        x: position.x + BUILDING_WIDTH / 2,
        y: position.y + BUILDING_HEIGHT / 2,
    };
};

/**
 * Checks if a point is within a rectangle
 */
export const isPointInRectangle = (
    point: Position,
    rectangle: Rectangle
): boolean => {
    return (
        point.x >= rectangle.x &&
        point.x <= rectangle.x + rectangle.width &&
        point.y >= rectangle.y &&
        point.y <= rectangle.y + rectangle.height
    );
};

/**
 * Checks if a position is within any resource field
 */
export const isPositionInResourceField = (
    position: Position,
    resourceFields: ResourceField[],
    resourceType?: ResourceType
): boolean => {
    return resourceFields.some((field) => {
        const isInField = isPointInRectangle(position, {
            x: field.x,
            y: field.y,
            width: field.width,
            height: field.height,
        });
        return resourceType ? isInField && field.type === resourceType : isInField;
    });
};

/**
 * Converts screen coordinates to flow coordinates with transform applied
 */
export const screenToFlowWithTransform = (
    screenPos: Position,
    transform: [number, number, number]
): Position => {
    const [tx, ty, zoom] = transform;
    return {
        x: screenPos.x * zoom + tx,
        y: screenPos.y * zoom + ty,
    };
};

/**
 * Checks if two rectangles overlap
 */
export const doRectanglesOverlap = (
    rect1: Rectangle,
    rect2: Rectangle
): boolean => {
    return !(
        rect1.x + rect1.width <= rect2.x ||
        rect2.x + rect2.width <= rect1.x ||
        rect1.y + rect1.height <= rect2.y ||
        rect2.y + rect2.height <= rect1.y
    );
};
