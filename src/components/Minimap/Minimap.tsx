import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { GAME_CONFIG } from '../../config/game.config';
import { BUILDING_CONFIGS } from '../../config/buildings';
import type { ResourceField } from '../../types/terrain';
import type { BuildingState } from '../../types/game-state';

/**
 * Minimap component - displays a small overview of the entire map
 * Shows resource fields, buildings, and current camera position, allows navigation by clicking
 * Optimized for real-time updates with minimal lag
 */
interface MinimapProps {
  resourceFields: ResourceField[];
  buildings: Record<string, BuildingState>;
}

export const Minimap: React.FC<MinimapProps> = React.memo(({ resourceFields, buildings }) => {
  const { getViewport, setViewport } = useReactFlow();

  const minimapSize = 200; // Size of the minimap in pixels
  const scale = minimapSize / Math.max(GAME_CONFIG.mapWidth, GAME_CONFIG.mapHeight);

  // Throttled viewport state to reduce update frequency
  const [throttledViewport, setThrottledViewport] = React.useState({ x: 0, y: 0, zoom: 1 });
  const throttledViewportRef = useRef(throttledViewport);

  // Throttle viewport updates to reduce re-renders
  useEffect(() => {
    let rafId: number;
    let lastUpdate = 0;

    const updateViewport = (timestamp: number) => {
      if (timestamp - lastUpdate >= 16) { // ~60fps
        const newViewport = getViewport();
        if (newViewport.x !== throttledViewportRef.current.x ||
            newViewport.y !== throttledViewportRef.current.y ||
            newViewport.zoom !== throttledViewportRef.current.zoom) {
          setThrottledViewport(newViewport);
          throttledViewportRef.current = newViewport;
        }
        lastUpdate = timestamp;
      }
      rafId = requestAnimationFrame(updateViewport);
    };

    rafId = requestAnimationFrame(updateViewport);

    return () => cancelAnimationFrame(rafId);
  }, [getViewport]);

  // Get current viewport bounds - memoized for performance
  const viewportBounds = useMemo(() => {
    const zoom = throttledViewport.zoom;
    // Calculate the world coordinates of the visible area
    const worldX = (0 - throttledViewport.x) / zoom;
    const worldY = (0 - throttledViewport.y) / zoom;
    const viewportWidth = window.innerWidth / zoom;
    const viewportHeight = window.innerHeight / zoom;

    return {
      x: worldX,
      y: worldY,
      width: viewportWidth,
      height: viewportHeight,
    };
  }, [throttledViewport]);

  // Handle minimap click to move camera
  const handleMinimapClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Convert minimap coordinates to world coordinates
    let worldX = clickX / scale;
    let worldY = clickY / scale;

    // Clamp the target position to stay within map boundaries
    worldX = Math.max(0, Math.min(GAME_CONFIG.mapWidth, worldX));
    worldY = Math.max(0, Math.min(GAME_CONFIG.mapHeight, worldY));

    // Center the viewport on the clicked (clamped) position
    setViewport({
      x: -worldX * throttledViewport.zoom + window.innerWidth / 2,
      y: -worldY * throttledViewport.zoom + window.innerHeight / 2,
      zoom: throttledViewport.zoom,
    });
  }, [scale, throttledViewport.zoom, setViewport]);

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

      {/* Buildings */}
      {Object.values(buildings).map((building) => {
        const buildingConfig = BUILDING_CONFIGS[building.type];
        const buildingSize = 4; // Small fixed size for buildings on minimap

        return (
          <div
            key={building.id}
            style={{
              position: 'absolute',
              left: `${building.position.x * scale - buildingSize / 2}px`,
              top: `${building.position.y * scale - buildingSize / 2}px`,
              width: `${buildingSize}px`,
              height: `${buildingSize}px`,
              backgroundColor: buildingConfig?.color || '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.8)',
              borderRadius: '1px',
              pointerEvents: 'none',
            }}
          />
        );
      })}

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
});
