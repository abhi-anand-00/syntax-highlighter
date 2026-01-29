/**
 * Metadata Discovery Service for PCF Controls
 *
 * Provides real-time entity and attribute metadata discovery from Dataverse.
 * This service fetches all metadata dynamically - NO hardcoded configurations.
 *
 * When deployed to Dataverse, this uses the actual Xrm.WebApi and Xrm.Utility APIs.
 */

import {
  BaseDataverseService,
  type BaseServiceConfig,
} from "./BaseDataverseService";
import type {
  IPCFContext,
  DataverseResult,
  EntityMetadata,
  AttributeMetadata,
} from "./types";

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
  async discoverEntities(
    forceRefresh = false,
  ): Promise<DataverseResult<EntityInfo[]>> {
    // Check cache
    if (
      !forceRefresh &&
      this._entitiesCache &&
      Date.now() - this._entitiesCacheTime < this._cacheValidityMs
    ) {
      this._logger.debug("Using cached entities list");
      return this.success(this._entitiesCache);
    }

    return this.execute<EntityInfo[]>(
      "retrieveMultiple",
      "EntityDefinitions",
      async () => {
        const clientUrl = Xrm.Utility.getGlobalContext().getClientUrl();

        const query =
          "/api/data/v9.2/EntityDefinitions?" +
          "$select=LogicalName,DisplayName,DisplayCollectionName,EntitySetName," +
          "PrimaryIdAttribute,PrimaryNameAttribute,IsCustomizable,IsValidForAdvancedFind" +
          "&$filter=IsValidForAdvancedFind eq true";

        const entities = await new Promise<EntityInfo[]>((resolve, reject) => {
          const req = new XMLHttpRequest();
          req.open("GET", clientUrl + query, true);
          req.setRequestHeader("OData-MaxVersion", "4.0");
          req.setRequestHeader("OData-Version", "4.0");
          req.setRequestHeader("Accept", "application/json");
          req.setRequestHeader(
            "Content-Type",
            "application/json; charset=utf-8",
          );

          req.onreadystatechange = () => {
            if (req.readyState !== 4) return;

            req.onreadystatechange = null;

            if (req.status === 200) {
              const response = JSON.parse(req.responseText);
              const records = response.value || [];

              const mapped: EntityInfo[] = records.map((e: any) => ({
                logicalName: String(e.LogicalName || ""),
                displayName: this.extractLocalizedLabel(e.DisplayName),
                displayCollectionName: this.extractLocalizedLabel(
                  e.DisplayCollectionName,
                ),
                entitySetName: String(e.EntitySetName || ""),
                primaryIdAttribute: String(e.PrimaryIdAttribute || ""),
                primaryNameAttribute: String(e.PrimaryNameAttribute || ""),
                isCustomizable: Boolean(
                  e.IsCustomizable?.Value ?? e.IsCustomizable,
                ),
                isValidForAdvancedFind: Boolean(e.IsValidForAdvancedFind),
              }));

              // Sort by display name
              mapped.sort((a, b) => a.displayName.localeCompare(b.displayName));

              // Cache results
              this._entitiesCache = mapped;
              this._entitiesCacheTime = Date.now();

              resolve(mapped);
            } else {
              reject(new Error(req.statusText));
            }
          };

          req.send();
        });

        return entities;
      },
    );
  }

  /**
   * Get entity metadata with attributes (fields) using Metadata Web API + $expand=Attributes
   */
  async getEntityWithFields(
    entityName: string,
  ): Promise<DataverseResult<EntityWithFields>> {
    return this.execute<EntityWithFields>(
      "retrieve",
      "EntityDefinitions",
      async () => {
        const clientUrl = Xrm.Utility.getGlobalContext().getClientUrl();

        // IMPORTANT: entityName must be logical name (e.g. "account", "contact", "new_policy")
        const safeEntityName = String(entityName || "").replace(/'/g, "''");

        const query =
          `/api/data/v9.2/EntityDefinitions(LogicalName='${safeEntityName}')?` +
          `$select=LogicalName,DisplayName,DisplayCollectionName,EntitySetName,` +
          `PrimaryIdAttribute,PrimaryNameAttribute,IsCustomizable,IsValidForAdvancedFind` +
          `&$expand=Attributes(` +
          `$select=LogicalName,DisplayName,AttributeType,IsPrimaryId,IsPrimaryName,RequiredLevel,AttributeOf` +
          // If you need OptionSets, add:
          // `,OptionSet`  (some orgs need specific expand/shape; see note below)
          `)`;

        const result = await new Promise<any>((resolve, reject) => {
          const req = new XMLHttpRequest();
          req.open("GET", clientUrl + query, true);
          req.setRequestHeader("OData-MaxVersion", "4.0");
          req.setRequestHeader("OData-Version", "4.0");
          req.setRequestHeader("Accept", "application/json");
          req.setRequestHeader(
            "Content-Type",
            "application/json; charset=utf-8",
          );

          req.onreadystatechange = () => {
            if (req.readyState !== 4) return;
            req.onreadystatechange = null;

            if (req.status === 200) {
              resolve(JSON.parse(req.responseText));
            } else {
              reject(
                new Error(
                  req.responseText || req.statusText || `HTTP ${req.status}`,
                ),
              );
            }
          };

          req.send();
        });

        // Map entity info
        const entityInfo: EntityInfo = {
          logicalName: String(result.LogicalName || ""),
          displayName:
            this.extractLocalizedLabel(result.DisplayName) ||
            String(result.LogicalName || ""),
          displayCollectionName:
            this.extractLocalizedLabel(result.DisplayCollectionName) ||
            this.extractLocalizedLabel(result.DisplayName) ||
            String(result.EntitySetName || ""),
          entitySetName: String(result.EntitySetName || ""),
          primaryIdAttribute: String(result.PrimaryIdAttribute || ""),
          primaryNameAttribute: String(result.PrimaryNameAttribute || ""),
          isCustomizable: Boolean(
            result.IsCustomizable?.Value ?? result.IsCustomizable,
          ),
          isValidForAdvancedFind: Boolean(result.IsValidForAdvancedFind),
        };

        const attrs: any[] = result.Attributes || [];

        // Map fields
        const fields: FieldInfo[] = attrs
          // (optional) filter out "AttributeOf" (these are often partylist/virtual backing etc.)
          .filter((a) => !a.AttributeOf)
          .map((attr: any) => ({
            logicalName: String(attr.LogicalName || ""),
            displayName:
              this.extractLocalizedLabel(attr.DisplayName) ||
              String(attr.LogicalName || ""),
            type: this.mapAttributeType(attr.AttributeType),
            isPrimaryId: Boolean(attr.IsPrimaryId),
            isPrimaryName: Boolean(attr.IsPrimaryName),
            isRequired:
              attr.RequiredLevel === "ApplicationRequired" ||
              attr.RequiredLevel === "SystemRequired",
            lookupTarget: Array.isArray(attr.Targets)
              ? attr.Targets[0]
              : undefined,

            // NOTE: OptionSet shape differs based on API response.
            // Keep this safe and defensive:
            optionSetOptions: this.mapOptionSetOptions(attr),
          }));

        // Sort fields by display name
        fields.sort((a, b) =>
          (a.displayName || "").localeCompare(b.displayName || ""),
        );

        return { entity: entityInfo, fields };
      },
    );
  }

  /**
   * Defensive OptionSet mapper for Metadata Web API responses
   */
  private mapOptionSetOptions(
    attr: any,
  ): { value: number; label: string }[] | undefined {
    const os = attr?.OptionSet;
    const options = os?.Options;

    if (!Array.isArray(options)) return undefined;

    return options.map((o: any) => ({
      value: Number(o.Value),
      label: this.extractLocalizedLabel(o.Label) || String(o.Value),
    }));
  }

  /**
   * Get fields for a specific entity (simpler version)
   */
  async getEntityFields(
    entityName: string,
  ): Promise<DataverseResult<FieldInfo[]>> {
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
    lookupFieldName: string,
  ): Promise<
    DataverseResult<{ targetEntity: string; fields: FieldInfo[] } | null>
  > {
    return this.execute("metadata", entityName, async () => {
      // First get the source entity to find lookup target
      const metadata = await this.utility.getEntityMetadata(entityName);
      const lookupAttr = metadata.Attributes?.find(
        (a: AttributeMetadata) => a.LogicalName === lookupFieldName,
      );

      if (!lookupAttr?.Targets?.[0]) {
        return null;
      }

      const targetEntity = lookupAttr.Targets[0];

      // Get target entity fields
      const targetMetadata = await this.utility.getEntityMetadata(targetEntity);
      const fields: FieldInfo[] = (targetMetadata.Attributes || []).map(
        (attr: AttributeMetadata) => ({
          logicalName: attr.LogicalName,
          displayName: attr.DisplayName || attr.LogicalName,
          type: this.mapAttributeType(attr.AttributeType),
          isPrimaryId: attr.IsPrimaryId,
          isPrimaryName: attr.IsPrimaryName,
          isRequired: attr.RequiredLevel === "ApplicationRequired",
          lookupTarget: attr.Targets?.[0],
        }),
      );

      fields.sort((a, b) => a.displayName.localeCompare(b.displayName));

      return { targetEntity, fields };
    });
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Extract localized label from Dataverse label structure
   */
  private extractLocalizedLabel(labelObj: unknown): string {
    if (!labelObj) return "";
    if (typeof labelObj === "string") return labelObj;

    // Dataverse returns { LocalizedLabels: [{ Label, LanguageCode }], UserLocalizedLabel: { Label } }
    const obj = labelObj as Record<string, unknown>;
    if (obj.UserLocalizedLabel && typeof obj.UserLocalizedLabel === "object") {
      const userLabel = obj.UserLocalizedLabel as Record<string, unknown>;
      if (userLabel.Label) return String(userLabel.Label);
    }
    if (Array.isArray(obj.LocalizedLabels) && obj.LocalizedLabels.length > 0) {
      return String(obj.LocalizedLabels[0].Label || "");
    }
    return "";
  }

  /**
   * Map Dataverse attribute type to simplified type
   */
  private mapAttributeType(attrType: string): string {
    const typeMap: Record<string, string> = {
      String: "string",
      Memo: "string",
      Integer: "number",
      BigInt: "number",
      Double: "decimal",
      Decimal: "decimal",
      Money: "currency",
      Boolean: "boolean",
      DateTime: "datetime",
      Lookup: "lookup",
      Customer: "lookup",
      Owner: "lookup",
      Picklist: "optionset",
      State: "optionset",
      Status: "optionset",
      MultiSelectPicklist: "multiselect",
      Uniqueidentifier: "guid",
    };
    return typeMap[attrType] || "string";
  }

  /**
   * Clear entities cache
   */
  clearEntitiesCache(): void {
    this._entitiesCache = null;
    this._entitiesCacheTime = 0;
    this._logger.debug("Entities cache cleared");
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createMetadataService(
  context: IPCFContext | unknown,
  config?: BaseServiceConfig,
): MetadataService {
  return new MetadataService(context, config);
}
