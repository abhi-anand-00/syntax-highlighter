/**
 * Dynamic Values Service for PCF Controls
 * 
 * Provides real-time data fetching for dropdown options from Dataverse.
 * This service executes queries based on Dynamic Value configurations.
 * 
 * NO hardcoded data - all values fetched from live Dataverse environment.
 */

import { BaseDataverseService, type BaseServiceConfig } from './BaseDataverseService';
import type { IPCFContext, DataverseResult, QueryResult } from './types';
import type { DynamicValueConfig, DynamicValueFilterGroup, DynamicValueFilter } from '../../../types/questionnaire';

// ============================================================================
// Types
// ============================================================================

/**
 * Dropdown option returned from dynamic values query
 */
export interface DropdownOption {
  value: string;
  label: string;
  record?: Record<string, unknown>;
}

/**
 * Query execution options
 */
export interface ExecuteQueryOptions {
  /** Maximum records to return */
  maxRecords?: number;
  /** Additional OData filter to append */
  additionalFilter?: string;
  /** Search text for quick filtering */
  searchText?: string;
}

// ============================================================================
// Dynamic Values Service Implementation
// ============================================================================

export class DynamicValuesService extends BaseDataverseService {
  constructor(context: IPCFContext | unknown, config?: BaseServiceConfig) {
    super(context, config);
  }

  // ============================================================================
  // Query Execution
  // ============================================================================

  /**
   * Execute a dynamic values query and return dropdown options
   */
  async executeQuery(
    config: DynamicValueConfig,
    options?: ExecuteQueryOptions
  ): Promise<DataverseResult<DropdownOption[]>> {
    const { tableName, labelField, valueField, conditionGroup, orderByField, orderDirection } = config;

    if (!tableName || !labelField || !valueField) {
      return this.failure({
        code: 'INVALID_ARGUMENT',
        message: 'Missing required configuration: tableName, labelField, or valueField',
        userMessage: 'Invalid dynamic values configuration',
        isRetryable: false,
      });
    }

    return this.execute<DropdownOption[]>(
      'retrieveMultiple',
      tableName,
      async () => {
        // Build OData query string
        const queryString = this.buildODataQuery(config, options);
        
        // Execute query
        const maxPageSize = options?.maxRecords || 500;
        const response = await this.webApi.retrieveMultipleRecords(
          tableName,
          queryString,
          maxPageSize
        );

        // Map to dropdown options
        const dropdownOptions: DropdownOption[] = response.entities.map((record: Record<string, unknown>) => ({
          value: String(record[valueField] || ''),
          label: String(record[labelField] || ''),
          record,
        }));

        return dropdownOptions;
      }
    );
  }

  /**
   * Execute query and return raw records
   */
  async executeQueryRaw<T = Record<string, unknown>>(
    config: DynamicValueConfig,
    options?: ExecuteQueryOptions
  ): Promise<DataverseResult<QueryResult<T>>> {
    const { tableName } = config;

    if (!tableName) {
      return this.failure({
        code: 'INVALID_ARGUMENT',
        message: 'Missing required configuration: tableName',
        userMessage: 'Invalid dynamic values configuration',
        isRetryable: false,
      });
    }

    return this.execute<QueryResult<T>>(
      'retrieveMultiple',
      tableName,
      async () => {
        const queryString = this.buildODataQuery(config, options);
        const maxPageSize = options?.maxRecords || 500;
        
        const response = await this.webApi.retrieveMultipleRecords(
          tableName,
          queryString,
          maxPageSize
        );

        return {
          entities: response.entities as T[],
          moreRecords: !!response.nextLink,
          nextLink: response.nextLink,
          pagingCookie: response.fetchXmlPagingCookie,
        };
      }
    );
  }

  // ============================================================================
  // OData Query Building
  // ============================================================================

  /**
   * Build OData query string from config
   */
  private buildODataQuery(config: DynamicValueConfig, options?: ExecuteQueryOptions): string {
    const parts: string[] = [];
    const { labelField, valueField, conditionGroup, orderByField, orderDirection } = config;

    // $select - include label and value fields at minimum
    const selectFields = new Set<string>();
    if (labelField) selectFields.add(labelField);
    if (valueField) selectFields.add(valueField);
    parts.push(`$select=${Array.from(selectFields).join(',')}`);

    // $filter - build from condition group + additional filters
    const filters: string[] = [];
    
    if (conditionGroup && conditionGroup.children.length > 0) {
      const groupFilter = this.buildFilterGroup(conditionGroup);
      if (groupFilter) filters.push(groupFilter);
    }

    if (options?.additionalFilter) {
      filters.push(options.additionalFilter);
    }

    if (options?.searchText && labelField) {
      filters.push(`contains(${labelField},'${this.escapeODataValue(options.searchText)}')`);
    }

    if (filters.length > 0) {
      parts.push(`$filter=${filters.join(' and ')}`);
    }

    // $orderby
    if (orderByField) {
      parts.push(`$orderby=${orderByField} ${orderDirection || 'asc'}`);
    }

    // $top
    if (options?.maxRecords) {
      parts.push(`$top=${options.maxRecords}`);
    }

    return parts.length > 0 ? `?${parts.join('&')}` : '';
  }

  /**
   * Build filter expression from condition group
   */
  private buildFilterGroup(group: DynamicValueFilterGroup): string {
    if (!group.children || group.children.length === 0) {
      return '';
    }

    const conditions: string[] = [];

    for (const child of group.children) {
      if (child.type === 'group') {
        const subFilter = this.buildFilterGroup(child);
        if (subFilter) {
          conditions.push(`(${subFilter})`);
        }
      } else {
        const filter = this.buildFilterCondition(child);
        if (filter) {
          conditions.push(filter);
        }
      }
    }

    if (conditions.length === 0) {
      return '';
    }

    const operator = group.matchType === 'OR' ? ' or ' : ' and ';
    return conditions.join(operator);
  }

  /**
   * Build single filter condition
   */
  private buildFilterCondition(filter: DynamicValueFilter): string {
    const { field, operator, value } = filter;
    
    if (!field) return '';

    // Check if this is a lookup path (e.g., "primarycontactid/fullname")
    const fieldPath = field;

    // Map ConditionOperator values to OData operators
    switch (operator) {
      case 'equals':
        return `${fieldPath} eq ${this.formatODataValue(value)}`;
      
      case 'not_equals':
        return `${fieldPath} ne ${this.formatODataValue(value)}`;
      
      case 'contains':
        return `contains(${fieldPath},${this.formatODataValue(value)})`;
      
      case 'not_contains':
        return `not contains(${fieldPath},${this.formatODataValue(value)})`;
      
      case 'starts_with':
        return `startswith(${fieldPath},${this.formatODataValue(value)})`;
      
      case 'ends_with':
        return `endswith(${fieldPath},${this.formatODataValue(value)})`;
      
      case 'greater_than':
        return `${fieldPath} gt ${this.formatODataValue(value)}`;
      
      case 'less_than':
        return `${fieldPath} lt ${this.formatODataValue(value)}`;
      
      case 'is_null':
        return `${fieldPath} eq null`;
      
      case 'is_not_null':
        return `${fieldPath} ne null`;
      
      default:
        return `${fieldPath} eq ${this.formatODataValue(value)}`;
    }
  }

  /**
   * Format value for OData query
   */
  private formatODataValue(value: string): string {
    if (value === '') return "''";
    
    // Check if it's a GUID
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
      return value; // GUIDs don't need quotes
    }
    
    // Check if it's a number
    if (!isNaN(Number(value)) && value.trim() !== '') {
      return value;
    }
    
    // Check if it's a boolean
    if (value === 'true' || value === 'false') {
      return value;
    }
    
    // Otherwise treat as string
    return `'${this.escapeODataValue(value)}'`;
  }

  /**
   * Escape special characters in OData string values
   */
  private escapeODataValue(value: string): string {
    return value.replace(/'/g, "''");
  }

  // ============================================================================
  // FetchXML Query Building
  // ============================================================================

  /**
   * Build FetchXML query from config (alternative to OData)
   */
  buildFetchXml(config: DynamicValueConfig, options?: { top?: number }): string {
    const { tableName, labelField, valueField, conditionGroup, orderByField, orderDirection } = config;
    
    let fetchXml = `<fetch top="${options?.top || 5000}">`;
    fetchXml += `<entity name="${tableName}">`;
    
    // Attributes
    if (labelField) fetchXml += `<attribute name="${labelField}" />`;
    if (valueField) fetchXml += `<attribute name="${valueField}" />`;
    
    // Filter conditions
    if (conditionGroup && conditionGroup.children.length > 0) {
      fetchXml += this.buildFetchXmlFilter(conditionGroup);
    }
    
    // Order
    if (orderByField) {
      fetchXml += `<order attribute="${orderByField}" descending="${orderDirection === 'desc'}" />`;
    }
    
    fetchXml += '</entity></fetch>';
    
    return fetchXml;
  }

  /**
   * Build FetchXML filter from condition group
   */
  private buildFetchXmlFilter(group: DynamicValueFilterGroup): string {
    if (!group.children || group.children.length === 0) {
      return '';
    }

    const filterType = group.matchType === 'OR' ? 'or' : 'and';
    let xml = `<filter type="${filterType}">`;

    for (const child of group.children) {
      if (child.type === 'group') {
        xml += this.buildFetchXmlFilter(child);
      } else {
        xml += this.buildFetchXmlCondition(child);
      }
    }

    xml += '</filter>';
    return xml;
  }

  /**
   * Build FetchXML condition
   */
  private buildFetchXmlCondition(filter: DynamicValueFilter): string {
    const { field, operator, value } = filter;
    
    if (!field) return '';

    // Handle lookup paths
    if (field.includes('/')) {
      return this.buildFetchXmlLinkCondition(field, operator, value);
    }

    const operatorMap: Record<string, string> = {
      'eq': 'eq',
      'equals': 'eq',
      'ne': 'ne',
      'not_equals': 'ne',
      'contains': 'like',
      'not_contains': 'not-like',
      'startswith': 'begins-with',
      'endswith': 'ends-with',
      'gt': 'gt',
      'ge': 'ge',
      'lt': 'lt',
      'le': 'le',
      'null': 'null',
      'not_null': 'not-null',
    };

    const fetchOp = operatorMap[operator] || 'eq';
    
    if (fetchOp === 'null' || fetchOp === 'not-null') {
      return `<condition attribute="${field}" operator="${fetchOp}" />`;
    }

    let conditionValue = value;
    if (fetchOp === 'like' || fetchOp === 'not-like') {
      conditionValue = `%${value}%`;
    }

    return `<condition attribute="${field}" operator="${fetchOp}" value="${this.escapeXmlValue(conditionValue)}" />`;
  }

  /**
   * Build FetchXML link-entity condition for lookup paths
   */
  private buildFetchXmlLinkCondition(path: string, operator: string, value: string): string {
    const parts = path.split('/');
    if (parts.length !== 2) return '';

    const [lookupField, targetField] = parts;
    
    // This would need entity metadata to properly build the link-entity
    // For now, return a comment indicating this needs dynamic resolution
    return `<!-- Link condition: ${lookupField}/${targetField} ${operator} ${value} - requires runtime metadata resolution -->`;
  }

  /**
   * Escape XML special characters
   */
  private escapeXmlValue(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createDynamicValuesService(
  context: IPCFContext,
  config?: BaseServiceConfig
): DynamicValuesService {
  return new DynamicValuesService(context, config);
}
