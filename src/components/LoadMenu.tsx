import React from 'react';
import { SaveLoadService } from '../services/SaveLoadService';
import styles from './LoadMenu.module.css';

interface LoadMenuProps {
  onLoad: (slotIndex: number) => void;
  onBack: () => void;
}

/**
 * Load menu component showing available save slots for loading
 */
export const LoadMenu: React.FC<LoadMenuProps> = ({ onLoad, onBack }) => {
  const saveSlots = SaveLoadService.getSaveSlots();

  const handleLoad = (slotIndex: number) => {
    if (SaveLoadService.hasSaveInSlot(slotIndex)) {
      onLoad(slotIndex);
    }
  };

  return (
    <div className={styles.loadMenuOverlay} onClick={onBack}>
      <div className={styles.loadMenu} onClick={(e) => e.stopPropagation()}>
        <h2>Load Game</h2>
        <p className={styles.menuDescription}>Choose a save to load</p>
        <div className={styles.loadSlots}>
          {[0, 1, 2].map((slotIndex) => {
            const hasSave = SaveLoadService.hasSaveInSlot(slotIndex);
            const timestamp = SaveLoadService.getSaveTimestamp(slotIndex);

            return (
              <div key={slotIndex} className={`${styles.loadSlot} ${!hasSave ? styles.empty : ''}`}>
                <div className={styles.slotInfo}>
                  <span className={styles.slotLabel}>Slot {slotIndex + 1}</span>
                  {hasSave && timestamp && (
                    <span className={styles.slotTimestamp}>{timestamp}</span>
                  )}
                  {!hasSave && (
                    <span className={styles.slotEmpty}>No save data</span>
                  )}
                </div>
                <button
                  className={styles.loadSlotButton}
                  disabled={!hasSave}
                  onClick={() => handleLoad(slotIndex)}
                >
                  {hasSave ? 'Load' : 'Empty'}
                </button>
              </div>
            );
          })}
        </div>
        <button className={styles.backButton} onClick={onBack}>
          Back to Menu
        </button>
      </div>
    </div>
  );
};
