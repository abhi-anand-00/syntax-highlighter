/**
 * useNotification Hook
 * 
 * Wrapper around Fluent UI toast notifications for consistent messaging.
 */

import { useCallback } from 'react';
import { useFluentToast } from './useFluentToast';

export interface NotificationOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Notification service for consistent toast messaging
 */
export const useNotification = () => {
  const toast = useFluentToast();

  const success = useCallback((message: string, options?: NotificationOptions) => {
    toast.success(message, options?.description);
  }, [toast]);

  const error = useCallback((message: string, options?: NotificationOptions) => {
    toast.error(message, options?.description);
  }, [toast]);

  const warning = useCallback((message: string, options?: NotificationOptions) => {
    toast.warning(message, options?.description);
  }, [toast]);

  const info = useCallback((message: string, options?: NotificationOptions) => {
    toast.info(message, options?.description);
  }, [toast]);

  const loading = useCallback((message: string) => {
    toast.info(message);
    return message;
  }, [toast]);

  const dismiss = useCallback((_toastId?: string | number) => {
    // Fluent UI toasts auto-dismiss, no manual dismiss needed
  }, []);

  const promise = useCallback(<T,>(
    promiseFn: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ): void => {
    toast.info(messages.loading);
    promiseFn
      .then(() => toast.success(messages.success))
      .catch(() => toast.error(messages.error));
  }, [toast]);

  return {
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    promise,
  };
};
