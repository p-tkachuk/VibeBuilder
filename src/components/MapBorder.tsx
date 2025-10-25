import React from 'react';
import { GAME_CONFIG } from '../config/game.config';

/**
 * MapBorder component - displays a "do not cross" tape border around the map boundaries
 * Follows Single Responsibility Principle - only handles map border rendering
 */
export const MapBorder: React.FC = () => {
    const { mapWidth, mapHeight } = GAME_CONFIG;
    const borderWidth = 20; // Width of the border tape

    return (
        <div
            style={{
                position: 'absolute',
                top: -borderWidth,
                left: -borderWidth,
                width: mapWidth + 2 * borderWidth,
                height: mapHeight + 2 * borderWidth,
                pointerEvents: 'none',
                zIndex: 5, // Above terrain but below UI elements
                background: `repeating-linear-gradient(
                    45deg,
                    #000000,
                    #000000 10px,
                    #FFD700 10px,
                    #FFD700 20px
                )`,
                border: '2px solid #000000',
                boxSizing: 'border-box',
            }}
        />
    );
};
