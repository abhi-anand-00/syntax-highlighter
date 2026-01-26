/**
 * PCF Documentation Types
 * 
 * Self-contained types for the PCF documentation and playground.
 * NO external dependencies on project types.
 */

// ============================================================================
// Dataverse Entity Types (for playground simulation)
// ============================================================================

export type DataverseFieldType = 
  | 'string'
  | 'lookup'
  | 'optionset'
  | 'boolean'
  | 'number'
  | 'decimal'
  | 'currency'
  | 'datetime'
  | 'guid'
  | 'multiselect';

export interface DataverseField {
  logicalName: string;
  displayName: string;
  type: DataverseFieldType;
  lookupTarget?: string;
  optionSetName?: string;
  isPrimaryName?: boolean;
  isPrimaryKey?: boolean;
}

export interface DataverseEntity {
  logicalName: string;
  displayName: string;
  displayCollectionName: string;
  primaryIdAttribute: string;
  primaryNameAttribute: string;
  fields: DataverseField[];
}

// ============================================================================
// Dynamic Value Configuration Types
// ============================================================================

export type ConditionOperator = 
  | 'eq' | 'ne' | 'gt' | 'ge' | 'lt' | 'le'
  | 'contains' | 'not_contains' | 'startswith' | 'endswith'
  | 'null' | 'not_null';

export interface DynamicValueFilter {
  type: 'filter';
  id: string;
  field: string;
  operator: ConditionOperator;
  value: string;
}

export interface DynamicValueFilterGroup {
  type: 'group';
  id: string;
  matchType: 'AND' | 'OR';
  children: (DynamicValueFilter | DynamicValueFilterGroup)[];
}

export interface DynamicValueConfig {
  tableName: string;
  labelField: string;
  valueField: string;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  conditionGroup?: DynamicValueFilterGroup;
  filterGroup?: DynamicValueFilterGroup;
}

// ============================================================================
// Playground Types
// ============================================================================

export interface FilterState {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export type SampleRecord = Record<string, string | number | boolean | null>;
