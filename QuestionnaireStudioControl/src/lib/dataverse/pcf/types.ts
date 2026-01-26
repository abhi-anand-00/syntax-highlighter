/**
 * PCF Dataverse Wrapper Types
 * 
 * Core type definitions for the PCF-safe Dataverse wrapper layer.
 * These types are designed to work exclusively with ComponentFramework APIs.
 */

// ============================================================================
// PCF Context Types (Simplified interfaces for type safety)
// ============================================================================

/**
 * Simplified WebApi interface matching ComponentFramework.WebApi
 * Used for dependency injection and testing
 */
export interface IPCFWebApi {
  createRecord(entityType: string, data: Record<string, unknown>): Promise<EntityReference>;
  retrieveRecord(entityType: string, id: string, options?: string): Promise<Record<string, unknown>>;
  updateRecord(entityType: string, id: string, data: Record<string, unknown>): Promise<EntityReference>;
  deleteRecord(entityType: string, id: string): Promise<EntityReference>;
  retrieveMultipleRecords(
    entityType: string,
    options?: string,
    maxPageSize?: number
  ): Promise<RetrieveMultipleResponse>;
}

/**
 * Simplified Utility interface matching ComponentFramework.Utility
 */
export interface IPCFUtility {
  getEntityMetadata(entityName: string, attributes?: string[]): Promise<EntityMetadata>;
}

/**
 * Minimal PCF Context interface for service initialization
 */
export interface IPCFContext {
  webAPI: IPCFWebApi;
  utils: IPCFUtility;
}

/**
 * Flexible context type that accepts any object with webAPI and utils properties.
 * Use this for PCF control entry points where ComponentFramework.Context is passed.
 */
export type PCFContextLike = unknown;

/**
 * Normalize any PCF-like context to IPCFContext.
 * Safely extracts webAPI and utils from ComponentFramework.Context or similar objects.
 * 
 * @param context - The PCF context (ComponentFramework.Context<IInputs> or similar)
 * @returns Normalized IPCFContext or null if extraction fails
 */
export function normalizePCFContext(context: PCFContextLike): IPCFContext | null {
  if (!context || typeof context !== 'object') {
    return null;
  }
  
  const ctx = context as { webAPI?: unknown; utils?: unknown };
  
  if (ctx.webAPI && ctx.utils) {
    return {
      webAPI: ctx.webAPI as IPCFWebApi,
      utils: ctx.utils as IPCFUtility,
    };
  }
  
  return null;
}

// ============================================================================
// Entity Types
// ============================================================================

/**
 * Entity reference returned from CRUD operations
 */
export interface EntityReference {
  id: string;
  entityType: string;
  name?: string;
}

/**
 * Result from create operations
 */
export interface CreateResult {
  id: string;
  entityType: string;
}

/**
 * Response from retrieveMultipleRecords
 */
export interface RetrieveMultipleResponse<T = Record<string, unknown>> {
  entities: T[];
  nextLink?: string;
  fetchXmlPagingCookie?: string;
}

// ============================================================================
// Query Options
// ============================================================================

/**
 * OData query options
 */
export interface ODataOptions {
  /** Columns to select */
  select?: string[];
  /** OData filter expression */
  filter?: string;
  /** Order by clause */
  orderBy?: string;
  /** Maximum records to return */
  top?: number;
  /** Records to skip (paging) */
  skip?: number;
  /** Include total count */
  count?: boolean;
  /** Expand related entities */
  expand?: ExpandOption[];
}

/**
 * Expand option for related entities
 */
export interface ExpandOption {
  /** Navigation property name */
  property: string;
  /** Columns to select from related entity */
  select?: string[];
  /** Filter on related records */
  filter?: string;
  /** Order related records */
  orderBy?: string;
  /** Limit related records */
  top?: number;
}

/**
 * FetchXML query options
 */
export interface FetchXmlOptions {
  /** The FetchXML query string */
  fetchXml: string;
  /** Page number (1-based) */
  page?: number;
  /** Paging cookie from previous query */
  pagingCookie?: string;
  /** Records per page */
  count?: number;
}

// ============================================================================
// Query Results
// ============================================================================

/**
 * Result from query operations
 */
export interface QueryResult<T> {
  entities: T[];
  totalCount?: number;
  moreRecords: boolean;
  nextLink?: string;
  pagingCookie?: string;
}

// ============================================================================
// Metadata Types
// ============================================================================

/**
 * Entity metadata
 */
export interface EntityMetadata {
  LogicalName: string;
  EntitySetName: string;
  PrimaryIdAttribute: string;
  PrimaryNameAttribute: string;
  DisplayName: string;
  Attributes?: AttributeMetadata[];
}

/**
 * Attribute metadata
 */
export interface AttributeMetadata {
  LogicalName: string;
  DisplayName: string;
  AttributeType: string;
  IsPrimaryId: boolean;
  IsPrimaryName: boolean;
  RequiredLevel: string;
  MaxLength?: number;
  MinValue?: number;
  MaxValue?: number;
  Precision?: number;
  Targets?: string[];
  OptionSet?: OptionMetadata[];
}

/**
 * Option metadata for choice fields
 */
export interface OptionMetadata {
  Value: number;
  Label: string;
  Color?: string;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Semantic error codes for Dataverse operations
 */
export type DataverseErrorCode =
  | 'NOT_FOUND'
  | 'ACCESS_DENIED'
  | 'DUPLICATE_RECORD'
  | 'INVALID_REFERENCE'
  | 'VALIDATION_ERROR'
  | 'CONCURRENCY_ERROR'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'INVALID_ARGUMENT'
  | 'UNKNOWN';

/**
 * Normalized error structure
 */
export interface NormalizedError {
  /** Semantic error code */
  code: DataverseErrorCode;
  /** Technical message for developers */
  message: string;
  /** User-friendly message for display */
  userMessage: string;
  /** Whether the operation can be retried */
  isRetryable: boolean;
  /** Original raw error for debugging */
  originalError?: unknown;
  /** Additional context */
  details?: Record<string, unknown>;
}

// ============================================================================
// Result Pattern
// ============================================================================

/**
 * Success result
 */
export interface SuccessResult<T> {
  readonly success: true;
  readonly data: T;
  readonly error?: never;
}

/**
 * Failure result
 */
export interface FailureResult {
  readonly success: false;
  readonly data?: never;
  readonly error: NormalizedError;
}

/**
 * Discriminated union for operation results
 */
export type DataverseResult<T> = SuccessResult<T> | FailureResult;

// ============================================================================
// Operation Types
// ============================================================================

/**
 * Types of Dataverse operations (for logging/error context)
 */
export type OperationType =
  | 'create'
  | 'retrieve'
  | 'update'
  | 'delete'
  | 'retrieveMultiple'
  | 'metadata';

/**
 * Update operation options
 */
export interface UpdateOptions {
  /** Concurrency behavior */
  concurrencyBehavior?: 'AlwaysOverwrite' | 'IfRowVersionMatches';
  /** ETag for optimistic concurrency */
  eTag?: string;
}

/**
 * Options for retrieving all records
 */
export interface RetrieveAllOptions extends ODataOptions {
  /** Maximum records to retrieve (safety limit) */
  maxRecords?: number;
  /** Progress callback */
  onProgress?: (loaded: number, total?: number) => void;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}
