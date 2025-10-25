import { useState, useCallback } from 'react';
import { BuildingType } from '../types/buildings';

/**
 * Custom hook for managing building type selection state
 * Follows Single Responsibility Principle - only handles building type selection
 * Removed React Flow dependencies to avoid context issues
 */
export const useBuildingPlacement = () => {
    const [selectedBuildingType, setSelectedBuildingType] = useState<BuildingType | null>(null);

    const handleBuildingSelect = useCallback((buildingType: BuildingType) => {
        setSelectedBuildingType(buildingType);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedBuildingType(null);
    }, []);

    return {
        selectedBuildingType,
        handleBuildingSelect,
        clearSelection,
    };
};
