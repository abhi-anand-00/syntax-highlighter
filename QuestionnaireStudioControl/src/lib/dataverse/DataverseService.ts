/**
 * Dataverse Service - Generic Wrapper for PCF Control Integration
 * 
 * A comprehensive service class for interacting with Microsoft Dataverse
 * in Power Apps Component Framework (PCF) controls.
 * 
 * Features:
 * - CRUD operations with type safety
 * - Lookup field navigation and resolution
 * - Entity metadata fetching
 * - OData and FetchXML query support
 * - Error handling with detailed context
 * 
 * Usage in PCF Control:
 * ```typescript
 * const service = new DataverseService(context.webAPI, context.utils);
 * const accounts = await service.retrieveMultiple('account', { top: 10 });
 * ```
 */

import type {
  DataverseRecord,
  EntityReference,
  ODataQueryOptions,
  FetchXmlQueryOptions,
  CreateResult,
  UpdateOptions,
  DeleteOptions,
  RetrieveMultipleResult,
  EntityMetadata,
  AttributeMetadata,
  LookupConfig,
  LookupResolution,
  DataverseOperationError,
  IWebApi,
  IUtility,
  ExpandOption,
} from './types';
import type { DynamicValueConfig } from '../../types/questionnaire';
import { generateODataUrl, generateODataParts } from './odataGenerator';
import { generateFetchXml } from './fetchXmlGenerator';

// ============================================================================
// Result Type for Error Handling
// ============================================================================

export type DataverseResult<T> = 
  | { success: true; data: T }
  | { success: false; error: DataverseOperationError };

// ============================================================================
// DataverseService Class
// ============================================================================

export class DataverseService {
  private webApi: IWebApi;
  private utility: IUtility;
  private metadataCache = new Map<string, EntityMetadata>();

  constructor(webApi: IWebApi, utility: IUtility) {
    this.webApi = webApi;
    this.utility = utility;
  }

  // ==========================================================================
  // CRUD Operations
  // ==========================================================================

  /**
   * Create a new record in Dataverse
   */
  async create<T extends DataverseRecord>(
    entityType: string,
    data: T
  ): Promise<DataverseResult<CreateResult>> {
    try {
      const result = await this.webApi.createRecord(entityType, data);
      return {
        success: true,
        data: {
          id: result.id,
          entityType: result.entityType,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: this.wrapError('create', entityType, undefined, error),
      };
    }
  }

  /**
   * Retrieve a single record by ID
   */
  async retrieve<T extends DataverseRecord>(
    entityType: string,
    id: string,
    options?: ODataQueryOptions
  ): Promise<DataverseResult<T>> {
    try {
      const queryString = options ? this.buildQueryString(options) : undefined;
      const result = await this.webApi.retrieveRecord(entityType, id, queryString);
      return {
        success: true,
        data: result as T,
      };
    } catch (error) {
      return {
        success: false,
        error: this.wrapError('retrieve', entityType, id, error),
      };
    }
  }

  /**
   * Update an existing record
   */
  async update<T extends DataverseRecord>(
    entityType: string,
    id: string,
    data: Partial<T>,
    _options?: UpdateOptions
  ): Promise<DataverseResult<EntityReference>> {
    try {
      const result = await this.webApi.updateRecord(entityType, id, data);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: this.wrapError('update', entityType, id, error),
      };
    }
  }

  /**
   * Delete a record
   */
  async delete(
    entityType: string,
    id: string,
    _options?: DeleteOptions
  ): Promise<DataverseResult<EntityReference>> {
    try {
      const result = await this.webApi.deleteRecord(entityType, id);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: this.wrapError('delete', entityType, id, error),
      };
    }
  }

  /**
   * Retrieve multiple records with OData options
   */
  async retrieveMultiple<T extends DataverseRecord>(
    entityType: string,
    options?: ODataQueryOptions,
    maxPageSize?: number
  ): Promise<DataverseResult<RetrieveMultipleResult<T>>> {
    try {
      const queryString = options ? this.buildQueryString(options) : undefined;
      const result = await this.webApi.retrieveMultipleRecords(
        entityType,
        queryString,
        maxPageSize
      );
      return {
        success: true,
        data: result as RetrieveMultipleResult<T>,
      };
    } catch (error) {
      return {
        success: false,
        error: this.wrapError('retrieveMultiple', entityType, undefined, error),
      };
    }
  }

  /**
   * Retrieve multiple records using FetchXML
   */
  async retrieveMultipleWithFetchXml<T extends DataverseRecord>(
    entityType: string,
    options: FetchXmlQueryOptions
  ): Promise<DataverseResult<RetrieveMultipleResult<T>>> {
    try {
      const encodedFetchXml = encodeURIComponent(options.fetchXml);
      const queryString = `?fetchXml=${encodedFetchXml}`;
      const result = await this.webApi.retrieveMultipleRecords(entityType, queryString);
      return {
        success: true,
        data: result as RetrieveMultipleResult<T>,
      };
    } catch (error) {
      return {
        success: false,
        error: this.wrapError('retrieveMultiple', entityType, undefined, error),
      };
    }
  }

  // ==========================================================================
  // Dynamic Value Config Support
  // ==========================================================================

  /**
   * Execute a query based on DynamicValueConfig (from questionnaire builder)
   * Returns label/value pairs suitable for dropdowns
   */
  async executeFromConfig(
    config: DynamicValueConfig
  ): Promise<DataverseResult<{ label: string; value: string }[]>> {
    try {
      const parts = generateODataParts(config);
      const options: ODataQueryOptions = {
        select: parts.select?.split(','),
        filter: parts.filter,
        orderBy: parts.orderby,
        top: parts.top,
      };

      const result = await this.retrieveMultiple(config.tableName, options);
      
      if (!result.success) {
        return result as DataverseResult<{ label: string; value: string }[]>;
      }

      const mappedResults = result.data.entities.map((entity) => ({
        label: String(entity[config.labelField] || ''),
        value: String(entity[config.valueField] || ''),
      }));

      return {
        success: true,
        data: mappedResults,
      };
    } catch (error) {
      return {
        success: false,
        error: this.wrapError('retrieveMultiple', config.tableName, undefined, error),
      };
    }
  }

  /**
   * Execute a FetchXML query based on DynamicValueConfig
   */
  async executeFromConfigFetchXml(
    config: DynamicValueConfig
  ): Promise<DataverseResult<{ label: string; value: string }[]>> {
    try {
      const fetchXml = generateFetchXml(config);
      const result = await this.retrieveMultipleWithFetchXml(config.tableName, { fetchXml });
      
      if (!result.success) {
        return result as DataverseResult<{ label: string; value: string }[]>;
      }

      const mappedResults = result.data.entities.map((entity) => ({
        label: String(entity[config.labelField] || ''),
        value: String(entity[config.valueField] || ''),
      }));

      return {
        success: true,
        data: mappedResults,
      };
    } catch (error) {
      return {
        success: false,
        error: this.wrapError('retrieveMultiple', config.tableName, undefined, error),
      };
    }
  }

  // ==========================================================================
  // Lookup Operations
  // ==========================================================================

  /**
   * Resolve a lookup field to get related entity details
   */
  async resolveLookup(
    record: DataverseRecord,
    lookupAttribute: string,
    targetFields?: string[]
  ): Promise<DataverseResult<LookupResolution | null>> {
    try {
      // Get the lookup value from the record
      const lookupValue = record[`_${lookupAttribute}_value`] as string | undefined;
      const lookupType = record[`_${lookupAttribute}_value@Microsoft.Dynamics.CRM.lookuplogicalname`] as string | undefined;
      const lookupName = record[`_${lookupAttribute}_value@OData.Community.Display.V1.FormattedValue`] as string | undefined;

      if (!lookupValue || !lookupType) {
        return { success: true, data: null };
      }

      // If we need additional fields, retrieve the full record
      if (targetFields && targetFields.length > 0) {
        const targetResult = await this.retrieve(lookupType, lookupValue, {
          select: targetFields,
        });

        if (!targetResult.success) {
          return targetResult as DataverseResult<LookupResolution | null>;
        }

        return {
          success: true,
          data: {
            id: lookupValue,
            entityType: lookupType,
            primaryName: lookupName || '',
            additionalFields: targetResult.data,
          },
        };
      }

      return {
        success: true,
        data: {
          id: lookupValue,
          entityType: lookupType,
          primaryName: lookupName || '',
          additionalFields: {},
        },
      };
    } catch (error) {
      return {
        success: false,
        error: this.wrapError('retrieve', lookupAttribute, undefined, error),
      };
    }
  }

  /**
   * Retrieve records from a lookup's target entity
   * Useful for populating lookup dropdowns
   */
  async retrieveLookupOptions(
    config: LookupConfig,
    maxRecords = 50
  ): Promise<DataverseResult<LookupResolution[]>> {
    try {
      const options: ODataQueryOptions = {
        select: config.targetFields,
        filter: config.targetFilter,
        orderBy: config.targetOrderBy,
        top: maxRecords,
      };

      const result = await this.retrieveMultiple(config.targetEntity, options);
      
      if (!result.success) {
        return result as DataverseResult<LookupResolution[]>;
      }

      // Get metadata to find primary name attribute
      const metadata = await this.getEntityMetadata(config.targetEntity);
      const primaryNameAttr = metadata.success 
        ? metadata.data.primaryNameAttribute 
        : 'name';
      const primaryIdAttr = metadata.success 
        ? metadata.data.primaryIdAttribute 
        : `${config.targetEntity}id`;

      const resolutions: LookupResolution[] = result.data.entities.map((entity) => ({
        id: String(entity[primaryIdAttr] || ''),
        entityType: config.targetEntity,
        primaryName: String(entity[primaryNameAttr] || ''),
        additionalFields: entity,
      }));

      return {
        success: true,
        data: resolutions,
      };
    } catch (error) {
      return {
        success: false,
        error: this.wrapError('retrieveMultiple', config.targetEntity, undefined, error),
      };
    }
  }

  /**
   * Set a lookup field value on a record
   */
  setLookupValue(
    data: DataverseRecord,
    lookupAttribute: string,
    targetEntity: string,
    targetId: string
  ): DataverseRecord {
    return {
      ...data,
      [`${lookupAttribute}@odata.bind`]: `/${targetEntity}s(${targetId})`,
    };
  }

  /**
   * Clear a lookup field value
   */
  clearLookupValue(
    data: DataverseRecord,
    lookupAttribute: string
  ): DataverseRecord {
    return {
      ...data,
      [lookupAttribute]: null,
    };
  }

  // ==========================================================================
  // Metadata Operations
  // ==========================================================================

  /**
   * Get entity metadata (cached)
   */
  async getEntityMetadata(
    entityName: string,
    forceRefresh = false
  ): Promise<DataverseResult<EntityMetadata>> {
    try {
      // Check cache first
      if (!forceRefresh && this.metadataCache.has(entityName)) {
        return {
          success: true,
          data: this.metadataCache.get(entityName)!,
        };
      }

      const metadata = await this.utility.getEntityMetadata(entityName);
      this.metadataCache.set(entityName, metadata);

      return {
        success: true,
        data: metadata,
      };
    } catch (error) {
      return {
        success: false,
        error: this.wrapError('metadata', entityName, undefined, error),
      };
    }
  }

  /**
   * Get attribute metadata for a specific field
   */
  async getAttributeMetadata(
    entityName: string,
    attributeName: string
  ): Promise<DataverseResult<AttributeMetadata | null>> {
    const entityMetadata = await this.getEntityMetadata(entityName);
    
    if (!entityMetadata.success) {
      return entityMetadata as DataverseResult<AttributeMetadata | null>;
    }

    const attribute = entityMetadata.data.attributes.find(
      (attr) => attr.logicalName === attributeName
    );

    return {
      success: true,
      data: attribute || null,
    };
  }

  /**
   * Get lookup target entities for a lookup attribute
   */
  async getLookupTargets(
    entityName: string,
    lookupAttribute: string
  ): Promise<DataverseResult<string[]>> {
    const attrMetadata = await this.getAttributeMetadata(entityName, lookupAttribute);
    
    if (!attrMetadata.success) {
      return attrMetadata as DataverseResult<string[]>;
    }

    if (!attrMetadata.data) {
      return {
        success: false,
        error: {
          operation: 'metadata',
          entityType: entityName,
          error: {
            code: 'AttributeNotFound',
            message: `Attribute '${lookupAttribute}' not found on entity '${entityName}'`,
          },
        },
      };
    }

    return {
      success: true,
      data: attrMetadata.data.targets || [],
    };
  }

  /**
   * Get optionset values for a picklist attribute
   */
  async getOptionSetValues(
    entityName: string,
    attributeName: string
  ): Promise<DataverseResult<{ value: number; label: string }[]>> {
    const attrMetadata = await this.getAttributeMetadata(entityName, attributeName);
    
    if (!attrMetadata.success) {
      return attrMetadata as DataverseResult<{ value: number; label: string }[]>;
    }

    if (!attrMetadata.data || !attrMetadata.data.options) {
      return {
        success: true,
        data: [],
      };
    }

    return {
      success: true,
      data: attrMetadata.data.options.map((opt) => ({
        value: opt.value,
        label: opt.label,
      })),
    };
  }

  /**
   * Clear metadata cache
   */
  clearMetadataCache(entityName?: string): void {
    if (entityName) {
      this.metadataCache.delete(entityName);
    } else {
      this.metadataCache.clear();
    }
  }

  // ==========================================================================
  // Query Builder Helpers
  // ==========================================================================

  /**
   * Build OData query string from options
   */
  private buildQueryString(options: ODataQueryOptions): string {
    const parts: string[] = [];

    if (options.select && options.select.length > 0) {
      parts.push(`$select=${options.select.join(',')}`);
    }

    if (options.filter) {
      parts.push(`$filter=${options.filter}`);
    }

    if (options.orderBy) {
      parts.push(`$orderby=${options.orderBy}`);
    }

    if (options.top !== undefined) {
      parts.push(`$top=${options.top}`);
    }

    if (options.skip !== undefined) {
      parts.push(`$skip=${options.skip}`);
    }

    if (options.count) {
      parts.push('$count=true');
    }

    if (options.expand && options.expand.length > 0) {
      const expandStr = options.expand.map((e) => this.buildExpandClause(e)).join(',');
      parts.push(`$expand=${expandStr}`);
    }

    return parts.length > 0 ? `?${parts.join('&')}` : '';
  }

  /**
   * Build $expand clause for a single expand option
   */
  private buildExpandClause(expand: ExpandOption): string {
    const nestedParts: string[] = [];

    if (expand.select && expand.select.length > 0) {
      nestedParts.push(`$select=${expand.select.join(',')}`);
    }

    if (expand.filter) {
      nestedParts.push(`$filter=${expand.filter}`);
    }

    if (expand.orderBy) {
      nestedParts.push(`$orderby=${expand.orderBy}`);
    }

    if (expand.top !== undefined) {
      nestedParts.push(`$top=${expand.top}`);
    }

    if (nestedParts.length > 0) {
      return `${expand.property}(${nestedParts.join(';')})`;
    }

    return expand.property;
  }

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  /**
   * Wrap an error with operation context
   */
  private wrapError(
    operation: DataverseOperationError['operation'],
    entityType: string,
    recordId: string | undefined,
    error: unknown
  ): DataverseOperationError {
    const dataverseError = this.parseError(error);
    return {
      operation,
      entityType,
      recordId,
      error: dataverseError,
    };
  }

  /**
   * Parse error into DataverseError format
   */
  private parseError(error: unknown): DataverseOperationError['error'] {
    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>;
      
      // Handle Xrm.WebApi error format
      if ('message' in err) {
        return {
          code: String(err.code || 'UnknownError'),
          message: String(err.message),
          innererror: err.innererror as DataverseOperationError['error']['innererror'],
        };
      }
    }

    return {
      code: 'UnknownError',
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a DataverseService instance
 * 
 * @example
 * // In PCF control init
 * const service = createDataverseService(context.webAPI, context.utils);
 */
export function createDataverseService(
  webApi: IWebApi,
  utility: IUtility
): DataverseService {
  return new DataverseService(webApi, utility);
}

// ============================================================================
// Mock Implementation for Development
// ============================================================================

/**
 * Create a mock DataverseService for development/testing
 * Returns sample data without actual Dataverse connection
 */
export function createMockDataverseService(): DataverseService {
  const mockWebApi: IWebApi = {
    async createRecord(entityType, data) {
      return {
        id: `mock-${Date.now()}`,
        entityType,
        name: String(data.name || 'New Record'),
      };
    },
    async retrieveRecord(entityType, id) {
      return {
        [`${entityType}id`]: id,
        name: `Mock ${entityType} Record`,
        createdon: new Date().toISOString(),
      };
    },
    async updateRecord(entityType, id) {
      return { id, entityType, name: 'Updated' };
    },
    async deleteRecord(entityType, id) {
      return { id, entityType, name: 'Deleted' };
    },
    async retrieveMultipleRecords(entityType) {
      return {
        entities: [
          { [`${entityType}id`]: 'mock-1', name: `Sample ${entityType} 1` },
          { [`${entityType}id`]: 'mock-2', name: `Sample ${entityType} 2` },
          { [`${entityType}id`]: 'mock-3', name: `Sample ${entityType} 3` },
        ],
        moreRecords: false,
      };
    },
  };

  const mockUtility: IUtility = {
    async getEntityMetadata(entityName) {
      return {
        logicalName: entityName,
        displayName: entityName.charAt(0).toUpperCase() + entityName.slice(1),
        displayCollectionName: `${entityName}s`,
        primaryIdAttribute: `${entityName}id`,
        primaryNameAttribute: 'name',
        entitySetName: `${entityName}s`,
        isActivity: false,
        attributes: [
          {
            logicalName: `${entityName}id`,
            displayName: 'ID',
            attributeType: 'Uniqueidentifier',
            isPrimaryId: true,
            isPrimaryName: false,
            isRequired: true,
            isValidForCreate: false,
            isValidForUpdate: false,
            isValidForRead: true,
          },
          {
            logicalName: 'name',
            displayName: 'Name',
            attributeType: 'String',
            isPrimaryId: false,
            isPrimaryName: true,
            isRequired: true,
            isValidForCreate: true,
            isValidForUpdate: true,
            isValidForRead: true,
            maxLength: 100,
          },
        ],
      };
    },
  };

  return new DataverseService(mockWebApi, mockUtility);
}
