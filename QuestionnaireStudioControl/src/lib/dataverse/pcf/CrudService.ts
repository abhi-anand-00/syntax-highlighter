/**
 * Generic CRUD Service for PCF
 * 
 * Type-safe CRUD operations for any Dataverse entity.
 * Extends BaseDataverseService to leverage centralized error handling and logging.
 * 
 * Features:
 * - Fully typed create, retrieve, update, delete operations
 * - No hardcoded entity names (configured at instantiation)
 * - Upsert support (create or update)
 * - Lookup field helpers with @odata.bind
 * - Existence checking
 * - Optional column selection
 */

import { BaseDataverseService, type BaseServiceConfig } from './BaseDataverseService';
import { createLogger } from './Logger';
import type {
  IPCFContext,
  ODataOptions,
  DataverseResult,
  EntityReference,
  CreateResult,
  UpdateOptions,
} from './types';

// ============================================================================
// Types
// ============================================================================

/**
 * Base constraint for entity records.
 * Type alias for records that can have any properties.
 */
export type EntityRecord = Record<string, unknown>;

/**
 * Configuration for CrudService
 */
export interface CrudServiceConfig extends BaseServiceConfig {
  /** Entity logical name (e.g., 'account', 'contact') */
  entityLogicalName: string;
  /** Entity set name for OData (e.g., 'accounts', 'contacts') - auto-derived if not provided */
  entitySetName?: string;
  /** Primary ID attribute name (default: entitylogicalname + 'id') */
  primaryIdAttribute?: string;
}

/**
 * Result from upsert operations
 */
export interface UpsertResult {
  id: string;
  entityType: string;
  wasCreated: boolean;
}

// ============================================================================
// Entity Set Name Derivation
// ============================================================================

/**
 * Derive entity set name from logical name using common Dataverse patterns
 */
function deriveEntitySetName(logicalName: string): string {
  // Common irregular plurals in Dataverse
  const irregularPlurals: Record<string, string> = {
    'opportunity': 'opportunities',
    'territory': 'territories',
    'category': 'categories',
    'currency': 'currencies',
    'entity': 'entities',
    'activity': 'activities',
    'company': 'companies',
    'party': 'parties',
  };

  // Check for irregular plurals
  for (const [singular, plural] of Object.entries(irregularPlurals)) {
    if (logicalName.endsWith(singular)) {
      return logicalName.slice(0, -singular.length) + plural;
    }
  }

  // Standard pluralization rules
  if (logicalName.endsWith('s') || logicalName.endsWith('x') || 
      logicalName.endsWith('ch') || logicalName.endsWith('sh')) {
    return logicalName + 'es';
  }
  
  if (logicalName.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(logicalName.charAt(logicalName.length - 2))) {
    return logicalName.slice(0, -1) + 'ies';
  }

  return logicalName + 's';
}

// ============================================================================
// CRUD Service Implementation
// ============================================================================

export class CrudService<T extends EntityRecord> extends BaseDataverseService {
  /** Entity logical name */
  readonly entityLogicalName: string;
  
  /** Entity set name for OData */
  readonly entitySetName: string;
  
  /** Primary ID attribute */
  readonly primaryIdAttribute: string;

  constructor(context: IPCFContext | unknown, config: CrudServiceConfig) {
    super(context, {
      ...config,
      logger: config.logger ?? createLogger(`CrudService:${config.entityLogicalName}`),
    });

    this.entityLogicalName = config.entityLogicalName;
    this.entitySetName = config.entitySetName ?? deriveEntitySetName(config.entityLogicalName);
    this.primaryIdAttribute = config.primaryIdAttribute ?? `${config.entityLogicalName}id`;
  }

  // ============================================================================
  // CREATE
  // ============================================================================

  /**
   * Create a new record
   * 
   * @param data - Record data to create
   * @returns Result with created record ID
   * 
   * @example
   * ```typescript
   * const result = await accountService.create({
   *   name: 'Contoso Ltd',
   *   telephone1: '555-1234'
   * });
   * if (result.success) {
   *   console.log('Created account:', result.data.id);
   * }
   * ```
   */
  async create(data: Partial<T>): Promise<DataverseResult<CreateResult>> {
    return this.execute<CreateResult>(
      'create',
      this.entityLogicalName,
      async () => {
        const response = await this.webApi.createRecord(
          this.entityLogicalName,
          data as Record<string, unknown>
        );
        
        return {
          id: response.id,
          entityType: response.entityType,
        };
      }
    );
  }

  // ============================================================================
  // RETRIEVE
  // ============================================================================

  /**
   * Retrieve a single record by ID
   * 
   * @param id - Record GUID
   * @param options - OData query options (select, expand)
   * @returns Result with record data
   * 
   * @example
   * ```typescript
   * const result = await accountService.retrieve(accountId, {
   *   select: ['name', 'telephone1', 'accountnumber']
   * });
   * if (result.success) {
   *   console.log('Account name:', result.data.name);
   * }
   * ```
   */
  async retrieve(id: string, options?: ODataOptions): Promise<DataverseResult<T>> {
    const queryString = this.buildQueryString(options);
    
    return this.execute<T>(
      'retrieve',
      this.entityLogicalName,
      async () => {
        const record = await this.webApi.retrieveRecord(
          this.entityLogicalName,
          this.formatGuid(id),
          queryString || undefined
        );
        return record as T;
      },
      id
    );
  }

  /**
   * Retrieve a single record by ID, returning null if not found
   * 
   * @param id - Record GUID
   * @param options - OData query options
   * @returns Result with record data or null
   */
  async retrieveOrNull(id: string, options?: ODataOptions): Promise<DataverseResult<T | null>> {
    const result = await this.retrieve(id, options);
    
    if (result.success) {
      return result;
    }
    
    // Return null instead of error for NOT_FOUND
    if (result.error.code === 'NOT_FOUND') {
      return this.success(null);
    }
    
    // Re-return other errors
    return result;
  }

  // ============================================================================
  // UPDATE
  // ============================================================================

  /**
   * Update an existing record
   * 
   * @param id - Record GUID
   * @param data - Fields to update
   * @param options - Update options (concurrency)
   * @returns Result with entity reference
   * 
   * @example
   * ```typescript
   * const result = await accountService.update(accountId, {
   *   telephone1: '555-5678',
   *   description: 'Updated description'
   * });
   * if (result.success) {
   *   console.log('Account updated');
   * }
   * ```
   */
  async update(
    id: string,
    data: Partial<T>,
    _options?: UpdateOptions
  ): Promise<DataverseResult<EntityReference>> {
    return this.execute<EntityReference>(
      'update',
      this.entityLogicalName,
      async () => {
        const response = await this.webApi.updateRecord(
          this.entityLogicalName,
          this.formatGuid(id),
          data as Record<string, unknown>
        );
        return response;
      },
      id
    );
  }

  // ============================================================================
  // DELETE
  // ============================================================================

  /**
   * Delete a record by ID
   * 
   * @param id - Record GUID
   * @returns Result indicating success
   * 
   * @example
   * ```typescript
   * const result = await accountService.delete(accountId);
   * if (result.success) {
   *   console.log('Account deleted');
   * }
   * ```
   */
  async delete(id: string): Promise<DataverseResult<void>> {
    return this.execute<void>(
      'delete',
      this.entityLogicalName,
      async () => {
        await this.webApi.deleteRecord(
          this.entityLogicalName,
          this.formatGuid(id)
        );
      },
      id
    );
  }

  // ============================================================================
  // UPSERT
  // ============================================================================

  /**
   * Create or update a record based on whether ID is provided
   * 
   * @param id - Record GUID (undefined for create)
   * @param data - Record data
   * @returns Result with ID and whether record was created
   * 
   * @example
   * ```typescript
   * // Create new
   * const createResult = await accountService.upsert(undefined, { name: 'New Account' });
   * 
   * // Update existing
   * const updateResult = await accountService.upsert(existingId, { name: 'Updated Name' });
   * ```
   */
  async upsert(
    id: string | undefined,
    data: Partial<T>
  ): Promise<DataverseResult<UpsertResult>> {
    if (!id) {
      // Create new record
      const createResult = await this.create(data);
      if (!createResult.success) {
        return { success: false, error: createResult.error };
      }
      return this.success({
        id: createResult.data.id,
        entityType: createResult.data.entityType,
        wasCreated: true,
      });
    }

    // Update existing record
    const updateResult = await this.update(id, data);
    if (!updateResult.success) {
      return { success: false, error: updateResult.error };
    }
    return this.success({
      id: updateResult.data.id,
      entityType: updateResult.data.entityType,
      wasCreated: false,
    });
  }

  // ============================================================================
  // EXISTENCE CHECK
  // ============================================================================

  /**
   * Check if a record exists
   * 
   * @param id - Record GUID
   * @returns Result with boolean
   */
  async exists(id: string): Promise<DataverseResult<boolean>> {
    const result = await this.retrieve(id, {
      select: [this.primaryIdAttribute],
    });

    if (result.success) {
      return this.success(true);
    }

    if (result.error.code === 'NOT_FOUND') {
      return this.success(false);
    }

    // Return error for other failures
    return result as DataverseResult<boolean>;
  }

  // ============================================================================
  // LOOKUP HELPERS
  // ============================================================================

  /**
   * Format a lookup value for @odata.bind
   * 
   * @param targetEntitySet - Target entity set name (e.g., 'contacts')
   * @param targetId - Target record GUID
   * @returns Formatted bind string
   * 
   * @example
   * ```typescript
   * const bindValue = CrudService.formatLookupValue('contacts', contactId);
   * // Returns: '/contacts(guid-here)'
   * ```
   */
  static formatLookupValue(targetEntitySet: string, targetId: string): string {
    const formattedId = targetId.replace(/[{}]/g, '');
    return `/${targetEntitySet}(${formattedId})`;
  }

  /**
   * Set a lookup field on a data object
   * 
   * @param data - Data object to modify
   * @param lookupAttribute - Lookup field logical name (e.g., 'primarycontactid')
   * @param targetEntitySet - Target entity set name (e.g., 'contacts')
   * @param targetId - Target record GUID (null to clear)
   * @returns Modified data object
   * 
   * @example
   * ```typescript
   * const data = accountService.setLookup(
   *   { name: 'Contoso' },
   *   'primarycontactid',
   *   'contacts',
   *   contactId
   * );
   * await accountService.create(data);
   * ```
   */
  setLookup(
    data: Partial<T>,
    lookupAttribute: string,
    targetEntitySet: string,
    targetId: string | null
  ): Partial<T> {
    return this.setLookupField(
      data,
      lookupAttribute,
      targetEntitySet,
      targetId
    );
  }

  /**
   * Clear a lookup field on a data object
   * 
   * @param data - Data object to modify
   * @param lookupAttribute - Lookup field logical name
   * @returns Modified data object
   */
  clearLookup(data: Partial<T>, lookupAttribute: string): Partial<T> {
    return this.clearLookupField(data, lookupAttribute);
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  /**
   * Create multiple records
   * Note: Uses sequential calls (batch API not available in standard webAPI)
   * 
   * @param records - Array of records to create
   * @param options - Options for batch operation
   * @returns Results for each record
   */
  async createMany(
    records: Partial<T>[],
    options?: { stopOnError?: boolean }
  ): Promise<DataverseResult<CreateResult[]>> {
    const results: CreateResult[] = [];
    const stopOnError = options?.stopOnError ?? false;

    for (const record of records) {
      const result = await this.create(record);
      
      if (!result.success) {
        if (stopOnError) {
          return result as DataverseResult<CreateResult[]>;
        }
        // Log error but continue
        this._logger.warn('Batch create: record failed', { error: result.error });
        continue;
      }
      
      results.push(result.data);
    }

    return this.success(results);
  }

  /**
   * Delete multiple records
   * 
   * @param ids - Array of record GUIDs
   * @param options - Options for batch operation
   * @returns Result indicating success
   */
  async deleteMany(
    ids: string[],
    options?: { stopOnError?: boolean }
  ): Promise<DataverseResult<{ deleted: number; failed: number }>> {
    let deleted = 0;
    let failed = 0;
    const stopOnError = options?.stopOnError ?? false;

    for (const id of ids) {
      const result = await this.delete(id);
      
      if (!result.success) {
        failed++;
        if (stopOnError) {
          return result as unknown as DataverseResult<{ deleted: number; failed: number }>;
        }
        continue;
      }
      
      deleted++;
    }

    return this.success({ deleted, failed });
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a CrudService for a specific entity
 * 
 * @param context - PCF context
 * @param entityLogicalName - Entity logical name
 * @param options - Additional configuration
 * @returns Configured CrudService instance
 * 
 * @example
 * ```typescript
 * const accountService = createCrudService<Account>(context, 'account');
 * const contactService = createCrudService<Contact>(context, 'contact');
 * ```
 */
export function createCrudService<T extends EntityRecord>(
  context: IPCFContext | unknown,
  entityLogicalName: string,
  options?: Partial<Omit<CrudServiceConfig, 'entityLogicalName'>>
): CrudService<T> {
  return new CrudService<T>(context, {
    entityLogicalName,
    ...options,
  });
}
