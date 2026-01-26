/**
 * Generic Storage Service
 * 
 * Type-safe wrapper around localStorage with error handling and JSON serialization.
 */

import { Result, success, failure, tryCatchSync } from '../core/result';
import { createLogger } from '../core/logger';
import { safeJsonParse } from '../core/guards';

const logger = createLogger('Storage');

/**
 * Storage service interface
 */
export interface StorageService<T> {
  get: () => Result<T | null, Error>;
  set: (value: T) => Result<void, Error>;
  remove: () => Result<void, Error>;
  exists: () => boolean;
}

/**
 * Creates a typed storage service for a specific key
 */
export const createStorageService = <T>(
  key: string,
  validator?: (value: unknown) => value is T
): StorageService<T> => {
  return {
    get: (): Result<T | null, Error> => {
      return tryCatchSync(() => {
        const stored = localStorage.getItem(key);
        if (!stored) return null;
        
        const parsed = safeJsonParse<T>(stored, validator);
        if (parsed === null && stored) {
          logger.warn(`Failed to parse stored data for key: ${key}`);
        }
        return parsed;
      });
    },
    
    set: (value: T): Result<void, Error> => {
      return tryCatchSync(() => {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
        logger.debug(`Saved data for key: ${key}`);
      });
    },
    
    remove: (): Result<void, Error> => {
      return tryCatchSync(() => {
        localStorage.removeItem(key);
        logger.debug(`Removed data for key: ${key}`);
      });
    },
    
    exists: (): boolean => {
      return localStorage.getItem(key) !== null;
    },
  };
};

/**
 * Session storage service (for temporary data)
 */
export const createSessionStorageService = <T>(
  key: string,
  validator?: (value: unknown) => value is T
): StorageService<T> => {
  return {
    get: (): Result<T | null, Error> => {
      return tryCatchSync(() => {
        const stored = sessionStorage.getItem(key);
        if (!stored) return null;
        
        const parsed = safeJsonParse<T>(stored, validator);
        return parsed;
      });
    },
    
    set: (value: T): Result<void, Error> => {
      return tryCatchSync(() => {
        const serialized = JSON.stringify(value);
        sessionStorage.setItem(key, serialized);
      });
    },
    
    remove: (): Result<void, Error> => {
      return tryCatchSync(() => {
        sessionStorage.removeItem(key);
      });
    },
    
    exists: (): boolean => {
      return sessionStorage.getItem(key) !== null;
    },
  };
};

/**
 * Utility to safely get with fallback
 */
export const getWithFallback = <T>(service: StorageService<T>, fallback: T): T => {
  const result = service.get();
  if (result.success && result.data !== null) {
    return result.data;
  }
  return fallback;
};
