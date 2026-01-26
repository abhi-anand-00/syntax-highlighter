/**
 * Type Guards and Assertions
 * 
 * Runtime type checking utilities for safer data handling.
 */

/**
 * Checks if a value is defined (not null or undefined)
 */
export const isDefined = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

/**
 * Checks if a value is a non-empty string
 */
export const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Checks if a value is a non-empty array
 */
export const isNonEmptyArray = <T>(value: unknown): value is T[] => {
  return Array.isArray(value) && value.length > 0;
};

/**
 * Checks if a value is a plain object
 */
export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

/**
 * Checks if a value is a valid number (not NaN or Infinity)
 */
export const isValidNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/**
 * Asserts a condition and throws if false
 */
export function assert(condition: boolean, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message ?? 'Assertion failed');
  }
}

/**
 * Asserts a value is defined
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message?: string
): asserts value is T {
  if (!isDefined(value)) {
    throw new Error(message ?? 'Expected value to be defined');
  }
}

/**
 * Exhaustive check helper for switch statements
 */
export const exhaustiveCheck = (value: never, message?: string): never => {
  throw new Error(message ?? `Unhandled case: ${JSON.stringify(value)}`);
};

/**
 * Safe JSON parse with type checking
 */
export const safeJsonParse = <T>(
  json: string,
  validator?: (value: unknown) => value is T
): T | null => {
  try {
    const parsed = JSON.parse(json);
    if (validator) {
      return validator(parsed) ? parsed : null;
    }
    return parsed as T;
  } catch {
    return null;
  }
};

/**
 * Coerces a value to a string, with fallback
 */
export const toString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
};

/**
 * Coerces a value to a number, with fallback
 */
export const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && isValidNumber(value)) return value;
  const parsed = Number(value);
  return isValidNumber(parsed) ? parsed : fallback;
};
