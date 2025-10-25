import React from 'react';
import { ResourceType, RESOURCE_PATTERNS } from '../types/terrain';

interface ResourcePanelProps {
    resources: Record<string, number>;
}

/**
 * ResourcePanel component - displays current resource counts
 */
export const ResourcePanel: React.FC<ResourcePanelProps> = ({ resources }) => {
    return (
        <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '10px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            display: 'flex',
            gap: '15px'
        }}>
            {Object.entries(resources).map(([resource, count]) => (
                <div key={resource} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>{RESOURCE_PATTERNS[resource as ResourceType] || resource}</span>
                    <span>{count}</span>
                </div>
            ))}
        </div>
    );
};
