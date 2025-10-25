import { useEffect } from 'react';
import { BuildingType } from '../types/buildings';

/**
 * Custom hook for keyboard actions
 * Handles ESC (deselect) and Delete (remove selected buildings) actions
 */
export const useKeyboardActions = (
    selectedBuildingType: BuildingType | null,
    clearSelection: () => void,
    deleteSelectedNodes?: () => void
) => {
    // Handle ESC key to cancel building placement
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && selectedBuildingType) {
                clearSelection();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedBuildingType, clearSelection]);

    // Handle Delete key to remove selected buildings
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Delete') {
                if (deleteSelectedNodes) {
                    deleteSelectedNodes();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [deleteSelectedNodes]);
};
