/**
 * Metadata Discovery Service for PCF Controls
 * 
 * Provides real-time entity and attribute metadata discovery from Dataverse.
 * This service fetches all metadata dynamically - NO hardcoded configurations.
 * 
 * When deployed to Dataverse, this uses the actual Xrm.WebApi and Xrm.Utility APIs.
 */

import { BaseDataverseService, type BaseServiceConfig } from './BaseDataverseService';
import type {
  IPCFContext,
  DataverseResult,
  EntityMetadata,
  AttributeMetadata,
} from './types';

// ============================================================================
// Extended Metadata Types
// ============================================================================

/**
 * Simplified entity info from EntityDefinitions query
 */
export interface EntityInfo {
  logicalName: string;
  displayName: string;
  displayCollectionName: string;
  entitySetName: string;
  primaryIdAttribute: string;
  primaryNameAttribute: string;
  isCustomizable: boolean;
  isValidForAdvancedFind: boolean;
}

/**
 * Field info for UI display
 */
export interface FieldInfo {
  logicalName: string;
  displayName: string;
  type: string;
  isPrimaryId: boolean;
  isPrimaryName: boolean;
  isRequired: boolean;
  lookupTarget?: string;
  optionSetOptions?: { value: number; label: string }[];
}

/**
 * Entity with fields for dropdown configuration
 */
export interface EntityWithFields {
  entity: EntityInfo;
  fields: FieldInfo[];
}

// ============================================================================
// Metadata Service Implementation
// ============================================================================

export class MetadataService extends BaseDataverseService {
  // Cache for entities list
  private _entitiesCache: EntityInfo[] | null = null;
  private _entitiesCacheTime = 0;
  private readonly _cacheValidityMs = 5 * 60 * 1000; // 5 minutes

  constructor(context: IPCFContext | unknown, config?: BaseServiceConfig) {
    super(context, config);
  }

  // ============================================================================
  // Entity Discovery
  // ============================================================================

  /**
   * Discover all available entities from Dataverse
   * Queries EntityDefinitions to get the list of tables
   */
  async discoverEntities(forceRefresh = false): Promise<DataverseResult<EntityInfo[]>> {
    // Check cache
    if (!forceRefresh && this._entitiesCache && Date.now() - this._entitiesCacheTime < this._cacheValidityMs) {
      this._logger.debug('Using cached entities list');
      return this.success(this._entitiesCache);
    }

    return this.execute<EntityInfo[]>(
      'retrieveMultiple',
      'EntityDefinition',
      async () => {
        // Query EntityDefinitions via WebAPI
        const response = await this.webApi.retrieveMultipleRecords(
          'EntityDefinition',
          '?$select=LogicalName,DisplayName,DisplayCollectionName,EntitySetName,' +
          'PrimaryIdAttribute,PrimaryNameAttribute,IsCustomizable,IsValidForAdvancedFind' +
          '&$filter=IsValidForAdvancedFind eq true'
        );

        const entities: EntityInfo[] = response.entities.map((e: Record<string, unknown>) => ({
          logicalName: String(e.LogicalName || ''),
          displayName: this.extractLocalizedLabel(e.DisplayName),
          displayCollectionName: this.extractLocalizedLabel(e.DisplayCollectionName),
          entitySetName: String(e.EntitySetName || ''),
          primaryIdAttribute: String(e.PrimaryIdAttribute || ''),
          primaryNameAttribute: String(e.PrimaryNameAttribute || ''),
          isCustomizable: Boolean(e.IsCustomizable),
          isValidForAdvancedFind: Boolean(e.IsValidForAdvancedFind),
        }));

        // Sort by display name
        entities.sort((a, b) => a.displayName.localeCompare(b.displayName));

        // Cache the result
        this._entitiesCache = entities;
        this._entitiesCacheTime = Date.now();

        return entities;
      }
    );
  }

  /**
   * Get entity metadata with attributes
   */
  async getEntityWithFields(entityName: string): Promise<DataverseResult<EntityWithFields>> {
    return this.execute<EntityWithFields>(
      'metadata',
      entityName,
      async () => {
        // Get entity metadata
        const metadata = await this.utility.getEntityMetadata(entityName);

        const entityInfo: EntityInfo = {
          logicalName: metadata.LogicalName,
          displayName: metadata.DisplayName || metadata.LogicalName,
          displayCollectionName: metadata.EntitySetName,
          entitySetName: metadata.EntitySetName,
          primaryIdAttribute: metadata.PrimaryIdAttribute,
          primaryNameAttribute: metadata.PrimaryNameAttribute,
          isCustomizable: true,
          isValidForAdvancedFind: true,
        };

        // Convert attributes to field info
        const fields: FieldInfo[] = (metadata.Attributes || []).map((attr: AttributeMetadata) => ({
          logicalName: attr.LogicalName,
          displayName: attr.DisplayName || attr.LogicalName,
          type: this.mapAttributeType(attr.AttributeType),
          isPrimaryId: attr.IsPrimaryId,
          isPrimaryName: attr.IsPrimaryName,
          isRequired: attr.RequiredLevel === 'ApplicationRequired' || attr.RequiredLevel === 'SystemRequired',
          lookupTarget: attr.Targets?.[0],
          optionSetOptions: attr.OptionSet?.map(opt => ({
            value: opt.Value,
            label: opt.Label,
          })),
        }));

        // Sort fields by display name
        fields.sort((a, b) => a.displayName.localeCompare(b.displayName));

        return { entity: entityInfo, fields };
      }
    );
  }

  /**
   * Get fields for a specific entity (simpler version)
   */
  async getEntityFields(entityName: string): Promise<DataverseResult<FieldInfo[]>> {
    const result = await this.getEntityWithFields(entityName);
    if (!result.success) {
      return this.failure(result.error);
    }
    return this.success(result.data.fields);
  }

  /**
   * Get lookup target entity fields (for related field filtering)
   */
  async getLookupTargetFields(
    entityName: string,
    lookupFieldName: string
  ): Promise<DataverseResult<{ targetEntity: string; fields: FieldInfo[] } | null>> {
    return this.execute(
      'metadata',
      entityName,
      async () => {
        // First get the source entity to find lookup target
        const metadata = await this.utility.getEntityMetadata(entityName);
        const lookupAttr = metadata.Attributes?.find(
          (a: AttributeMetadata) => a.LogicalName === lookupFieldName
        );

        if (!lookupAttr?.Targets?.[0]) {
          return null;
        }

        const targetEntity = lookupAttr.Targets[0];

        // Get target entity fields
        const targetMetadata = await this.utility.getEntityMetadata(targetEntity);
        const fields: FieldInfo[] = (targetMetadata.Attributes || []).map((attr: AttributeMetadata) => ({
          logicalName: attr.LogicalName,
          displayName: attr.DisplayName || attr.LogicalName,
          type: this.mapAttributeType(attr.AttributeType),
          isPrimaryId: attr.IsPrimaryId,
          isPrimaryName: attr.IsPrimaryName,
          isRequired: attr.RequiredLevel === 'ApplicationRequired',
          lookupTarget: attr.Targets?.[0],
        }));

        fields.sort((a, b) => a.displayName.localeCompare(b.displayName));

        return { targetEntity, fields };
      }
    );
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Extract localized label from Dataverse label structure
   */
  private extractLocalizedLabel(labelObj: unknown): string {
    if (!labelObj) return '';
    if (typeof labelObj === 'string') return labelObj;

    // Dataverse returns { LocalizedLabels: [{ Label, LanguageCode }], UserLocalizedLabel: { Label } }
    const obj = labelObj as Record<string, unknown>;
    if (obj.UserLocalizedLabel && typeof obj.UserLocalizedLabel === 'object') {
      const userLabel = obj.UserLocalizedLabel as Record<string, unknown>;
      if (userLabel.Label) return String(userLabel.Label);
    }
    if (Array.isArray(obj.LocalizedLabels) && obj.LocalizedLabels.length > 0) {
      return String(obj.LocalizedLabels[0].Label || '');
    }
    return '';
  }

  /**
   * Map Dataverse attribute type to simplified type
   */
  private mapAttributeType(attrType: string): string {
    const typeMap: Record<string, string> = {
      'String': 'string',
      'Memo': 'string',
      'Integer': 'number',
      'BigInt': 'number',
      'Double': 'decimal',
      'Decimal': 'decimal',
      'Money': 'currency',
      'Boolean': 'boolean',
      'DateTime': 'datetime',
      'Lookup': 'lookup',
      'Customer': 'lookup',
      'Owner': 'lookup',
      'Picklist': 'optionset',
      'State': 'optionset',
      'Status': 'optionset',
      'MultiSelectPicklist': 'multiselect',
      'Uniqueidentifier': 'guid',
    };
    return typeMap[attrType] || 'string';
  }

  /**
   * Clear entities cache
   */
  clearEntitiesCache(): void {
    this._entitiesCache = null;
    this._entitiesCacheTime = 0;
    this._logger.debug('Entities cache cleared');
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createMetadataService(
  context: IPCFContext | unknown,
  config?: BaseServiceConfig
): MetadataService {
  return new MetadataService(context, config);
}
