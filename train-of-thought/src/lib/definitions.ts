// Constants

// Types
export type Mode = 'idle' | 'explore';

// Interfaces

// Props
export interface ConfirmModalProps {
    title:       string;
    message:     string;
    confirmLabel?: string;
    cancelLabel?:  string;
    destructive?:  boolean;
    loading?:      boolean;
    onConfirm:   () => void;
    onCancel:    () => void;
}