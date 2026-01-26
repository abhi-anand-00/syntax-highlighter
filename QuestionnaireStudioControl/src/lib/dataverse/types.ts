/**
 * Dataverse Integration Types
 * 
 * Type definitions for Microsoft Dataverse / Dynamics 365 CRM integration.
 * These types mirror the Xrm.WebApi interfaces for PCF control development.
 */

// ============================================================================
// Core Entity Types
// ============================================================================

/**
 * Represents a Dataverse entity record
 */
export type DataverseRecord = Record<string, unknown>;

/**
 * Entity reference for lookup fields
 */
export interface EntityReference {
  id: string;
  entityType: string;
  name?: string;
}

/**
 * Option set value
 */
export interface OptionSetValue {
  value: number;
  label: string;
}

/**
 * Formatted value from Dataverse
 */
export interface FormattedValue {
  raw: unknown;
  formatted: string;
}

// ============================================================================
// Query Types
// ============================================================================

/**
 * OData query options
 */
export interface ODataQueryOptions {
  /** Fields to select */
  select?: string[];
  /** Filter expression */
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
  /** Fields to select from related entity */
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
export interface FetchXmlQueryOptions {
  /** The FetchXML query string */
  fetchXml: string;
  /** Page number for paging */
  page?: number;
  /** Paging cookie from previous query */
  pagingCookie?: string;
}

// ============================================================================
// CRUD Operation Types
// ============================================================================

/**
 * Create operation result
 */
export interface CreateResult {
  id: string;
  entityType: string;
}

/**
 * Update operation options
 */
export interface UpdateOptions {
  /** Prevent creation if record doesn't exist */
  preventCreate?: boolean;
  /** ETag for optimistic concurrency */
  eTag?: string;
}

/**
 * Delete operation options
 */
export interface DeleteOptions {
  /** ETag for optimistic concurrency */
  eTag?: string;
}

/**
 * Retrieve multiple result
 */
export interface RetrieveMultipleResult<T = DataverseRecord> {
  entities: T[];
  nextLink?: string;
  totalRecordCount?: number;
  moreRecords: boolean;
  pagingCookie?: string;
}

// ============================================================================
// Metadata Types
// ============================================================================

/**
 * Entity metadata
 */
export interface EntityMetadata {
  logicalName: string;
  displayName: string;
  displayCollectionName: string;
  primaryIdAttribute: string;
  primaryNameAttribute: string;
  entitySetName: string;
  isActivity: boolean;
  attributes: AttributeMetadata[];
}

/**
 * Attribute metadata
 */
export interface AttributeMetadata {
  logicalName: string;
  displayName: string;
  attributeType: AttributeType;
  isPrimaryId: boolean;
  isPrimaryName: boolean;
  isRequired: boolean;
  isValidForCreate: boolean;
  isValidForUpdate: boolean;
  isValidForRead: boolean;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  precision?: number;
  /** For lookup attributes */
  targets?: string[];
  /** For optionset attributes */
  options?: OptionMetadata[];
}

/**
 * Attribute type enumeration
 */
export type AttributeType =
  | 'String'
  | 'Memo'
  | 'Integer'
  | 'BigInt'
  | 'Double'
  | 'Decimal'
  | 'Money'
  | 'Boolean'
  | 'DateTime'
  | 'Lookup'
  | 'Customer'
  | 'Owner'
  | 'Picklist'
  | 'State'
  | 'Status'
  | 'MultiSelectPicklist'
  | 'Uniqueidentifier'
  | 'Image'
  | 'File'
  | 'Virtual'
  | 'EntityName';

/**
 * Option metadata for optionsets
 */
export interface OptionMetadata {
  value: number;
  label: string;
  color?: string;
}

// ============================================================================
// Lookup Types
// ============================================================================

/**
 * Lookup field configuration
 */
export interface LookupConfig {
  /** The lookup attribute logical name */
  lookupAttribute: string;
  /** The target entity logical name */
  targetEntity: string;
  /** Fields to retrieve from target entity */
  targetFields: string[];
  /** Filter on target entity */
  targetFilter?: string;
  /** Order by on target entity */
  targetOrderBy?: string;
}

/**
 * Lookup resolution result
 */
export interface LookupResolution {
  id: string;
  entityType: string;
  primaryName: string;
  additionalFields: Record<string, unknown>;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Dataverse error response
 */
export interface DataverseError {
  code: string;
  message: string;
  innererror?: {
    message: string;
    type: string;
    stacktrace: string;
  };
}

/**
 * Wrapped error with context
 */
export interface DataverseOperationError {
  operation: 'create' | 'retrieve' | 'update' | 'delete' | 'retrieveMultiple' | 'metadata';
  entityType: string;
  recordId?: string;
  error: DataverseError;
}

// ============================================================================
// PCF Context Types (simplified for reference)
// ============================================================================

/**
 * Simplified PCF WebApi interface
 * In actual PCF, use ComponentFramework.WebApi
 */
export interface IWebApi {
  createRecord(entityType: string, data: DataverseRecord): Promise<EntityReference>;
  retrieveRecord(entityType: string, id: string, options?: string): Promise<DataverseRecord>;
  updateRecord(entityType: string, id: string, data: DataverseRecord): Promise<EntityReference>;
  deleteRecord(entityType: string, id: string): Promise<EntityReference>;
  retrieveMultipleRecords(
    entityType: string,
    options?: string,
    maxPageSize?: number
  ): Promise<RetrieveMultipleResult>;
}

/**
 * Simplified PCF Utility interface
 * In actual PCF, use ComponentFramework.Utility
 */
export interface IUtility {
  getEntityMetadata(entityName: string, attributes?: string[]): Promise<EntityMetadata>;
}
