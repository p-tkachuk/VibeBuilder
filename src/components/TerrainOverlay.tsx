import React from 'react';
import { Background } from '@xyflow/react';
import { terrainOverlayStyles } from '../styles/components.styles';

/**
 * TerrainOverlay component - provides background pattern for the game terrain
 * Follows Single Responsibility Principle - only handles terrain background rendering
 */
export const TerrainOverlay: React.FC = () => {
  return <Background style={terrainOverlayStyles.background} />;
};
