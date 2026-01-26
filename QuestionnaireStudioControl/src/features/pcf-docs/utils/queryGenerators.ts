/**
 * Query Generators for PCF Documentation Playground
 * 
 * Self-contained OData and FetchXML generators.
 * NO external dependencies on project files.
 */

import type { DynamicValueConfig, DynamicValueFilter, DynamicValueFilterGroup } from '../types';
import { getEntityByLogicalName, parseLookupPath } from '../data/sampleEntities';

// ============================================================================
// FetchXML Generator
// ============================================================================

const FETCHXML_OPERATOR_MAP: Record<string, string> = {
  'equals': 'eq', 'eq': 'eq',
  'not_equals': 'ne', 'ne': 'ne',
  'greater_than': 'gt', 'gt': 'gt', 'ge': 'ge',
  'less_than': 'lt', 'lt': 'lt', 'le': 'le',
  'contains': 'like', 'not_contains': 'not-like',
  'starts_with': 'like', 'startswith': 'like',
  'ends_with': 'like', 'endswith': 'like',
  'is_null': 'null', 'null': 'null',
  'is_not_null': 'not-null', 'not_null': 'not-null',
};

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

const escapeXml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const generateFetchCondition = (filter: DynamicValueFilter, indent: string): string => {
  const operator = FETCHXML_OPERATOR_MAP[filter.operator] || 'eq';
  const isNullCheck = ['null', 'not-null'].includes(operator);
  const lookupPath = parseLookupPath(filter.field);
  
  if (lookupPath) {
    const { lookupField, targetField } = lookupPath;
    const formattedValue = isNullCheck ? '' : formatFetchXmlValue(filter.value, filter.operator);
    
    if (isNullCheck) {
      return `${indent}<condition entityname="${lookupField}" attribute="${escapeXml(targetField)}" operator="${operator}" />`;
    }
    return `${indent}<condition entityname="${lookupField}" attribute="${escapeXml(targetField)}" operator="${operator}" value="${escapeXml(formattedValue)}" />`;
  }
  
  if (isNullCheck) {
    return `${indent}<condition attribute="${escapeXml(filter.field)}" operator="${operator}" />`;
  }
  
  const formattedValue = formatFetchXmlValue(filter.value, filter.operator);
  return `${indent}<condition attribute="${escapeXml(filter.field)}" operator="${operator}" value="${escapeXml(formattedValue)}" />`;
};

const generateFetchFilterGroup = (group: DynamicValueFilterGroup, indent = '      '): string => {
  const filterType = group.matchType.toLowerCase();
  const lines: string[] = [];
  
  lines.push(`${indent}<filter type="${filterType}">`);
  
  for (const child of group.children) {
    if (child.type === 'filter' && child.field) {
      lines.push(generateFetchCondition(child, `${indent}  `));
    } else if (child.type === 'group') {
      lines.push(generateFetchFilterGroup(child, `${indent}  `));
    }
  }
  
  lines.push(`${indent}</filter>`);
  return lines.join('\n');
};

export interface FetchXmlOptions {
  top?: number;
  count?: boolean;
  distinct?: boolean;
}

export const generateFetchXml = (config: DynamicValueConfig, options: FetchXmlOptions = {}): string => {
  const entity = getEntityByLogicalName(config.tableName);
  if (!entity) {
    throw new Error(`Entity '${config.tableName}' not found`);
  }

  const { top = 5000, count = false, distinct = false } = options;
  const lines: string[] = [];
  
  let fetchAttrs = '';
  if (top) fetchAttrs += ` top="${top}"`;
  if (count) fetchAttrs += ` count="true"`;
  if (distinct) fetchAttrs += ` distinct="true"`;
  
  lines.push(`<fetch${fetchAttrs}>`);
  lines.push(`  <entity name="${config.tableName}">`);
  
  if (config.labelField) {
    lines.push(`    <attribute name="${config.labelField}" />`);
  }
  if (config.valueField && config.valueField !== config.labelField) {
    lines.push(`    <attribute name="${config.valueField}" />`);
  }
  
  if (config.orderByField) {
    const descending = config.orderDirection === 'desc' ? ' descending="true"' : '';
    lines.push(`    <order attribute="${config.orderByField}"${descending} />`);
  }
  
  const conditionGroup = config.conditionGroup || config.filterGroup;
  if (conditionGroup && conditionGroup.children.length > 0) {
    lines.push(generateFetchFilterGroup(conditionGroup, '    '));
  }
  
  lines.push(`  </entity>`);
  lines.push(`</fetch>`);
  
  return lines.join('\n');
};

// ============================================================================
// OData Generator
// ============================================================================

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

const generateODataCondition = (filter: DynamicValueFilter): string => {
  const mapping = ODATA_OPERATOR_MAP[filter.operator] || { type: 'operator', value: 'eq' };
  let field = filter.field;
  const value = filter.value;
  
  const lookupPath = parseLookupPath(filter.field);
  if (lookupPath) {
    field = `${lookupPath.lookupField}/${lookupPath.targetField}`;
  }
  
  if (mapping.value === 'eq null') return `${field} eq null`;
  if (mapping.value === 'ne null') return `${field} ne null`;
  
  if (mapping.type === 'function') {
    if (mapping.value === 'not contains') {
      return `not contains(${field},'${value}')`;
    }
    return `${mapping.value}(${field},'${value}')`;
  }
  
  const numericValue = Number(value);
  const isNumeric = !isNaN(numericValue) && value.trim() !== '';
  const isBool = value.toLowerCase() === 'true' || value.toLowerCase() === 'false';
  
  if (isNumeric) {
    return `${field} ${mapping.value} ${numericValue}`;
  } else if (isBool) {
    return `${field} ${mapping.value} ${value.toLowerCase()}`;
  } else {
    return `${field} ${mapping.value} '${value}'`;
  }
};

const generateODataFilterExpression = (group: DynamicValueFilterGroup): string => {
  const connector = group.matchType.toLowerCase() === 'or' ? ' or ' : ' and ';
  const expressions: string[] = [];
  
  for (const child of group.children) {
    if (child.type === 'filter' && child.field) {
      expressions.push(generateODataCondition(child));
    } else if (child.type === 'group') {
      const nestedExpr = generateODataFilterExpression(child);
      if (nestedExpr) {
        expressions.push(`(${nestedExpr})`);
      }
    }
  }
  
  return expressions.join(connector);
};

export const generateFormattedOData = (config: DynamicValueConfig): string => {
  const lines: string[] = [];
  lines.push(`/${config.tableName}s`);
  
  const queryParts: string[] = [];
  
  const selectFields: string[] = [];
  if (config.labelField) selectFields.push(config.labelField);
  if (config.valueField && config.valueField !== config.labelField) {
    selectFields.push(config.valueField);
  }
  if (selectFields.length > 0) {
    queryParts.push(`  $select=${selectFields.join(',')}`);
  }
  
  const conditionGroup = config.conditionGroup || config.filterGroup;
  if (conditionGroup && conditionGroup.children.length > 0) {
    const filterExpr = generateODataFilterExpression(conditionGroup);
    if (filterExpr) {
      queryParts.push(`  $filter=${filterExpr}`);
    }
  }
  
  if (config.orderByField) {
    queryParts.push(`  $orderby=${config.orderByField} ${config.orderDirection || 'asc'}`);
  }
  
  if (queryParts.length > 0) {
    lines.push('?' + queryParts.join('\n  &'));
  }
  
  return lines.join('\n');
};
