/**
 * Query Service for PCF
 * 
 * Advanced data retrieval operations for Dataverse using OData and FetchXML.
 * Extends BaseDataverseService to leverage centralized error handling and logging.
 * 
 * Features:
 * - OData retrieveMultiple with full query options
 * - FetchXML execution with paging cookie support
 * - Auto-paging to retrieve all records
 * - Count and existence helpers
 * - First/single record retrieval
 * - Standardized QueryResult responses
 */

import { BaseDataverseService, type BaseServiceConfig } from './BaseDataverseService';
import { createLogger } from './Logger';
import type {
  IPCFContext,
  ODataOptions,
  FetchXmlOptions,
  DataverseResult,
  QueryResult,
  RetrieveAllOptions,
} from './types';

// ============================================================================
// Constants
// ============================================================================

/** Default page size for queries */
const DEFAULT_PAGE_SIZE = 50;

/** Maximum page size allowed by Dataverse */
const MAX_PAGE_SIZE = 5000;

/** Default safety limit for retrieveAll */
const DEFAULT_MAX_RECORDS = 5000;

// ============================================================================
// FetchXML Helpers
// ============================================================================

/**
 * Parse paging cookie from FetchXML response
 */
function parsePagingCookie(rawCookie: string | undefined): string | undefined {
  if (!rawCookie) return undefined;
  
  try {
    // Decode the cookie for use in next request
    return decodeURIComponent(decodeURIComponent(rawCookie));
  } catch {
    return rawCookie;
  }
}

/**
 * Encode paging cookie for FetchXML request
 */
function encodePagingCookie(cookie: string): string {
  // FetchXML requires double URL encoding for paging cookies
  return encodeURIComponent(encodeURIComponent(cookie));
}

/**
 * Insert paging attributes into FetchXML
 */
function addPagingToFetchXml(
  fetchXml: string,
  page: number,
  count: number,
  pagingCookie?: string
): string {
  // Remove existing paging attributes
  let modifiedXml = fetchXml
    .replace(/\s+page\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s+count\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s+paging-cookie\s*=\s*["'][^"']*["']/gi, '');

  // Find the <fetch> tag
  const fetchMatch = modifiedXml.match(/<fetch([^>]*)>/i);
  if (!fetchMatch) {
    throw new Error('Invalid FetchXML: missing <fetch> element');
  }

  // Build new attributes
  let pagingAttrs = ` page="${page}" count="${count}"`;
  if (pagingCookie) {
    pagingAttrs += ` paging-cookie="${encodePagingCookie(pagingCookie)}"`;
  }

  // Insert attributes into fetch tag
  modifiedXml = modifiedXml.replace(
    /<fetch([^>]*)>/i,
    `<fetch${fetchMatch[1]}${pagingAttrs}>`
  );

  return modifiedXml;
}

/**
 * Extract entity name from FetchXML
 */
function extractEntityFromFetchXml(fetchXml: string): string {
  const match = fetchXml.match(/<entity\s+name\s*=\s*["']([^"']+)["']/i);
  if (!match) {
    throw new Error('Invalid FetchXML: missing entity name');
  }
  return match[1];
}

// ============================================================================
// Query Service Implementation
// ============================================================================

export class QueryService extends BaseDataverseService {
  constructor(context: IPCFContext | unknown, config?: BaseServiceConfig) {
    super(context, {
      ...config,
      logger: config?.logger ?? createLogger('QueryService'),
    });
  }

  // ============================================================================
  // OData Queries
  // ============================================================================

  /**
   * Retrieve multiple records using OData
   * 
   * @param entityType - Entity logical name
   * @param options - OData query options
   * @param maxPageSize - Maximum records per page (default: 50)
   * @returns QueryResult with entities and paging info
   * 
   * @example
   * ```typescript
   * const result = await queryService.retrieveMultiple<Account>('account', {
   *   select: ['name', 'telephone1'],
   *   filter: "statecode eq 0",
   *   orderBy: "name asc",
   *   top: 100
   * });
   * 
   * if (result.success) {
   *   console.log(`Found ${result.data.entities.length} accounts`);
   *   if (result.data.moreRecords) {
   *     // Use result.data.nextLink for next page
   *   }
   * }
   * ```
   */
  async retrieveMultiple<T>(
    entityType: string,
    options?: ODataOptions,
    maxPageSize: number = DEFAULT_PAGE_SIZE
  ): Promise<DataverseResult<QueryResult<T>>> {
    const queryString = this.buildQueryString(options);
    const effectivePageSize = Math.min(maxPageSize, MAX_PAGE_SIZE);

    return this.execute<QueryResult<T>>(
      'retrieveMultiple',
      entityType,
      async () => {
        const response = await this.webApi.retrieveMultipleRecords(
          entityType,
          queryString || undefined,
          effectivePageSize
        );

        return {
          entities: response.entities as T[],
          moreRecords: !!response.nextLink,
          nextLink: response.nextLink,
          totalCount: undefined, // OData count requires $count=true
        };
      }
    );
  }

  /**
   * Get next page using nextLink from previous query
   * 
   * @param entityType - Entity logical name (for logging)
   * @param nextLink - The nextLink URL from previous result
   * @returns QueryResult with next page of entities
   */
  async getNextPage<T>(
    entityType: string,
    nextLink: string
  ): Promise<DataverseResult<QueryResult<T>>> {
    return this.execute<QueryResult<T>>(
      'retrieveMultiple',
      entityType,
      async () => {
        // Extract query portion from nextLink
        const queryPart = nextLink.includes('?') 
          ? nextLink.substring(nextLink.indexOf('?'))
          : '';

        const response = await this.webApi.retrieveMultipleRecords(
          entityType,
          queryPart || undefined
        );

        return {
          entities: response.entities as T[],
          moreRecords: !!response.nextLink,
          nextLink: response.nextLink,
        };
      }
    );
  }

  /**
   * Retrieve ALL records matching criteria (auto-paging)
   * Use with caution - can retrieve large datasets
   * 
   * @param entityType - Entity logical name
   * @param options - Query options with safety limits
   * @returns All matching entities
   * 
   * @example
   * ```typescript
   * const result = await queryService.retrieveAll<Contact>('contact', {
   *   filter: "_parentcustomerid_value eq 'account-id'",
   *   select: ['fullname', 'emailaddress1'],
   *   maxRecords: 1000, // Safety limit
   *   onProgress: (loaded) => console.log(`Loaded ${loaded} records...`)
   * });
   * ```
   */
  async retrieveAll<T>(
    entityType: string,
    options?: RetrieveAllOptions
  ): Promise<DataverseResult<T[]>> {
    const maxRecords = options?.maxRecords ?? DEFAULT_MAX_RECORDS;
    const allEntities: T[] = [];
    let nextLink: string | undefined;
    let pageCount = 0;

    this._logger.info('Starting retrieveAll', { entityType, maxRecords });

    // First page
    const firstResult = await this.retrieveMultiple<T>(entityType, options, MAX_PAGE_SIZE);
    
    if (!firstResult.success) {
      return firstResult as DataverseResult<T[]>;
    }

    allEntities.push(...firstResult.data.entities);
    nextLink = firstResult.data.nextLink;
    pageCount++;

    options?.onProgress?.(allEntities.length, undefined);

    // Check abort signal
    if (options?.signal?.aborted) {
      this._logger.info('retrieveAll aborted by signal');
      return this.success(allEntities);
    }

    // Fetch remaining pages
    while (nextLink && allEntities.length < maxRecords) {
      const pageResult = await this.getNextPage<T>(entityType, nextLink);
      
      if (!pageResult.success) {
        this._logger.warn('retrieveAll: page failed, returning partial results', {
          pagesLoaded: pageCount,
          recordsLoaded: allEntities.length,
        });
        return this.success(allEntities);
      }

      allEntities.push(...pageResult.data.entities);
      nextLink = pageResult.data.nextLink;
      pageCount++;

      options?.onProgress?.(allEntities.length, undefined);

      // Check abort signal
      if (options?.signal?.aborted) {
        this._logger.info('retrieveAll aborted by signal');
        break;
      }
    }

    // Trim to maxRecords if exceeded
    const result = allEntities.slice(0, maxRecords);

    this._logger.info('retrieveAll completed', {
      entityType,
      pagesLoaded: pageCount,
      totalRecords: result.length,
      truncated: allEntities.length > maxRecords,
    });

    return this.success(result);
  }

  // ============================================================================
  // FetchXML Queries
  // ============================================================================

  /**
   * Execute a FetchXML query
   * 
   * @param entityType - Entity logical name
   * @param options - FetchXML query options
   * @returns QueryResult with entities and paging cookie
   * 
   * @example
   * ```typescript
   * const fetchXml = `
   *   <fetch top="50">
   *     <entity name="account">
   *       <attribute name="name" />
   *       <attribute name="telephone1" />
   *       <filter>
   *         <condition attribute="statecode" operator="eq" value="0" />
   *       </filter>
   *       <order attribute="name" />
   *     </entity>
   *   </fetch>
   * `;
   * 
   * const result = await queryService.executeFetchXml<Account>('account', {
   *   fetchXml,
   *   page: 1,
   *   count: 50
   * });
   * ```
   */
  async executeFetchXml<T>(
    entityType: string,
    options: FetchXmlOptions
  ): Promise<DataverseResult<QueryResult<T>>> {
    const page = options.page ?? 1;
    const count = options.count ?? DEFAULT_PAGE_SIZE;

    return this.execute<QueryResult<T>>(
      'retrieveMultiple',
      entityType,
      async () => {
        // Add paging to FetchXML
        const pagedFetchXml = addPagingToFetchXml(
          options.fetchXml,
          page,
          count,
          options.pagingCookie
        );

        // Encode for URL
        const encodedFetchXml = `?fetchXml=${encodeURIComponent(pagedFetchXml)}`;

        const response = await this.webApi.retrieveMultipleRecords(
          entityType,
          encodedFetchXml
        );

        // Parse paging cookie from response
        const pagingCookie = parsePagingCookie(response.fetchXmlPagingCookie);
        const moreRecords = !!pagingCookie || response.entities.length === count;

        return {
          entities: response.entities as T[],
          moreRecords,
          pagingCookie,
          nextLink: undefined, // FetchXML uses paging cookies, not nextLink
        };
      }
    );
  }

  /**
   * Execute FetchXML and retrieve ALL matching records (auto-paging)
   * 
   * @param entityType - Entity logical name  
   * @param fetchXml - FetchXML query string
   * @param maxRecords - Maximum records to retrieve (safety limit)
   * @returns All matching entities
   */
  async executeFetchXmlAll<T>(
    entityType: string,
    fetchXml: string,
    maxRecords: number = DEFAULT_MAX_RECORDS
  ): Promise<DataverseResult<T[]>> {
    const allEntities: T[] = [];
    let page = 1;
    let pagingCookie: string | undefined;
    const pageSize = Math.min(MAX_PAGE_SIZE, maxRecords);

    this._logger.info('Starting executeFetchXmlAll', { entityType, maxRecords });

    while (allEntities.length < maxRecords) {
      const result = await this.executeFetchXml<T>(entityType, {
        fetchXml,
        page,
        count: pageSize,
        pagingCookie,
      });

      if (!result.success) {
        if (page === 1) {
          return result as DataverseResult<T[]>;
        }
        // Return partial results on subsequent page failures
        this._logger.warn('executeFetchXmlAll: page failed, returning partial', {
          page,
          recordsLoaded: allEntities.length,
        });
        return this.success(allEntities);
      }

      allEntities.push(...result.data.entities);

      if (!result.data.moreRecords || result.data.entities.length === 0) {
        break;
      }

      pagingCookie = result.data.pagingCookie;
      page++;
    }

    const result = allEntities.slice(0, maxRecords);

    this._logger.info('executeFetchXmlAll completed', {
      entityType,
      pages: page,
      totalRecords: result.length,
    });

    return this.success(result);
  }

  // ============================================================================
  // Convenience Methods
  // ============================================================================

  /**
   * Count records matching a filter
   * 
   * @param entityType - Entity logical name
   * @param filter - OData filter expression
   * @returns Count of matching records
   * 
   * @example
   * ```typescript
   * const result = await queryService.count('contact', "statecode eq 0");
   * if (result.success) {
   *   console.log(`Active contacts: ${result.data}`);
   * }
   * ```
   */
  async count(
    entityType: string,
    filter?: string
  ): Promise<DataverseResult<number>> {
    // Use FetchXML aggregate for counting
    const fetchXml = `
      <fetch aggregate="true">
        <entity name="${entityType}">
          <attribute name="${entityType}id" alias="count" aggregate="count" />
          ${filter ? `<filter>${this.filterToFetchXmlConditions(filter)}</filter>` : ''}
        </entity>
      </fetch>
    `;

    const result = await this.executeFetchXml<{ count: number }>(entityType, {
      fetchXml,
      count: 1,
    });

    if (!result.success) {
      return result as DataverseResult<number>;
    }

    const countValue = result.data.entities[0]?.count ?? 0;
    return this.success(countValue);
  }

  /**
   * Simple filter to FetchXML condition converter
   * Note: This is a basic converter - complex filters should use FetchXML directly
   */
  private filterToFetchXmlConditions(filter: string): string {
    // Very basic conversion - handles simple "field eq value" patterns
    // For complex filters, use FetchXML directly
    const conditions: string[] = [];
    
    // Match patterns like "fieldname eq 'value'" or "fieldname eq 0"
    const simplePattern = /(\w+)\s+(eq|ne|gt|lt|ge|le)\s+(?:'([^']*)'|(\d+))/gi;
    let match;
    
    while ((match = simplePattern.exec(filter)) !== null) {
      const [, field, operator, stringValue, numericValue] = match;
      const value = stringValue ?? numericValue;
      const fetchOp = operator.toLowerCase();
      conditions.push(`<condition attribute="${field}" operator="${fetchOp}" value="${value}" />`);
    }
    
    return conditions.join('\n');
  }

  /**
   * Check if any records match a filter
   * 
   * @param entityType - Entity logical name
   * @param filter - OData filter expression
   * @returns true if at least one record matches
   */
  async any(
    entityType: string,
    filter?: string
  ): Promise<DataverseResult<boolean>> {
    const result = await this.retrieveMultiple(entityType, {
      filter,
      top: 1,
    }, 1);

    if (!result.success) {
      return result as DataverseResult<boolean>;
    }

    return this.success(result.data.entities.length > 0);
  }

  /**
   * Get first matching record or null
   * 
   * @param entityType - Entity logical name
   * @param options - OData query options
   * @returns First matching record or null
   * 
   * @example
   * ```typescript
   * const result = await queryService.firstOrNull<Account>('account', {
   *   filter: "name eq 'Contoso'",
   *   select: ['accountid', 'name']
   * });
   * 
   * if (result.success && result.data) {
   *   console.log('Found:', result.data.name);
   * }
   * ```
   */
  async firstOrNull<T>(
    entityType: string,
    options?: ODataOptions
  ): Promise<DataverseResult<T | null>> {
    const result = await this.retrieveMultiple<T>(entityType, {
      ...options,
      top: 1,
    }, 1);

    if (!result.success) {
      return result as DataverseResult<T | null>;
    }

    const first = result.data.entities[0] ?? null;
    return this.success(first);
  }

  /**
   * Get single matching record (throws if 0 or multiple)
   * 
   * @param entityType - Entity logical name
   * @param options - OData query options
   * @returns Single matching record
   */
  async single<T>(
    entityType: string,
    options?: ODataOptions
  ): Promise<DataverseResult<T>> {
    const result = await this.retrieveMultiple<T>(entityType, {
      ...options,
      top: 2, // Get 2 to detect multiple
    }, 2);

    if (!result.success) {
      return result as DataverseResult<T>;
    }

    if (result.data.entities.length === 0) {
      return this.failure({
        code: 'NOT_FOUND',
        message: 'No matching record found',
        userMessage: 'The requested record could not be found.',
        isRetryable: false,
      });
    }

    if (result.data.entities.length > 1) {
      return this.failure({
        code: 'VALIDATION_ERROR',
        message: 'Multiple records found when expecting single',
        userMessage: 'Multiple records match the criteria.',
        isRetryable: false,
      });
    }

    return this.success(result.data.entities[0]);
  }

  // ============================================================================
  // Lookup Queries
  // ============================================================================

  /**
   * Get lookup options for a dropdown/picker
   * 
   * @param entityType - Target entity type
   * @param options - Query options
   * @param displayField - Field to use for display (default: primary name)
   * @returns Array of id/name pairs
   * 
   * @example
   * ```typescript
   * const options = await queryService.getLookupOptions('account', {
   *   filter: "statecode eq 0",
   *   orderBy: "name asc",
   *   top: 100
   * });
   * ```
   */
  async getLookupOptions(
    entityType: string,
    options?: ODataOptions,
    displayField?: string
  ): Promise<DataverseResult<{ id: string; name: string }[]>> {
    // Get metadata to find primary name attribute if not specified
    let nameField = displayField;
    
    if (!nameField) {
      const metaResult = await this.getEntityMetadata(entityType);
      if (metaResult.success) {
        nameField = metaResult.data.PrimaryNameAttribute;
      } else {
        nameField = 'name'; // Fallback
      }
    }

    const idField = `${entityType}id`;

    const result = await this.retrieveMultiple<Record<string, unknown>>(
      entityType,
      {
        ...options,
        select: [idField, nameField, ...(options?.select ?? [])],
      }
    );

    if (!result.success) {
      return result as DataverseResult<{ id: string; name: string }[]>;
    }

    const lookupOptions = result.data.entities.map(entity => ({
      id: String(entity[idField] ?? ''),
      name: String(entity[nameField!] ?? ''),
    }));

    return this.success(lookupOptions);
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a QueryService instance
 * 
 * @param context - PCF context
 * @param config - Optional configuration
 * @returns Configured QueryService instance
 */
export function createQueryService(
  context: IPCFContext | unknown,
  config?: BaseServiceConfig
): QueryService {
  return new QueryService(context, config);
}
