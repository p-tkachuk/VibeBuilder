import { useMemo } from 'react';
import { useStore } from '@xyflow/react';
import { BuildingType } from '../types/buildings';
import { centerBuildingPosition } from '../utils/position.utils';
import type { Position } from '../utils/position.utils';

export interface GhostPreview {
    position: { left: number; top: number };
    transform: string;
}

/**
 * Custom hook for managing ghost building preview
 * Follows Single Responsibility Principle - only handles ghost preview calculations
 */
export const useGhostPreview = (
    selectedBuildingType: BuildingType | null,
    mousePosition: Position | null
): GhostPreview | null => {
    const [transform] = useStore((state) => [state.transform]);

    return useMemo(() => {
        if (!selectedBuildingType || !mousePosition || !transform) {
            return null;
        }

        const [tx, ty, zoom] = transform;

        // Calculate screen position for ghost building
        const centeredPosition = centerBuildingPosition(mousePosition);
        const ghostScreen = {
            left: centeredPosition.x * zoom + tx,
            top: centeredPosition.y * zoom + ty,
        };

        return {
            position: ghostScreen,
            transform: `translate(-50%, -50%) scale(${zoom})`,
        };
    }, [selectedBuildingType, mousePosition, transform]);
};
