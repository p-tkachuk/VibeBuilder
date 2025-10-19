import React from 'react';
import { Background } from '@xyflow/react';

export const TerrainOverlay: React.FC = () => {
  return (
    <Background
      style={{
        background: 'linear-gradient(45deg, #2d5016 25%, #3a5f1a 25%, #3a5f1a 50%, #2d5016 50%, #2d5016 75%, #3a5f1a 75%)',
        backgroundSize: '40px 40px',
        opacity: 0.3
      }}
    />
  );
};
