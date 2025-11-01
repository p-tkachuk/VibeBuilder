import React from 'react';
import { SaveLoadService } from '../services/SaveLoadService';
import styles from './SaveMenu.module.css';

interface SaveMenuProps {
  onSave: (slotIndex: number) => void;
  onBack: () => void;
}

/**
 * Save menu component showing available save slots
 */
export const SaveMenu: React.FC<SaveMenuProps> = ({ onSave, onBack }) => {
  const saveSlots = SaveLoadService.getSaveSlots();

  const handleSave = (slotIndex: number) => {
    onSave(slotIndex);
  };

  return (
    <div className={styles.saveMenuOverlay} onClick={onBack}>
      <div className={styles.saveMenu} onClick={(e) => e.stopPropagation()}>
        <h2>Save Game</h2>
        <p className={styles.menuDescription}>Choose a slot to save your game</p>
        <div className={styles.saveSlots}>
          {[0, 1, 2].map((slotIndex) => {
            const hasSave = SaveLoadService.hasSaveInSlot(slotIndex);
            const timestamp = SaveLoadService.getSaveTimestamp(slotIndex);

            return (
              <div key={slotIndex} className={styles.saveSlot}>
                <div className={styles.slotInfo}>
                  <span className={styles.slotLabel}>Slot {slotIndex + 1}</span>
                  {hasSave && timestamp && (
                    <span className={styles.slotTimestamp}>{timestamp}</span>
                  )}
                  {!hasSave && (
                    <span className={styles.slotEmpty}>Empty</span>
                  )}
                </div>
                <button
                  className={styles.saveSlotButton}
                  onClick={() => handleSave(slotIndex)}
                >
                  {hasSave ? 'Overwrite' : 'Save'}
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
