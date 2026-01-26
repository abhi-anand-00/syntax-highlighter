/**
 * useFileUpload Hook
 * 
 * Generic hook for handling file uploads with validation and error handling.
 */

import { useRef, useCallback, useState } from 'react';
import { tryCatch } from '../lib/core/result';
import { createLogger } from '../lib/core/logger';
import { useFluentToast } from './useFluentToast';

const logger = createLogger('FileUpload');

export interface FileUploadConfig {
  accept?: string;
  maxSizeBytes?: number;
  onError?: (message: string) => void;
  showToast?: boolean;
}

export interface FileUploadResult<T> {
  inputRef: React.RefObject<HTMLInputElement | null>;
  triggerUpload: () => void;
  reset: () => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Creates a file upload handler with parsing
 */
export const useFileUpload = <T>(
  parser: (file: File) => Promise<T>,
  onSuccess: (data: T) => void,
  config: FileUploadConfig = {}
): FileUploadResult<T> => {
  const {
    accept = '.json',
    maxSizeBytes = 10 * 1024 * 1024, // 10MB default
    onError,
    showToast = true,
  } = config;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useFluentToast();

  const handleError = useCallback((message: string) => {
    setError(message);
    logger.error(message);
    if (showToast) {
      toast.error(message);
    }
    onError?.(message);
  }, [onError, showToast, toast]);

  const handleChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeBytes) {
      handleError(`File too large. Maximum size is ${Math.round(maxSizeBytes / 1024 / 1024)}MB`);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await tryCatch(() => parser(file));

    setIsLoading(false);

    if (result.success) {
      if (showToast) {
        toast.success('File loaded successfully');
      }
      onSuccess(result.data);
    } else {
      handleError(result.error.message || 'Failed to parse file');
    }
  }, [parser, onSuccess, maxSizeBytes, handleError, showToast, toast]);

  const triggerUpload = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const reset = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    inputRef,
    triggerUpload,
    reset,
    isLoading,
    error,
  };
};

/**
 * Simplified JSON file upload hook
 */
export const useJsonFileUpload = <T>(
  onSuccess: (data: T) => void,
  validator?: (data: unknown) => data is T
): FileUploadResult<T> => {
  const parser = async (file: File): Promise<T> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          
          if (validator && !validator(parsed)) {
            reject(new Error('Invalid file format'));
            return;
          }
          
          resolve(parsed as T);
        } catch {
          reject(new Error('Failed to parse JSON file'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  return useFileUpload(parser, onSuccess, { accept: '.json' });
};
