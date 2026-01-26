/**
 * FetchXML Generator for Microsoft Dataverse
 * 
 * Generates FetchXML queries from Dynamic Value configurations.
 * FetchXML is the native query language for Dataverse/Dynamics 365 CRM.
 * 
 * @see https://learn.microsoft.com/en-us/power-apps/developer/data-platform/fetchxml/overview
 */

import type { DynamicValueConfig, DynamicValueFilter, DynamicValueFilterGroup } from '../../types/questionnaire';
import { getEntityByLogicalName } from '../../data/dataverseEntities';
import { parseLookupPath } from '../../data/dataverseEntities';

/**
 * Maps internal operators to FetchXML condition operators
 */
const FETCHXML_OPERATOR_MAP: Record<string, string> = {
  'equals': 'eq',
  'eq': 'eq',
  'not_equals': 'ne',
  'ne': 'ne',
  'greater_than': 'gt',
  'gt': 'gt',
  'ge': 'ge',
  'less_than': 'lt',
  'lt': 'lt',
  'le': 'le',
  'contains': 'like',
  'not_contains': 'not-like',
  'starts_with': 'like',
  'startswith': 'like',
  'ends_with': 'like',
  'endswith': 'like',
  'is_null': 'null',
  'null': 'null',
  'is_not_null': 'not-null',
  'not_null': 'not-null',
};

/**
 * Formats value for FetchXML based on operator
 * Handles wildcard patterns for LIKE operations
 */
const formatFetchXmlValue = (value: string, operator: string): string => {
  switch (operator) {
    case 'contains':
    case 'not_contains':
      return `%${value}%`;
    case 'starts_with':
    case 'startswith':
      return `${value}%`;
    case 'ends_with':
    case 'endswith':
      return `%${value}`;
    default:
      return value;
  }
};

/**
 * Escapes special XML characters
 */
const escapeXml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Generates a FetchXML condition element from a filter
 * Handles both regular attributes and lookup paths (e.g., "primarycontactid/fullname")
 */
const generateCondition = (filter: DynamicValueFilter, indent: string): string => {
  const operator = FETCHXML_OPERATOR_MAP[filter.operator] || 'eq';
  const isNullCheck = ['null', 'not-null'].includes(operator);
  
  // Check if this is a lookup path expression
  const lookupPath = parseLookupPath(filter.field);
  
  if (lookupPath) {
    // For lookup expressions, we need to use link-entity in FetchXML
    // This generates a comment indicating the lookup relationship
    const { lookupField, targetField } = lookupPath;
    const formattedValue = isNullCheck ? '' : formatFetchXmlValue(filter.value, filter.operator);
    
    if (isNullCheck) {
      return `${indent}<!-- Lookup condition: ${lookupField}.${targetField} ${operator} -->
${indent}<condition entityname="${lookupField}" attribute="${escapeXml(targetField)}" operator="${operator}" />`;
    }
    
    return `${indent}<!-- Lookup condition: ${lookupField}.${targetField} ${operator} '${formattedValue}' -->
${indent}<condition entityname="${lookupField}" attribute="${escapeXml(targetField)}" operator="${operator}" value="${escapeXml(formattedValue)}" />`;
  }
  
  // Standard attribute condition
  if (isNullCheck) {
    return `${indent}<condition attribute="${escapeXml(filter.field)}" operator="${operator}" />`;
  }
  
  const formattedValue = formatFetchXmlValue(filter.value, filter.operator);
  return `${indent}<condition attribute="${escapeXml(filter.field)}" operator="${operator}" value="${escapeXml(formattedValue)}" />`;
};

/**
 * Recursively generates FetchXML filter elements from a condition group
 */
const generateFilterGroup = (
  group: DynamicValueFilterGroup, 
  indent = '      '
): string => {
  const filterType = group.matchType.toLowerCase(); // 'and' or 'or'
  const lines: string[] = [];
  
  lines.push(`${indent}<filter type="${filterType}">`);
  
  for (const child of group.children) {
    if (child.type === 'filter') {
      if (child.field) { // Only include filters with a field selected
        lines.push(generateCondition(child, `${indent}  `));
      }
    } else if (child.type === 'group') {
      lines.push(generateFilterGroup(child, `${indent}  `));
    }
  }
  
  lines.push(`${indent}</filter>`);
  
  return lines.join('\n');
};

/**
 * Configuration options for FetchXML generation
 */
export interface FetchXmlOptions {
  /** Maximum number of records to retrieve (default: 5000) */
  top?: number;
  /** Whether to include total record count (default: false) */
  count?: boolean;
  /** Whether to use distinct results (default: false) */
  distinct?: boolean;
  /** Page number for paging (optional) */
  page?: number;
  /** Paging cookie from previous query (optional) */
  pagingCookie?: string;
}

/**
 * Generates a complete FetchXML query from a DynamicValueConfig
 */
export const generateFetchXml = (
  config: DynamicValueConfig,
  options: FetchXmlOptions = {}
): string => {
  const entity = getEntityByLogicalName(config.tableName);
  if (!entity) {
    throw new Error(`Entity '${config.tableName}' not found`);
  }

  const {
    top = 5000,
    count = false,
    distinct = false,
    page,
    pagingCookie,
  } = options;

  const lines: string[] = [];
  
  // Build fetch element with attributes
  let fetchAttrs = '';
  if (top) fetchAttrs += ` top="${top}"`;
  if (count) fetchAttrs += ` count="true"`;
  if (distinct) fetchAttrs += ` distinct="true"`;
  if (page) fetchAttrs += ` page="${page}"`;
  if (pagingCookie) fetchAttrs += ` paging-cookie="${escapeXml(pagingCookie)}"`;
  
  lines.push(`<fetch${fetchAttrs}>`);
  lines.push(`  <entity name="${config.tableName}">`);
  
  // Add attribute selections
  if (config.labelField) {
    lines.push(`    <attribute name="${config.labelField}" />`);
  }
  if (config.valueField && config.valueField !== config.labelField) {
    lines.push(`    <attribute name="${config.valueField}" />`);
  }
  
  // Add order by
  if (config.orderByField) {
    const descending = config.orderDirection === 'desc' ? ' descending="true"' : '';
    lines.push(`    <order attribute="${config.orderByField}"${descending} />`);
  }
  
  // Add filter conditions
  const conditionGroup = config.conditionGroup || config.filterGroup;
  if (conditionGroup && conditionGroup.children.length > 0) {
    lines.push(generateFilterGroup(conditionGroup, '    '));
  }
  
  lines.push(`  </entity>`);
  lines.push(`</fetch>`);
  
  return lines.join('\n');
};

/**
 * Generates a formatted FetchXML query for display/debugging
 * Same as generateFetchXml but with consistent formatting
 */
export const generateFormattedFetchXml = (
  config: DynamicValueConfig,
  options: FetchXmlOptions = {}
): string => {
  return generateFetchXml(config, options);
};

/**
 * Validates a DynamicValueConfig for FetchXML generation
 * Returns an array of validation errors (empty if valid)
 */
export const validateConfigForFetchXml = (config: DynamicValueConfig): string[] => {
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
