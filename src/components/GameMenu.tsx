import React from 'react';
import styles from './GameMenu.module.css';

interface GameMenuProps {
  onSave: () => void;
  onLoad: () => void;
  onClose: () => void;
}

/**
 * Main game menu component
 * Appears when ESC is pressed (after clearing selection)
 */
export const GameMenu: React.FC<GameMenuProps> = ({ onSave, onLoad, onClose }) => {
  return (
    <div className={styles.gameMenuOverlay} onClick={onClose}>
      <div className={styles.gameMenu} onClick={(e) => e.stopPropagation()}>
        <h2>Game Menu</h2>
        <div className={styles.menuButtons}>
          <button className={`${styles.menuButton} ${styles.saveButton}`} onClick={onSave}>
            Save Game
          </button>
          <button className={`${styles.menuButton} ${styles.loadButton}`} onClick={onLoad}>
            Load Game
          </button>
          <button className={`${styles.menuButton} ${styles.closeButton}`} onClick={onClose}>
            Resume Game
          </button>
        </div>
        <p className={styles.menuHint}>Press ESC to close menu</p>
      </div>
    </div>
  );
};
