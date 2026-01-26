/**
 * Result Type for Predictable Error Handling
 * 
 * Implements the Result pattern (similar to Rust's Result or functional Either)
 * to provide explicit error handling without exceptions.
 */

/**
 * Represents a successful result
 */
export interface Success<T> {
  readonly success: true;
  readonly data: T;
  readonly error?: never;
}

/**
 * Represents a failed result
 */
export interface Failure<E = Error> {
  readonly success: false;
  readonly data?: never;
  readonly error: E;
}

/**
 * Result type - either Success or Failure
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Creates a successful result
 */
export const success = <T>(data: T): Success<T> => ({
  success: true,
  data,
});

/**
 * Creates a failed result
 */
export const failure = <E = Error>(error: E): Failure<E> => ({
  success: false,
  error,
});

/**
 * Type guard to check if a result is successful
 */
export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T> => {
  return result.success === true;
};

/**
 * Type guard to check if a result is a failure
 */
export const isFailure = <T, E>(result: Result<T, E>): result is Failure<E> => {
  return result.success === false;
};

/**
 * Unwraps a result, returning the data or throwing the error
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (isSuccess(result)) {
    return result.data;
  }
  throw result.error;
};

/**
 * Unwraps a result, returning the data or a default value
 */
export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  if (isSuccess(result)) {
    return result.data;
  }
  return defaultValue;
};

/**
 * Maps a successful result to a new value
 */
export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> => {
  if (isSuccess(result)) {
    return success(fn(result.data));
  }
  return result;
};

/**
 * Chains result operations (flatMap)
 */
export const flatMap = <T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> => {
  if (isSuccess(result)) {
    return fn(result.data);
  }
  return result;
};

/**
 * Wraps an async function to return a Result instead of throwing
 */
export const tryCatch = async <T>(
  fn: () => Promise<T>
): Promise<Result<T, Error>> => {
  try {
    const data = await fn();
    return success(data);
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)));
  }
};

/**
 * Wraps a sync function to return a Result instead of throwing
 */
export const tryCatchSync = <T>(fn: () => T): Result<T, Error> => {
  try {
    const data = fn();
    return success(data);
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)));
  }
};
