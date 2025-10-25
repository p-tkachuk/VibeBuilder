import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    onClose: () => void;
}

/**
 * Toast component for displaying temporary messages
 */
export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000); // Auto-dismiss after 3 seconds
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                zIndex: 10000,
                maxWidth: '300px',
                wordWrap: 'break-word',
            }}
        >
            {message}
        </div>
    );
};
