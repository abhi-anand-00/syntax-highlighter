/**
 * PCF Error Handler
 * 
 * Normalizes Dataverse errors into consistent, typed error objects.
 * Provides user-friendly messages and identifies retryable errors.
 * 
 * Features:
 * - Maps Dataverse hex error codes to semantic codes
 * - Provides localized user-friendly messages
 * - Identifies transient (retryable) errors
 * - Preserves original error for debugging
 */

import type { DataverseErrorCode, NormalizedError, OperationType } from './types';
import { createLogger, type ILogger } from './Logger';

// ============================================================================
// Types
// ============================================================================

export interface IErrorHandler {
  normalize(error: unknown, operation?: OperationType, entityType?: string, recordId?: string): NormalizedError;
  getUserMessage(error: unknown, fallback?: string): string;
  getErrorCode(error: unknown): DataverseErrorCode;
  isRetryable(error: unknown): boolean;
  isNotFound(error: unknown): boolean;
  isAccessDenied(error: unknown): boolean;
  isDuplicate(error: unknown): boolean;
  toLogFormat(error: unknown): Record<string, unknown>;
}

// ============================================================================
// Error Code Mapping
// ============================================================================

/**
 * Dataverse error code to semantic code mapping
 * Codes are in hex format (e.g., 0x80040217)
 */
const ERROR_CODE_MAP: Record<string, DataverseErrorCode> = {
  // Not Found errors
  '0x80040217': 'NOT_FOUND',           // ObjectDoesNotExist
  '0x80048d19': 'NOT_FOUND',           // EntityDoesNotExist
  '0x80040501': 'NOT_FOUND',           // RecordNotFound
  '-2147220969': 'NOT_FOUND',          // ObjectDoesNotExist (decimal)
  
  // Access Denied errors
  '0x80040220': 'ACCESS_DENIED',       // PrivilegeCreateIsDisabled
  '0x80040221': 'ACCESS_DENIED',       // PrivilegeReadIsDisabled
  '0x80048306': 'ACCESS_DENIED',       // SecLib Access Denied
  '0x8004f504': 'ACCESS_DENIED',       // User does not have permission
  '-2147220448': 'ACCESS_DENIED',      // PrivilegeCreateIsDisabled (decimal)
  
  // Duplicate Record errors
  '0x80040333': 'DUPLICATE_RECORD',    // DuplicateRecord
  '0x80040237': 'DUPLICATE_RECORD',    // DuplicateDetected
  '-2147220685': 'DUPLICATE_RECORD',   // DuplicateRecord (decimal)
  
  // Invalid Reference errors
  '0x8004431a': 'INVALID_REFERENCE',   // InvalidLookupReference
  '0x80040225': 'INVALID_REFERENCE',   // ReferentialIntegrityViolation
  '-2147204838': 'INVALID_REFERENCE',  // InvalidLookupReference (decimal)
  
  // Validation errors
  '0x80040203': 'VALIDATION_ERROR',    // InvalidArgument
  '0x8004000f': 'VALIDATION_ERROR',    // RequiredFieldMissing
  '0x80044150': 'VALIDATION_ERROR',    // PicklistValueOutOfRange
  '0x8004f003': 'VALIDATION_ERROR',    // InvalidData
  '-2147220989': 'VALIDATION_ERROR',   // InvalidArgument (decimal)
  
  // Concurrency errors
  '0x80060882': 'CONCURRENCY_ERROR',   // ConcurrencyVersionMismatch
  '0x80060892': 'CONCURRENCY_ERROR',   // OptimisticConcurrencyEnabled
  
  // Timeout errors
  '-2147220891': 'TIMEOUT',            // SqlTimeout
  '0x80044178': 'TIMEOUT',             // RequestTimeout
  
  // Rate limiting
  '0x8005f103': 'RATE_LIMITED',        // TooManyRequests
  '429': 'RATE_LIMITED',               // HTTP 429
};

/**
 * User-friendly messages for each error code
 */
const USER_MESSAGES: Record<DataverseErrorCode, string> = {
  NOT_FOUND: 'The record you requested could not be found. It may have been deleted.',
  ACCESS_DENIED: 'You do not have permission to perform this action.',
  DUPLICATE_RECORD: 'A record with this information already exists.',
  INVALID_REFERENCE: 'The referenced record is invalid or no longer exists.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  CONCURRENCY_ERROR: 'This record was modified by another user. Please refresh and try again.',
  TIMEOUT: 'The request took too long. Please try again.',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  NETWORK_ERROR: 'A network error occurred. Please check your connection.',
  INVALID_ARGUMENT: 'Invalid input provided.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
};

/**
 * Retryable error codes (transient failures)
 */
const RETRYABLE_CODES = new Set<DataverseErrorCode>([
  'TIMEOUT',
  'RATE_LIMITED',
  'NETWORK_ERROR',
  'CONCURRENCY_ERROR',
]);

// ============================================================================
// Error Handler Implementation
// ============================================================================

class PCFErrorHandler implements IErrorHandler {
  private _logger: ILogger;

  constructor(logger?: ILogger) {
    this._logger = logger ?? createLogger('ErrorHandler');
  }

  /**
   * Extract error code from various error formats
   */
  private extractErrorCode(error: unknown): string | null {
    if (!error) return null;

    // Check for error object with code property
    if (typeof error === 'object') {
      const err = error as Record<string, unknown>;
      
      // Direct code property
      if ('code' in err && err.code) {
        return String(err.code);
      }
      
      // Nested error structure (Dataverse format)
      if ('error' in err && typeof err.error === 'object' && err.error) {
        const innerError = err.error as Record<string, unknown>;
        if ('code' in innerError) {
          return String(innerError.code);
        }
      }
      
      // OData error format
      if ('innererror' in err && typeof err.innererror === 'object' && err.innererror) {
        const innerError = err.innererror as Record<string, unknown>;
        if ('code' in innerError) {
          return String(innerError.code);
        }
      }
      
      // HTTP status code
      if ('status' in err && typeof err.status === 'number') {
        return String(err.status);
      }
    }
    
    return null;
  }

  /**
   * Extract error message from various error formats
   */
  private extractMessage(error: unknown): string {
    if (!error) return 'Unknown error';
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    if (typeof error === 'object') {
      const err = error as Record<string, unknown>;
      
      // Message property
      if ('message' in err && typeof err.message === 'string') {
        return err.message;
      }
      
      // Nested error message
      if ('error' in err && typeof err.error === 'object' && err.error) {
        const innerError = err.error as Record<string, unknown>;
        if ('message' in innerError && typeof innerError.message === 'string') {
          return innerError.message;
        }
      }
      
      // Description property
      if ('description' in err && typeof err.description === 'string') {
        return err.description;
      }
    }
    
    return 'Unknown error';
  }

  /**
   * Map raw error code to semantic code
   */
  private mapToSemanticCode(rawCode: string | null, error: unknown): DataverseErrorCode {
    if (!rawCode) {
      // Check for network-related errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return 'NETWORK_ERROR';
      }
      return 'UNKNOWN';
    }
    
    // Direct mapping
    if (rawCode in ERROR_CODE_MAP) {
      return ERROR_CODE_MAP[rawCode];
    }
    
    // Try lowercase
    const lowerCode = rawCode.toLowerCase();
    if (lowerCode in ERROR_CODE_MAP) {
      return ERROR_CODE_MAP[lowerCode];
    }
    
    // Check message content for hints
    const message = this.extractMessage(error).toLowerCase();
    
    if (message.includes('not found') || message.includes('does not exist')) {
      return 'NOT_FOUND';
    }
    if (message.includes('permission') || message.includes('access denied') || message.includes('privilege')) {
      return 'ACCESS_DENIED';
    }
    if (message.includes('duplicate')) {
      return 'DUPLICATE_RECORD';
    }
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'TIMEOUT';
    }
    if (message.includes('network') || message.includes('connection')) {
      return 'NETWORK_ERROR';
    }
    
    return 'UNKNOWN';
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Normalize any error to a structured NormalizedError
   */
  normalize(
    error: unknown,
    operation?: OperationType,
    entityType?: string,
    recordId?: string
  ): NormalizedError {
    const rawCode = this.extractErrorCode(error);
    const code = this.mapToSemanticCode(rawCode, error);
    const message = this.extractMessage(error);
    const userMessage = USER_MESSAGES[code];
    const isRetryable = RETRYABLE_CODES.has(code);

    const normalized: NormalizedError = {
      code,
      message,
      userMessage,
      isRetryable,
      originalError: error,
      details: {
        operation,
        entityType,
        recordId,
        rawCode,
      },
    };

    // Log the error
    this._logger.error('Dataverse operation failed', {
      code,
      message,
      operation,
      entityType,
      recordId,
      rawCode,
    });

    return normalized;
  }

  /**
   * Get user-friendly message for display
   */
  getUserMessage(error: unknown, fallback?: string): string {
    const code = this.getErrorCode(error);
    return USER_MESSAGES[code] ?? fallback ?? USER_MESSAGES.UNKNOWN;
  }

  /**
   * Get semantic error code
   */
  getErrorCode(error: unknown): DataverseErrorCode {
    const rawCode = this.extractErrorCode(error);
    return this.mapToSemanticCode(rawCode, error);
  }

  /**
   * Check if error is retryable (transient)
   */
  isRetryable(error: unknown): boolean {
    const code = this.getErrorCode(error);
    return RETRYABLE_CODES.has(code);
  }

  /**
   * Check if error is NOT_FOUND
   */
  isNotFound(error: unknown): boolean {
    return this.getErrorCode(error) === 'NOT_FOUND';
  }

  /**
   * Check if error is ACCESS_DENIED
   */
  isAccessDenied(error: unknown): boolean {
    return this.getErrorCode(error) === 'ACCESS_DENIED';
  }

  /**
   * Check if error is DUPLICATE_RECORD
   */
  isDuplicate(error: unknown): boolean {
    return this.getErrorCode(error) === 'DUPLICATE_RECORD';
  }

  /**
   * Format error for structured logging
   */
  toLogFormat(error: unknown): Record<string, unknown> {
    const code = this.getErrorCode(error);
    const message = this.extractMessage(error);
    const rawCode = this.extractErrorCode(error);
    
    return {
      code,
      rawCode,
      message,
      isRetryable: this.isRetryable(error),
      stack: error instanceof Error ? error.stack : undefined,
      raw: error,
    };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Retry options for transient error handling
 */
export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: unknown, delay: number) => void;
}

const DEFAULT_RETRY_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Execute an operation with automatic retry on transient errors
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const handler = getErrorHandler();
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry if not retryable or last attempt
      if (!handler.isRetryable(error) || attempt === opts.maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.baseDelayMs * Math.pow(opts.backoffMultiplier, attempt),
        opts.maxDelayMs
      );
      
      // Notify caller of retry
      opts.onRetry?.(attempt + 1, error, delay);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Result type for safe operations
 */
export type SafeResult<T> = 
  | { success: true; data: T }
  | { success: false; error: NormalizedError };

/**
 * Execute an operation safely, returning a Result instead of throwing
 */
export async function withSafeExecution<T>(
  operation: () => Promise<T>,
  context?: {
    operation?: OperationType;
    entityType?: string;
    recordId?: string;
  }
): Promise<SafeResult<T>> {
  const handler = getErrorHandler();
  
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const normalized = handler.normalize(
      error,
      context?.operation,
      context?.entityType,
      context?.recordId
    );
    return { success: false, error: normalized };
  }
}

/**
 * Combine retry and safe execution
 */
export async function withSafeRetry<T>(
  operation: () => Promise<T>,
  options?: RetryOptions & {
    operation?: OperationType;
    entityType?: string;
    recordId?: string;
  }
): Promise<SafeResult<T>> {
  return withSafeExecution(
    () => withRetry(operation, options),
    {
      operation: options?.operation,
      entityType: options?.entityType,
      recordId: options?.recordId,
    }
  );
}

/**
 * Handle error with custom handlers for each error type
 */
export interface ErrorHandlers<T> {
  onNotFound?: () => T;
  onAccessDenied?: () => T;
  onDuplicate?: () => T;
  onValidation?: (message: string) => T;
  onConcurrency?: () => T;
  onTimeout?: () => T;
  onRateLimited?: () => T;
  onNetwork?: () => T;
  onUnknown?: (error: NormalizedError) => T;
}

export function handleError<T>(
  error: unknown,
  handlers: ErrorHandlers<T>,
  defaultValue: T
): T {
  const handler = getErrorHandler();
  const code = handler.getErrorCode(error);
  const normalized = handler.normalize(error);
  
  switch (code) {
    case 'NOT_FOUND':
      return handlers.onNotFound?.() ?? defaultValue;
    case 'ACCESS_DENIED':
      return handlers.onAccessDenied?.() ?? defaultValue;
    case 'DUPLICATE_RECORD':
      return handlers.onDuplicate?.() ?? defaultValue;
    case 'VALIDATION_ERROR':
    case 'INVALID_ARGUMENT':
      return handlers.onValidation?.(normalized.message) ?? defaultValue;
    case 'CONCURRENCY_ERROR':
      return handlers.onConcurrency?.() ?? defaultValue;
    case 'TIMEOUT':
      return handlers.onTimeout?.() ?? defaultValue;
    case 'RATE_LIMITED':
      return handlers.onRateLimited?.() ?? defaultValue;
    case 'NETWORK_ERROR':
      return handlers.onNetwork?.() ?? defaultValue;
    default:
      return handlers.onUnknown?.(normalized) ?? defaultValue;
  }
}

// ============================================================================
// Factory & Singleton
// ============================================================================

let defaultHandler: IErrorHandler | null = null;

/**
 * Create a new error handler instance
 */
export function createErrorHandler(logger?: ILogger): IErrorHandler {
  return new PCFErrorHandler(logger);
}

/**
 * Get or create the default error handler instance
 */
export function getErrorHandler(): IErrorHandler {
  if (!defaultHandler) {
    defaultHandler = new PCFErrorHandler();
  }
  return defaultHandler;
}

// Export default instance
export const errorHandler = getErrorHandler();
