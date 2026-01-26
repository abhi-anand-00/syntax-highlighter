/**
 * Base Dataverse Service
 * 
 * Abstract foundation class for PCF Dataverse operations.
 * Centralizes context.webAPI access and provides common patterns.
 * 
 * Features:
 * - Type-safe context management
 * - Protected execute() method with error handling
 * - OData query string building
 * - Entity metadata caching
 * - Context update support for PCF lifecycle
 */

import type {
  IPCFContext,
  IPCFWebApi,
  IPCFUtility,
  ODataOptions,
  ExpandOption,
  EntityMetadata,
  DataverseResult,
  NormalizedError,
  OperationType,
} from './types';
import { createLogger, type ILogger } from './Logger';
import { createErrorHandler, type IErrorHandler } from './ErrorHandler';

// ============================================================================
// Types
// ============================================================================

export interface BaseServiceConfig {
  /** Enable metadata caching */
  enableMetadataCache?: boolean;
  /** Custom logger instance */
  logger?: ILogger;
  /** Custom error handler instance */
  errorHandler?: IErrorHandler;
}

// ============================================================================
// Metadata Cache
// ============================================================================

/**
 * Simple in-memory cache for entity metadata
 */
class MetadataCache {
  private _cache = new Map<string, EntityMetadata>();
  private _timestamps = new Map<string, number>();
  private _ttlMs: number = 5 * 60 * 1000; // 5 minutes default

  get(entityName: string): EntityMetadata | undefined {
    const timestamp = this._timestamps.get(entityName);
    if (timestamp && Date.now() - timestamp > this._ttlMs) {
      this._cache.delete(entityName);
      this._timestamps.delete(entityName);
      return undefined;
    }
    return this._cache.get(entityName);
  }

  set(entityName: string, metadata: EntityMetadata): void {
    this._cache.set(entityName, metadata);
    this._timestamps.set(entityName, Date.now());
  }

  delete(entityName: string): void {
    this._cache.delete(entityName);
    this._timestamps.delete(entityName);
  }

  clear(): void {
    this._cache.clear();
    this._timestamps.clear();
  }

  setTTL(ttlMs: number): void {
    this._ttlMs = ttlMs;
  }
}

// Global metadata cache (shared across service instances)
const metadataCache = new MetadataCache();

// ============================================================================
// Base Service Implementation
// ============================================================================

export abstract class BaseDataverseService {
  private _context: IPCFContext;
  private _enableMetadataCache: boolean;
  protected readonly _logger: ILogger;
  protected readonly _errorHandler: IErrorHandler;

  /**
   * Create a new service instance.
   * @param context - PCF context (IPCFContext or ComponentFramework.Context)
   * @param config - Optional configuration
   */
  constructor(context: IPCFContext | unknown, config?: BaseServiceConfig) {
    // Normalize context if needed
    if (context && typeof context === 'object' && 'webAPI' in context && 'utils' in context) {
      this._context = context as IPCFContext;
    } else {
      throw new Error('Invalid context: must have webAPI and utils properties');
    }
    this._enableMetadataCache = config?.enableMetadataCache ?? true;
    this._logger = config?.logger ?? createLogger(this.constructor.name);
    this._errorHandler = config?.errorHandler ?? createErrorHandler();
  }

  // ============================================================================
  // Protected Accessors
  // ============================================================================

  /**
   * Access to the WebApi interface
   * @protected
   */
  protected get webApi(): IPCFWebApi {
    return this._context.webAPI;
  }

  /**
   * Access to the Utility interface
   * @protected
   */
  protected get utility(): IPCFUtility {
    return this._context.utils;
  }

  // ============================================================================
  // Context Management
  // ============================================================================

  /**
   * Update the context (called from PCF updateView)
   * @param context - PCF context (IPCFContext or ComponentFramework.Context)
   */
  updateContext(context: IPCFContext | unknown): void {
    if (context && typeof context === 'object' && 'webAPI' in context && 'utils' in context) {
      this._context = context as IPCFContext;
      this._logger.debug('Context updated');
    } else {
      this._logger.warn('Invalid context passed to updateContext');
    }
  }

  // ============================================================================
  // Protected Execute Method
  // ============================================================================

  /**
   * Execute a Dataverse operation with standardized error handling
   * 
   * @param operation - Type of operation for logging
   * @param entityType - Entity logical name
   * @param fn - Async function to execute
   * @param recordId - Optional record ID for context
   * @returns DataverseResult with success/failure
   */
  protected async execute<T>(
    operation: OperationType,
    entityType: string,
    fn: () => Promise<T>,
    recordId?: string
  ): Promise<DataverseResult<T>> {
    const startTime = Date.now();
    
    this._logger.debug(`Starting ${operation}`, {
      entityType,
      recordId,
    });

    try {
      const data = await fn();
      const duration = Date.now() - startTime;
      
      this._logger.info(`${operation} completed`, {
        entityType,
        recordId,
        duration,
      });

      return {
        success: true,
        data,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const normalized = this._errorHandler.normalize(error, operation, entityType, recordId);
      
      this._logger.error(`${operation} failed`, {
        entityType,
        recordId,
        duration,
        error: this._errorHandler.toLogFormat(error),
      });

      return {
        success: false,
        error: normalized,
      };
    }
  }

  /**
   * Create a success result
   */
  protected success<T>(data: T): DataverseResult<T> {
    return { success: true, data };
  }

  /**
   * Create a failure result
   */
  protected failure(error: NormalizedError): DataverseResult<never> {
    return { success: false, error };
  }

  // ============================================================================
  // OData Query Building
  // ============================================================================

  /**
   * Build OData query string from options
   */
  protected buildQueryString(options?: ODataOptions): string {
    if (!options) return '';

    const parts: string[] = [];

    // $select
    if (options.select && options.select.length > 0) {
      parts.push(`$select=${options.select.join(',')}`);
    }

    // $filter
    if (options.filter) {
      parts.push(`$filter=${options.filter}`);
    }

    // $orderby
    if (options.orderBy) {
      parts.push(`$orderby=${options.orderBy}`);
    }

    // $top
    if (options.top !== undefined) {
      parts.push(`$top=${options.top}`);
    }

    // $skip
    if (options.skip !== undefined) {
      parts.push(`$skip=${options.skip}`);
    }

    // $count
    if (options.count) {
      parts.push('$count=true');
    }

    // $expand
    if (options.expand && options.expand.length > 0) {
      const expandClauses = options.expand.map(e => this.buildExpandClause(e));
      parts.push(`$expand=${expandClauses.join(',')}`);
    }

    return parts.length > 0 ? `?${parts.join('&')}` : '';
  }

  /**
   * Build a single $expand clause
   */
  protected buildExpandClause(expand: ExpandOption): string {
    const nested: string[] = [];

    if (expand.select && expand.select.length > 0) {
      nested.push(`$select=${expand.select.join(',')}`);
    }

    if (expand.filter) {
      nested.push(`$filter=${expand.filter}`);
    }

    if (expand.orderBy) {
      nested.push(`$orderby=${expand.orderBy}`);
    }

    if (expand.top !== undefined) {
      nested.push(`$top=${expand.top}`);
    }

    if (nested.length > 0) {
      return `${expand.property}(${nested.join(';')})`;
    }

    return expand.property;
  }

  // ============================================================================
  // Metadata Operations
  // ============================================================================

  /**
   * Get entity metadata (cached if enabled)
   */
  protected async getEntityMetadata(
    entityName: string,
    forceRefresh = false
  ): Promise<DataverseResult<EntityMetadata>> {
    // Check cache first
    if (this._enableMetadataCache && !forceRefresh) {
      const cached = metadataCache.get(entityName);
      if (cached) {
        this._logger.debug('Metadata cache hit', { entityName });
        return this.success(cached);
      }
    }

    // Fetch from Dataverse
    return this.execute<EntityMetadata>(
      'metadata',
      entityName,
      async () => {
        const metadata = await this.utility.getEntityMetadata(entityName);
        
        // Cache the result
        if (this._enableMetadataCache) {
          metadataCache.set(entityName, metadata);
        }
        
        return metadata;
      }
    );
  }

  /**
   * Clear metadata cache
   */
  clearMetadataCache(entityName?: string): void {
    if (entityName) {
      metadataCache.delete(entityName);
      this._logger.debug('Metadata cache cleared for entity', { entityName });
    } else {
      metadataCache.clear();
      this._logger.debug('Metadata cache cleared');
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Format a GUID for OData (remove braces if present)
   */
  protected formatGuid(id: string): string {
    return id.replace(/[{}]/g, '');
  }

  /**
   * Format a lookup value for create/update operations
   * Returns the OData bind format: /entitysetname(id)
   */
  protected formatLookupBind(entitySetName: string, targetId: string): string {
    return `/${entitySetName}(${this.formatGuid(targetId)})`;
  }

  /**
   * Set a lookup field on a data object using @odata.bind
   */
  protected setLookupField<T extends Record<string, unknown>>(
    data: T,
    lookupAttribute: string,
    entitySetName: string,
    targetId: string | null
  ): T {
    const bindKey = `${lookupAttribute}@odata.bind`;
    
    if (targetId === null) {
      // Clear the lookup
      return {
        ...data,
        [lookupAttribute]: null,
      };
    }
    
    return {
      ...data,
      [bindKey]: this.formatLookupBind(entitySetName, targetId),
    };
  }

  /**
   * Clear a lookup field on a data object
   */
  protected clearLookupField<T extends Record<string, unknown>>(
    data: T,
    lookupAttribute: string
  ): T {
    return {
      ...data,
      [lookupAttribute]: null,
    };
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a configured base service instance
 * Note: BaseDataverseService is abstract, this is for extension
 */
export function createBaseServiceConfig(
  loggerContext?: string,
  options?: Partial<BaseServiceConfig>
): BaseServiceConfig {
  return {
    enableMetadataCache: options?.enableMetadataCache ?? true,
    logger: loggerContext ? createLogger(loggerContext) : options?.logger,
    errorHandler: options?.errorHandler,
  };
}
