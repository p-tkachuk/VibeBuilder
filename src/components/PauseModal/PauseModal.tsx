import React from 'react';
import styles from './PauseModal.module.css';

interface PauseModalProps {
  onResume: () => void;
}

/**
 * Pause modal component
 * Appears when pause button is pressed
 */
export const PauseModal: React.FC<PauseModalProps> = ({ onResume }) => {
  return (
    <div className={styles.pauseModalOverlay} onClick={onResume}>
      <div className={styles.pauseModal} onClick={(e) => e.stopPropagation()}>
        <h2>PAUSE</h2>
        <p className={styles.pauseHint}>Click anywhere or press ESC to resume</p>
      </div>
    </div>
  );
};


