import React from 'react';
import { GAME_CONFIG } from '../config/game.config';

interface MapBorderNodeData {
    mapWidth: number;
    mapHeight: number;
}

interface MapBorderNodeProps {
    data: MapBorderNodeData;
}

/**
 * MapBorderNode component - displays a "do not cross" tape border as a ReactFlow node
 * Follows Single Responsibility Principle - only handles map border rendering
 */
export const MapBorderNode: React.FC<MapBorderNodeProps> = ({ data }) => {
    const { mapWidth, mapHeight } = GAME_CONFIG;
    const borderWidth = 20; // Width of the border tape

    const borderStyle: React.CSSProperties = {
        position: 'absolute',
        background: `repeating-linear-gradient(45deg, #000000 0px, #000000 10px, #FFD700 10px, #FFD700 20px)`,
        pointerEvents: 'none',
        zIndex: 9999, // Very high z-index to ensure visibility
    };

    return (
        <div
            style={{
                width: mapWidth,
                height: mapHeight,
                position: 'relative',
                pointerEvents: 'none',
            }}
        >
            {/* Top border */}
            <div
                style={{
                    ...borderStyle,
                    top: -borderWidth,
                    left: -borderWidth,
                    width: mapWidth + 2 * borderWidth,
                    height: borderWidth,
                }}
            />

            {/* Bottom border */}
            <div
                style={{
                    ...borderStyle,
                    top: mapHeight,
                    left: -borderWidth,
                    width: mapWidth + 2 * borderWidth,
                    height: borderWidth,
                }}
            />

            {/* Left border */}
            <div
                style={{
                    ...borderStyle,
                    top: -borderWidth,
                    left: -borderWidth,
                    width: borderWidth,
                    height: mapHeight + 2 * borderWidth,
                }}
            />

            {/* Right border */}
            <div
                style={{
                    ...borderStyle,
                    top: -borderWidth,
                    left: mapWidth,
                    width: borderWidth,
                    height: mapHeight + 2 * borderWidth,
                }}
            />
        </div>
    );
};
