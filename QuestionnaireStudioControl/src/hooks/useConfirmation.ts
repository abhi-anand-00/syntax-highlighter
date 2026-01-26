/**
 * useConfirmation Hook
 * 
 * Provides a programmatic way to show confirmation dialogs.
 */

import { useState, useCallback } from 'react';

export interface ConfirmationState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: 'default' | 'destructive';
  onConfirm: () => void;
}

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
}

const DEFAULT_STATE: ConfirmationState = {
  isOpen: false,
  title: '',
  description: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'default',
  onConfirm: () => { /* no-op default */ },
};

/**
 * Hook for managing confirmation dialogs
 */
export const useConfirmation = () => {
  const [state, setState] = useState<ConfirmationState>(DEFAULT_STATE);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title,
        description: options.description,
        confirmLabel: options.confirmLabel ?? 'Confirm',
        cancelLabel: options.cancelLabel ?? 'Cancel',
        variant: options.variant ?? 'default',
        onConfirm: () => {
          setState(DEFAULT_STATE);
          resolve(true);
        },
      });
    });
  }, []);

  const cancel = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  const confirmDelete = useCallback((itemName: string): Promise<boolean> => {
    return confirm({
      title: `Delete ${itemName}?`,
      description: `This action cannot be undone. Are you sure you want to delete this ${itemName.toLowerCase()}?`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
  }, [confirm]);

  const confirmDiscard = useCallback((itemName: string): Promise<boolean> => {
    return confirm({
      title: `Discard changes?`,
      description: `You have unsaved changes to ${itemName}. Are you sure you want to discard them?`,
      confirmLabel: 'Discard',
      variant: 'destructive',
    });
  }, [confirm]);

  return {
    state,
    confirm,
    cancel,
    confirmDelete,
    confirmDiscard,
  };
};

/**
 * Helper type for dialog props
 */
export interface ConfirmationDialogProps {
  state: ConfirmationState;
  onCancel: () => void;
}
