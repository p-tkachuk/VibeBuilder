import React, { useCallback, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import { GAME_CONFIG } from '../config/game.config';
import type { ResourceField } from '../types/terrain';

/**
 * Minimap component - displays a small overview of the entire map
 * Shows resource fields and current camera position, allows navigation by clicking
 */
interface MinimapProps {
  resourceFields: ResourceField[];
}

export const Minimap: React.FC<MinimapProps> = ({ resourceFields }) => {
  const { getViewport, setViewport, getNodes } = useReactFlow();

  const minimapSize = 200; // Size of the minimap in pixels
  const scale = minimapSize / Math.max(GAME_CONFIG.mapWidth, GAME_CONFIG.mapHeight);

  // Get current viewport bounds
  const viewport = getViewport();
  const viewportBounds = useMemo(() => {
    const zoom = viewport.zoom;
    // Calculate the world coordinates of the visible area
    // Top-left world coordinate: (0 - viewport.x) / zoom
    // Bottom-right world coordinate: (screenSize - viewport.x) / zoom
    const worldX = (0 - viewport.x) / zoom;
    const worldY = (0 - viewport.y) / zoom;
    const viewportWidth = window.innerWidth / zoom;
    const viewportHeight = window.innerHeight / zoom;

    return {
      x: worldX,
      y: worldY,
      width: viewportWidth,
      height: viewportHeight,
    };
  }, [viewport]);

  // Handle minimap click to move camera
  const handleMinimapClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Convert minimap coordinates to world coordinates
    const worldX = clickX / scale;
    const worldY = clickY / scale;

    // Center the viewport on the clicked position
    setViewport({
      x: -worldX * viewport.zoom + window.innerWidth / 2,
      y: -worldY * viewport.zoom + window.innerHeight / 2,
      zoom: viewport.zoom,
    });
  }, [scale, viewport.zoom, setViewport]);

  // Get resource field colors
  const getResourceColor = (type: string) => {
    switch (type) {
      case 'iron-ore': return '#8B4513';
      case 'coal': return '#2F2F2F';
      case 'copper-ore': return '#B87333';
      case 'stone': return '#696969';
      default: return '#4A4A4A';
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: `${minimapSize}px`,
        height: `${minimapSize}px`,
        backgroundColor: '#1a1a1a',
        border: '2px solid #333',
        borderRadius: '4px',
        zIndex: 1000,
        cursor: 'pointer',
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
      onClick={handleMinimapClick}
    >
      {/* Resource fields */}
      {resourceFields.map((field) => (
        <div
          key={field.id}
          style={{
            position: 'absolute',
            left: `${field.x * scale}px`,
            top: `${field.y * scale}px`,
            width: `${field.width * scale}px`,
            height: `${field.height * scale}px`,
            backgroundColor: getResourceColor(field.type),
            opacity: 0.7,
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        />
      ))}

      {/* Current viewport indicator */}
      <div
        style={{
          position: 'absolute',
          left: `${viewportBounds.x * scale}px`,
          top: `${viewportBounds.y * scale}px`,
          width: `${viewportBounds.width * scale}px`,
          height: `${viewportBounds.height * scale}px`,
          border: '2px solid #fff',
          backgroundColor: 'rgba(255,255,255,0.1)',
          pointerEvents: 'none',
        }}
      />

      {/* Map border */}
      <div
        style={{
          position: 'absolute',
          left: '0px',
          top: '0px',
          width: `${GAME_CONFIG.mapWidth * scale}px`,
          height: `${GAME_CONFIG.mapHeight * scale}px`,
          border: '1px solid #666',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
