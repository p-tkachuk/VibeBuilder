import React from 'react';
import { ResourceType, RESOURCE_PATTERNS, RESOURCE_COLORS } from '../../types/terrain';

interface ResourcePanelProps {
    resources: Record<string, number>;
    storageCapacity: number;
}

/**
 * ResourcePanel component - displays current resource counts
 */
export const ResourcePanel: React.FC<ResourcePanelProps> = ({ resources }) => {
    const totalStored = Object.values(resources).reduce((sum, count) => sum + count, 0);

    return (
        <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '10px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {Object.entries(resources).map(([resource, count]) => (
                    <div key={resource} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span
                            style={{
                                color: RESOURCE_COLORS[resource as ResourceType],
                                textShadow: '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white'
                            }}
                        >
                            {RESOURCE_PATTERNS[resource as ResourceType] || resource}
                        </span>
                        <span>{count}</span>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', opacity: 0.8 }}>
                <span>📦</span>
                <span>{totalStored}</span>
            </div>
        </div>
    );
};


