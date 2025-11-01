import { useEffect, useRef } from 'react';
import { BuildingType } from '../types/buildings';

export type MenuState = 'closed' | 'main' | 'save' | 'load';

/**
 * Custom hook for keyboard actions
 * Handles ESC (deselect/menu/pause) and Delete (remove selected buildings) actions
 */
export const useKeyboardActions = (
    selectedBuildingType: BuildingType | null,
    clearSelection: () => void,
    deleteSelectedNodes?: () => void,
    menuState?: MenuState,
    setMenuState?: (state: MenuState) => void,
    isPaused?: boolean,
    setIsPaused?: (paused: boolean) => void
) => {
    const escPressedRef = useRef(false);

    // Handle ESC key to cancel building placement or open/close menu
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();

                // If pause modal is open, close it
                if (isPaused && menuState === 'closed' && setIsPaused) {
                    setIsPaused(false);
                    return;
                }

                // If menu is open, close it and unpause
                if (menuState && menuState !== 'closed' && setMenuState) {
                    setMenuState('closed');
                    if (setIsPaused) {
                        setIsPaused(false);
                    }
                    return;
                }

                // If something is selected, clear selection first
                if (selectedBuildingType) {
                    clearSelection();
                    escPressedRef.current = true;
                    // Reset the flag after a short delay
                    setTimeout(() => {
                        escPressedRef.current = false;
                    }, 300);
                    return;
                }

                // If nothing is selected and menu is closed, open menu and pause
                if (setMenuState) {
                    setMenuState('main');
                    if (setIsPaused) {
                        setIsPaused(true);
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedBuildingType, clearSelection, menuState, setMenuState, isPaused, setIsPaused]);

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
