/**
 * OData Query Generator for Microsoft Dataverse
 * 
 * Generates OData query URLs from Dynamic Value configurations.
 * Compatible with Dataverse Web API.
 * 
 * @see https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/query-data-web-api
 */

import type { DynamicValueConfig, DynamicValueFilter, DynamicValueFilterGroup } from '../../types/questionnaire';
import { getEntityByLogicalName, parseLookupPath } from '../../data/dataverseEntities';

/**
 * Maps internal operators to OData $filter operators/functions
 */
const ODATA_OPERATOR_MAP: Record<string, { type: 'operator' | 'function'; value: string }> = {
  'equals': { type: 'operator', value: 'eq' },
  'eq': { type: 'operator', value: 'eq' },
  'not_equals': { type: 'operator', value: 'ne' },
  'ne': { type: 'operator', value: 'ne' },
  'greater_than': { type: 'operator', value: 'gt' },
  'gt': { type: 'operator', value: 'gt' },
  'ge': { type: 'operator', value: 'ge' },
  'less_than': { type: 'operator', value: 'lt' },
  'lt': { type: 'operator', value: 'lt' },
  'le': { type: 'operator', value: 'le' },
  'contains': { type: 'function', value: 'contains' },
  'not_contains': { type: 'function', value: 'not contains' },
  'starts_with': { type: 'function', value: 'startswith' },
  'startswith': { type: 'function', value: 'startswith' },
  'ends_with': { type: 'function', value: 'endswith' },
  'endswith': { type: 'function', value: 'endswith' },
  'is_null': { type: 'operator', value: 'eq null' },
  'null': { type: 'operator', value: 'eq null' },
  'is_not_null': { type: 'operator', value: 'ne null' },
  'not_null': { type: 'operator', value: 'ne null' },
};

/**
 * Generates an OData condition expression from a filter
 * Handles both regular attributes and lookup paths (e.g., "primarycontactid/fullname")
 */
const generateCondition = (filter: DynamicValueFilter): string => {
  const mapping = ODATA_OPERATOR_MAP[filter.operator] || { type: 'operator', value: 'eq' };
  let field = filter.field;
  const value = filter.value;
  
  // Check if this is a lookup path expression (e.g., "primarycontactid/fullname")
  const lookupPath = parseLookupPath(filter.field);
  if (lookupPath) {
    // OData uses forward slash for navigation: _primarycontactid_value or expand syntax
    // For filtering, we use the navigation property path directly
    field = `${lookupPath.lookupField}/${lookupPath.targetField}`;
  }
  
  // Handle null checks
  if (mapping.value === 'eq null') {
    return `${field} eq null`;
  }
  if (mapping.value === 'ne null') {
    return `${field} ne null`;
  }
  
  // Handle functions (contains, startswith, endswith)
  if (mapping.type === 'function') {
    if (mapping.value === 'not contains') {
      return `not contains(${field},'${value}')`;
    }
    return `${mapping.value}(${field},'${value}')`;
  }
  
  // Handle regular operators
  // Determine if value should be quoted (strings) or not (numbers, booleans)
  const numericValue = Number(value);
  const isNumeric = !isNaN(numericValue) && value.trim() !== '';
  const isBool = value.toLowerCase() === 'true' || value.toLowerCase() === 'false';
  const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  
  if (isNumeric) {
    return `${field} ${mapping.value} ${numericValue}`;
  } else if (isBool) {
    return `${field} ${mapping.value} ${value.toLowerCase()}`;
  } else if (isGuid) {
    return `${field} ${mapping.value} ${value}`;
  } else {
    return `${field} ${mapping.value} '${value}'`;
  }
};

/**
 * Recursively generates an OData $filter expression from a condition group
 */
const generateFilterExpression = (group: DynamicValueFilterGroup): string => {
  const connector = group.matchType.toLowerCase() === 'or' ? ' or ' : ' and ';
  
  const expressions: string[] = [];
  
  for (const child of group.children) {
    if (child.type === 'filter') {
      if (child.field) { // Only include filters with a field selected
        expressions.push(generateCondition(child));
      }
    } else if (child.type === 'group') {
      const nestedExpr = generateFilterExpression(child);
      if (nestedExpr) {
        expressions.push(`(${nestedExpr})`);
      }
    }
  }
  
  return expressions.join(connector);
};

/**
 * Configuration options for OData generation
 */
export interface ODataOptions {
  /** Maximum number of records to retrieve */
  top?: number;
  /** Whether to include total record count */
  count?: boolean;
  /** Additional fields to select */
  additionalSelect?: string[];
  /** Fields to expand (related entities) */
  expand?: string[];
  /** Skip N records (for paging) */
  skip?: number;
}

/**
 * Represents the components of an OData query
 */
export interface ODataQueryParts {
  /** The entity set name (plural form) */
  entitySet: string;
  /** The $select clause */
  select?: string;
  /** The $filter clause */
  filter?: string;
  /** The $orderby clause */
  orderby?: string;
  /** The $top clause */
  top?: number;
  /** The $count clause */
  count?: boolean;
  /** The $expand clause */
  expand?: string;
  /** The $skip clause */
  skip?: number;
}

/**
 * Generates OData query parts from a DynamicValueConfig
 */
export const generateODataParts = (
  config: DynamicValueConfig,
  options: ODataOptions = {}
): ODataQueryParts => {
  const entity = getEntityByLogicalName(config.tableName);
  if (!entity) {
    throw new Error(`Entity '${config.tableName}' not found`);
  }

  const parts: ODataQueryParts = {
    entitySet: entity.displayCollectionName.toLowerCase().replace(/\s+/g, ''),
  };
  
  // Build $select
  const selectFields: string[] = [];
  if (config.labelField) selectFields.push(config.labelField);
  if (config.valueField && config.valueField !== config.labelField) {
    selectFields.push(config.valueField);
  }
  if (options.additionalSelect) {
    selectFields.push(...options.additionalSelect);
  }
  if (selectFields.length > 0) {
    parts.select = selectFields.join(',');
  }
  
  // Build $filter
  const conditionGroup = config.conditionGroup || config.filterGroup;
  if (conditionGroup && conditionGroup.children.length > 0) {
    const filterExpr = generateFilterExpression(conditionGroup);
    if (filterExpr) {
      parts.filter = filterExpr;
    }
  }
  
  // Build $orderby
  if (config.orderByField) {
    parts.orderby = `${config.orderByField} ${config.orderDirection || 'asc'}`;
  }
  
  // Additional options
  if (options.top) parts.top = options.top;
  if (options.count) parts.count = true;
  if (options.expand && options.expand.length > 0) {
    parts.expand = options.expand.join(',');
  }
  if (options.skip) parts.skip = options.skip;
  
  return parts;
};

/**
 * Generates a complete OData query URL from a DynamicValueConfig
 * @param baseUrl - The Dataverse Web API base URL (optional, defaults to relative path)
 */
export const generateODataUrl = (
  config: DynamicValueConfig,
  options: ODataOptions = {},
  baseUrl = '/api/data/v9.2'
): string => {
  const parts = generateODataParts(config, options);
  
  const queryParams: string[] = [];
  
  if (parts.select) queryParams.push(`$select=${parts.select}`);
  if (parts.filter) queryParams.push(`$filter=${encodeURIComponent(parts.filter)}`);
  if (parts.orderby) queryParams.push(`$orderby=${parts.orderby}`);
  if (parts.top) queryParams.push(`$top=${parts.top}`);
  if (parts.count) queryParams.push(`$count=true`);
  if (parts.expand) queryParams.push(`$expand=${parts.expand}`);
  if (parts.skip) queryParams.push(`$skip=${parts.skip}`);
  
  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  
  return `${baseUrl}/${config.tableName}s${queryString}`;
};

/**
 * Generates a formatted OData query for display/debugging (non-encoded)
 */
export const generateFormattedOData = (
  config: DynamicValueConfig,
  options: ODataOptions = {}
): string => {
  const parts = generateODataParts(config, options);
  
  const lines: string[] = [];
  lines.push(`/${config.tableName}s`);
  
  const queryParts: string[] = [];
  if (parts.select) queryParts.push(`  $select=${parts.select}`);
  if (parts.filter) queryParts.push(`  $filter=${parts.filter}`);
  if (parts.orderby) queryParts.push(`  $orderby=${parts.orderby}`);
  if (parts.top) queryParts.push(`  $top=${parts.top}`);
  if (parts.count) queryParts.push(`  $count=true`);
  if (parts.expand) queryParts.push(`  $expand=${parts.expand}`);
  
  if (queryParts.length > 0) {
    lines.push('?' + queryParts.join('\n  &'));
  }
  
  return lines.join('\n');
};

/**
 * Validates a DynamicValueConfig for OData generation
 * Returns an array of validation errors (empty if valid)
 */
export const validateConfigForOData = (config: DynamicValueConfig): string[] => {
  const errors: string[] = [];
  
  if (!config.tableName) {
    errors.push('Entity name is required');
  }
  
  if (!config.labelField) {
    errors.push('Label attribute is required');
  }
  
  if (!config.valueField) {
    errors.push('Value attribute is required');
  }
  
  const entity = getEntityByLogicalName(config.tableName);
  if (config.tableName && !entity) {
    errors.push(`Entity '${config.tableName}' is not recognized`);
  }
  
  return errors;
};
