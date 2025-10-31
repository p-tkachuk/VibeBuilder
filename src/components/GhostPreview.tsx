import React from 'react';
import { BuildingNode } from './BuildingNode';
import { BuildingType, BUILDING_CONFIGS } from '../types/buildings';
import type { GhostPreview as GhostPreviewData } from '../hooks/useGhostPreview';

/**
 * GhostPreview component - displays a preview of the building being placed
 * Follows Single Responsibility Principle - only handles ghost preview rendering
 */
interface GhostPreviewProps {
    selectedBuildingType: BuildingType | null;
    ghostPreview: GhostPreviewData | null;
}

export const GhostPreview: React.FC<GhostPreviewProps> = ({
    selectedBuildingType,
    ghostPreview,
}) => {
    if (!selectedBuildingType || !ghostPreview) {
        return null;
    }

    return (
        <div
            style={{
                position: 'absolute',
                left: ghostPreview.position.left,
                top: ghostPreview.position.top,
                pointerEvents: 'none',
                zIndex: 100,
                transform: ghostPreview.transform,
            }}
        >
            <BuildingNode
                data={{
                    buildingType: selectedBuildingType,
                    label: BUILDING_CONFIGS[selectedBuildingType].name,
                    id: 'ghost',
                    edges: [],
                    specialty: BUILDING_CONFIGS[selectedBuildingType].specialty
                }}
                ghost
            />
        </div>
    );
};
