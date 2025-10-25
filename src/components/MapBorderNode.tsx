import React from 'react';
import { GAME_CONFIG } from '../config/game.config';

/**
 * MapBorderNode component - displays a "do not cross" tape border as a ReactFlow node
 * Follows Single Responsibility Principle - only handles map border rendering
 */
export const MapBorderNode: React.FC = () => {
    const { mapWidth, mapHeight } = GAME_CONFIG;
    const borderWidth = 20; // Width of the border tape

    const horizontalBorderStyle: React.CSSProperties = {
        position: 'absolute',
        background: `repeating-linear-gradient(45deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 10px, rgba(255,215,0,0.7) 10px, rgba(255,215,0,0.7) 20px)`,
        pointerEvents: 'none',
        zIndex: 9999, // Very high z-index to ensure visibility
        animation: 'borderAnimation 10s linear infinite',
    };

    const verticalBorderStyle: React.CSSProperties = {
        position: 'absolute',
        background: `repeating-linear-gradient(135deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 10px, rgba(255,215,0,0.7) 10px, rgba(255,215,0,0.7) 20px)`,
        pointerEvents: 'none',
        zIndex: 9999, // Very high z-index to ensure visibility
        animation: 'borderAnimationVertical 10s linear infinite',
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
                    ...horizontalBorderStyle,
                    top: -borderWidth,
                    left: -borderWidth,
                    width: mapWidth + 2 * borderWidth,
                    height: borderWidth,
                }}
            />

            {/* Bottom border */}
            <div
                style={{
                    ...horizontalBorderStyle,
                    top: mapHeight,
                    left: -borderWidth,
                    width: mapWidth + 2 * borderWidth,
                    height: borderWidth,
                }}
            />

            {/* Left border */}
            <div
                style={{
                    ...verticalBorderStyle,
                    top: -borderWidth,
                    left: -borderWidth,
                    width: borderWidth,
                    height: mapHeight + 2 * borderWidth,
                }}
            />

            {/* Right border */}
            <div
                style={{
                    ...verticalBorderStyle,
                    top: -borderWidth,
                    left: mapWidth,
                    width: borderWidth,
                    height: mapHeight + 2 * borderWidth,
                }}
            />
        </div>
    );
};
