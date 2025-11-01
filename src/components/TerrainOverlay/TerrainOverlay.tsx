import React from 'react';
import { Background } from '@xyflow/react';
import styles from './TerrainOverlay.module.css';

/**
 * TerrainOverlay component - provides background pattern for the game terrain
 * Follows Single Responsibility Principle - only handles terrain background rendering
 */
export const TerrainOverlay: React.FC = () => {
  return <Background className={styles.background} />;
};


