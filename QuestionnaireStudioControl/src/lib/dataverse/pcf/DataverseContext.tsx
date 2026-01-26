/**
 * Dataverse Context Provider
 * 
 * React context for PCF Dataverse services.
 * Provides access to MetadataService and DynamicValuesService throughout the app.
 * 
 * In development mode, uses mock implementations.
 * In production (deployed to Dataverse), uses real PCF context.
 */

import * as React from 'react';
import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef, type ReactNode } from 'react';
import { MetadataService, type EntityInfo, type FieldInfo } from './MetadataService';
import { DynamicValuesService, type DropdownOption } from './DynamicValuesService';
import { CrudService } from './CrudService';
import { QueryService } from './QueryService';
import type { IPCFContext, IPCFWebApi, IPCFUtility, EntityMetadata, AttributeMetadata, DataverseResult, CreateResult, EntityReference } from './types';
import type { DynamicValueConfig } from '../../../types/questionnaire';
import type { DataverseQuestionnaireRecord } from '../../QuestionnaireWrapper';

// ============================================================================
// Context Types
// ============================================================================

/** Metadata for questionnaire list display */
export interface QuestionnaireListItem {
  id: string;
  name: string;
  description?: string;
  status: string;
  version: string;
  schemaVersion: string;
  createdOn?: string;
  modifiedOn?: string;
}

export interface DataverseContextValue {
  /** Whether running in actual PCF environment */
  isPCFEnvironment: boolean;
  /** Whether context is initialized */
  isInitialized: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  
  // Entity discovery
  entities: EntityInfo[];
  loadEntities: () => Promise<void>;
  getEntityByName: (logicalName: string) => EntityInfo | undefined;
  
  // Field discovery
  getEntityFields: (entityName: string) => Promise<FieldInfo[]>;
  getLookupTargetFields: (entityName: string, lookupField: string) => Promise<{ targetEntity: string; fields: FieldInfo[] } | null>;
  
  // Dynamic values execution
  executeQuery: (config: DynamicValueConfig) => Promise<DropdownOption[]>;
  
  // Questionnaire CRUD operations
  createQuestionnaireRecord: (record: DataverseQuestionnaireRecord) => Promise<DataverseResult<CreateResult>>;
  updateQuestionnaireRecord: (recordId: string, record: Partial<DataverseQuestionnaireRecord>) => Promise<DataverseResult<EntityReference>>;
  deactivateQuestionnaireRecord: (recordId: string) => Promise<DataverseResult<EntityReference>>;
  listQuestionnairesFromDataverse: () => Promise<DataverseResult<QuestionnaireListItem[]>>;
  
  // Context update (for PCF lifecycle)
  updatePCFContext: (context: IPCFContext) => void;
}

// ============================================================================
// Mock Implementation for Development
// ============================================================================

/**
 * Create mock WebApi for development/preview
 */
function createMockWebApi(): IPCFWebApi {
  // Mock entity definitions for development
  const mockEntities: Record<string, unknown>[] = [
    { LogicalName: 'account', DisplayName: { UserLocalizedLabel: { Label: 'Account' } }, EntitySetName: 'accounts', PrimaryIdAttribute: 'accountid', PrimaryNameAttribute: 'name', IsValidForAdvancedFind: true },
    { LogicalName: 'contact', DisplayName: { UserLocalizedLabel: { Label: 'Contact' } }, EntitySetName: 'contacts', PrimaryIdAttribute: 'contactid', PrimaryNameAttribute: 'fullname', IsValidForAdvancedFind: true },
    { LogicalName: 'lead', DisplayName: { UserLocalizedLabel: { Label: 'Lead' } }, EntitySetName: 'leads', PrimaryIdAttribute: 'leadid', PrimaryNameAttribute: 'fullname', IsValidForAdvancedFind: true },
    { LogicalName: 'opportunity', DisplayName: { UserLocalizedLabel: { Label: 'Opportunity' } }, EntitySetName: 'opportunities', PrimaryIdAttribute: 'opportunityid', PrimaryNameAttribute: 'name', IsValidForAdvancedFind: true },
    { LogicalName: 'incident', DisplayName: { UserLocalizedLabel: { Label: 'Case' } }, EntitySetName: 'incidents', PrimaryIdAttribute: 'incidentid', PrimaryNameAttribute: 'title', IsValidForAdvancedFind: true },
    { LogicalName: 'systemuser', DisplayName: { UserLocalizedLabel: { Label: 'User' } }, EntitySetName: 'systemusers', PrimaryIdAttribute: 'systemuserid', PrimaryNameAttribute: 'fullname', IsValidForAdvancedFind: true },
    { LogicalName: 'team', DisplayName: { UserLocalizedLabel: { Label: 'Team' } }, EntitySetName: 'teams', PrimaryIdAttribute: 'teamid', PrimaryNameAttribute: 'name', IsValidForAdvancedFind: true },
    { LogicalName: 'product', DisplayName: { UserLocalizedLabel: { Label: 'Product' } }, EntitySetName: 'products', PrimaryIdAttribute: 'productid', PrimaryNameAttribute: 'name', IsValidForAdvancedFind: true },
    { LogicalName: 'queue', DisplayName: { UserLocalizedLabel: { Label: 'Queue' } }, EntitySetName: 'queues', PrimaryIdAttribute: 'queueid', PrimaryNameAttribute: 'name', IsValidForAdvancedFind: true },
    { LogicalName: 'businessunit', DisplayName: { UserLocalizedLabel: { Label: 'Business Unit' } }, EntitySetName: 'businessunits', PrimaryIdAttribute: 'businessunitid', PrimaryNameAttribute: 'name', IsValidForAdvancedFind: true },
  ];

  return {
    createRecord: async () => ({ id: crypto.randomUUID(), entityType: 'mock' }),
    retrieveRecord: async () => ({ id: crypto.randomUUID() }),
    updateRecord: async (entityType, id) => ({ id, entityType }),
    deleteRecord: async (entityType, id) => ({ id, entityType }),
    retrieveMultipleRecords: async (entityType) => {
      // Return mock entities list when querying EntityDefinition
      if (entityType === 'EntityDefinition') {
        return { entities: mockEntities };
      }
      // Return empty for other entities in development
      return { entities: [] };
    },
  };
}

/**
 * Create mock Utility for development/preview
 */
function createMockUtility(): IPCFUtility {
  // Mock field definitions per entity
  const mockFields: Record<string, AttributeMetadata[]> = {
    account: [
      { LogicalName: 'accountid', DisplayName: 'Account ID', AttributeType: 'Uniqueidentifier', IsPrimaryId: true, IsPrimaryName: false, RequiredLevel: 'SystemRequired' },
      { LogicalName: 'name', DisplayName: 'Account Name', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: true, RequiredLevel: 'ApplicationRequired', MaxLength: 160 },
      { LogicalName: 'accountnumber', DisplayName: 'Account Number', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None', MaxLength: 20 },
      { LogicalName: 'telephone1', DisplayName: 'Main Phone', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None' },
      { LogicalName: 'emailaddress1', DisplayName: 'Email', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None' },
      { LogicalName: 'address1_city', DisplayName: 'City', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None' },
      { LogicalName: 'revenue', DisplayName: 'Annual Revenue', AttributeType: 'Money', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None' },
      { LogicalName: 'numberofemployees', DisplayName: 'Number of Employees', AttributeType: 'Integer', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None' },
      { LogicalName: 'primarycontactid', DisplayName: 'Primary Contact', AttributeType: 'Lookup', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None', Targets: ['contact'] },
      { LogicalName: 'ownerid', DisplayName: 'Owner', AttributeType: 'Owner', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'SystemRequired', Targets: ['systemuser', 'team'] },
      { LogicalName: 'statecode', DisplayName: 'Status', AttributeType: 'State', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'SystemRequired' },
      { LogicalName: 'createdon', DisplayName: 'Created On', AttributeType: 'DateTime', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None' },
    ],
    contact: [
      { LogicalName: 'contactid', DisplayName: 'Contact ID', AttributeType: 'Uniqueidentifier', IsPrimaryId: true, IsPrimaryName: false, RequiredLevel: 'SystemRequired' },
      { LogicalName: 'fullname', DisplayName: 'Full Name', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: true, RequiredLevel: 'None' },
      { LogicalName: 'firstname', DisplayName: 'First Name', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'Recommended' },
      { LogicalName: 'lastname', DisplayName: 'Last Name', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'ApplicationRequired' },
      { LogicalName: 'emailaddress1', DisplayName: 'Email', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None' },
      { LogicalName: 'telephone1', DisplayName: 'Business Phone', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None' },
      { LogicalName: 'jobtitle', DisplayName: 'Job Title', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None' },
      { LogicalName: 'parentcustomerid', DisplayName: 'Company Name', AttributeType: 'Customer', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None', Targets: ['account'] },
      { LogicalName: 'ownerid', DisplayName: 'Owner', AttributeType: 'Owner', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'SystemRequired', Targets: ['systemuser', 'team'] },
    ],
    lead: [
      { LogicalName: 'leadid', DisplayName: 'Lead ID', AttributeType: 'Uniqueidentifier', IsPrimaryId: true, IsPrimaryName: false, RequiredLevel: 'SystemRequired' },
      { LogicalName: 'fullname', DisplayName: 'Full Name', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: true, RequiredLevel: 'None' },
      { LogicalName: 'firstname', DisplayName: 'First Name', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None' },
      { LogicalName: 'lastname', DisplayName: 'Last Name', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'ApplicationRequired' },
      { LogicalName: 'companyname', DisplayName: 'Company Name', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'Recommended' },
      { LogicalName: 'emailaddress1', DisplayName: 'Email', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None' },
      { LogicalName: 'budgetamount', DisplayName: 'Budget Amount', AttributeType: 'Money', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None' },
    ],
    opportunity: [
      { LogicalName: 'opportunityid', DisplayName: 'Opportunity ID', AttributeType: 'Uniqueidentifier', IsPrimaryId: true, IsPrimaryName: false, RequiredLevel: 'SystemRequired' },
      { LogicalName: 'name', DisplayName: 'Topic', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: true, RequiredLevel: 'ApplicationRequired' },
      { LogicalName: 'estimatedvalue', DisplayName: 'Est. Revenue', AttributeType: 'Money', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None' },
      { LogicalName: 'closeprobability', DisplayName: 'Probability', AttributeType: 'Integer', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None' },
      { LogicalName: 'customerid', DisplayName: 'Potential Customer', AttributeType: 'Customer', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None', Targets: ['account', 'contact'] },
    ],
    incident: [
      { LogicalName: 'incidentid', DisplayName: 'Case ID', AttributeType: 'Uniqueidentifier', IsPrimaryId: true, IsPrimaryName: false, RequiredLevel: 'SystemRequired' },
      { LogicalName: 'title', DisplayName: 'Case Title', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: true, RequiredLevel: 'ApplicationRequired' },
      { LogicalName: 'ticketnumber', DisplayName: 'Case Number', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None' },
      { LogicalName: 'customerid', DisplayName: 'Customer', AttributeType: 'Customer', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None', Targets: ['account', 'contact'] },
      { LogicalName: 'prioritycode', DisplayName: 'Priority', AttributeType: 'Picklist', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None' },
    ],
    systemuser: [
      { LogicalName: 'systemuserid', DisplayName: 'User ID', AttributeType: 'Uniqueidentifier', IsPrimaryId: true, IsPrimaryName: false, RequiredLevel: 'SystemRequired' },
      { LogicalName: 'fullname', DisplayName: 'Full Name', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: true, RequiredLevel: 'None' },
      { LogicalName: 'domainname', DisplayName: 'User Name', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'SystemRequired' },
      { LogicalName: 'internalemailaddress', DisplayName: 'Primary Email', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None' },
    ],
    team: [
      { LogicalName: 'teamid', DisplayName: 'Team ID', AttributeType: 'Uniqueidentifier', IsPrimaryId: true, IsPrimaryName: false, RequiredLevel: 'SystemRequired' },
      { LogicalName: 'name', DisplayName: 'Team Name', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: true, RequiredLevel: 'ApplicationRequired' },
    ],
    product: [
      { LogicalName: 'productid', DisplayName: 'Product ID', AttributeType: 'Uniqueidentifier', IsPrimaryId: true, IsPrimaryName: false, RequiredLevel: 'SystemRequired' },
      { LogicalName: 'name', DisplayName: 'Name', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: true, RequiredLevel: 'ApplicationRequired' },
      { LogicalName: 'productnumber', DisplayName: 'Product ID', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'ApplicationRequired' },
      { LogicalName: 'price', DisplayName: 'List Price', AttributeType: 'Money', IsPrimaryId: false, IsPrimaryName: false, RequiredLevel: 'None' },
    ],
    queue: [
      { LogicalName: 'queueid', DisplayName: 'Queue ID', AttributeType: 'Uniqueidentifier', IsPrimaryId: true, IsPrimaryName: false, RequiredLevel: 'SystemRequired' },
      { LogicalName: 'name', DisplayName: 'Name', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: true, RequiredLevel: 'ApplicationRequired' },
    ],
    businessunit: [
      { LogicalName: 'businessunitid', DisplayName: 'Business Unit ID', AttributeType: 'Uniqueidentifier', IsPrimaryId: true, IsPrimaryName: false, RequiredLevel: 'SystemRequired' },
      { LogicalName: 'name', DisplayName: 'Name', AttributeType: 'String', IsPrimaryId: false, IsPrimaryName: true, RequiredLevel: 'ApplicationRequired' },
    ],
  };

  const entityMetadata: Record<string, EntityMetadata> = {
    account: { LogicalName: 'account', EntitySetName: 'accounts', PrimaryIdAttribute: 'accountid', PrimaryNameAttribute: 'name', DisplayName: 'Account', Attributes: mockFields.account },
    contact: { LogicalName: 'contact', EntitySetName: 'contacts', PrimaryIdAttribute: 'contactid', PrimaryNameAttribute: 'fullname', DisplayName: 'Contact', Attributes: mockFields.contact },
    lead: { LogicalName: 'lead', EntitySetName: 'leads', PrimaryIdAttribute: 'leadid', PrimaryNameAttribute: 'fullname', DisplayName: 'Lead', Attributes: mockFields.lead },
    opportunity: { LogicalName: 'opportunity', EntitySetName: 'opportunities', PrimaryIdAttribute: 'opportunityid', PrimaryNameAttribute: 'name', DisplayName: 'Opportunity', Attributes: mockFields.opportunity },
    incident: { LogicalName: 'incident', EntitySetName: 'incidents', PrimaryIdAttribute: 'incidentid', PrimaryNameAttribute: 'title', DisplayName: 'Case', Attributes: mockFields.incident },
    systemuser: { LogicalName: 'systemuser', EntitySetName: 'systemusers', PrimaryIdAttribute: 'systemuserid', PrimaryNameAttribute: 'fullname', DisplayName: 'User', Attributes: mockFields.systemuser },
    team: { LogicalName: 'team', EntitySetName: 'teams', PrimaryIdAttribute: 'teamid', PrimaryNameAttribute: 'name', DisplayName: 'Team', Attributes: mockFields.team },
    product: { LogicalName: 'product', EntitySetName: 'products', PrimaryIdAttribute: 'productid', PrimaryNameAttribute: 'name', DisplayName: 'Product', Attributes: mockFields.product },
    queue: { LogicalName: 'queue', EntitySetName: 'queues', PrimaryIdAttribute: 'queueid', PrimaryNameAttribute: 'name', DisplayName: 'Queue', Attributes: mockFields.queue },
    businessunit: { LogicalName: 'businessunit', EntitySetName: 'businessunits', PrimaryIdAttribute: 'businessunitid', PrimaryNameAttribute: 'name', DisplayName: 'Business Unit', Attributes: mockFields.businessunit },
  };

  return {
    getEntityMetadata: async (entityName) => {
      const metadata = entityMetadata[entityName];
      if (!metadata) {
        throw new Error(`Entity ${entityName} not found`);
      }
      return metadata;
    },
  };
}

/**
 * Check if running in PCF environment
 */
function detectPCFEnvironment(): boolean {
  // In a real PCF control, Xrm would be available on window
  return typeof window !== 'undefined' && 'Xrm' in window;
}

// ============================================================================
// Context Implementation
// ============================================================================

const DataverseContext = createContext<DataverseContextValue | null>(null);

export interface DataverseProviderProps {
  /** 
   * Children to render. Optional when using React.createElement() 
   * since children are passed as the third argument.
   */
  children?: ReactNode;
  /** 
   * Optional PCF context (ComponentFramework.Context<IInputs>).
   * Accepts 'unknown' to avoid type conflicts with PCF's complex context type.
   * The provider extracts webAPI and utils internally.
   */
  pcfContext?: unknown;
}

export function DataverseProvider({ children, pcfContext }: DataverseProviderProps) {
  const [isPCFEnvironment] = useState(() => detectPCFEnvironment());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entities, setEntities] = useState<EntityInfo[]>([]);
  const [fieldsCache, setFieldsCache] = useState<Map<string, FieldInfo[]>>(new Map());

  // Services
  const [metadataService, setMetadataService] = useState<MetadataService | null>(null);
  const [dynamicValuesService, setDynamicValuesService] = useState<DynamicValuesService | null>(null);
  
  // Store the current PCF context for CRUD operations
  const pcfContextRef = useRef<IPCFContext | null>(null);

  // Initialize services
  useEffect(() => {
    let context: IPCFContext;

    if (pcfContext) {
      // Extract webAPI and utils from the PCF context
      // ComponentFramework.Context has these properties but with different type signatures
      const ctx = pcfContext as { webAPI?: unknown; utils?: unknown };
      if (ctx.webAPI && ctx.utils) {
        context = {
          webAPI: ctx.webAPI as IPCFWebApi,
          utils: ctx.utils as IPCFUtility,
        };
      } else {
        // Fallback to mock if properties not found
        context = {
          webAPI: createMockWebApi(),
          utils: createMockUtility(),
        };
      }
    } else if (isPCFEnvironment) {
      // Use real Xrm context
      const xrm = (window as unknown as { Xrm: { WebApi: IPCFWebApi; Utility: IPCFUtility } }).Xrm;
      context = {
        webAPI: xrm.WebApi,
        utils: xrm.Utility,
      };
    } else {
      // Development mode - use mock
      context = {
        webAPI: createMockWebApi(),
        utils: createMockUtility(),
      };
    }

    pcfContextRef.current = context;
    setMetadataService(new MetadataService(context));
    setDynamicValuesService(new DynamicValuesService(context));
    setIsInitialized(true);
  }, [isPCFEnvironment, pcfContext]);

  // Load entities
  const loadEntities = useCallback(async () => {
    if (!metadataService) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await metadataService.discoverEntities();
      if (result.success) {
        setEntities(result.data);
      } else {
        setError(result.error.userMessage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entities');
    } finally {
      setIsLoading(false);
    }
  }, [metadataService]);

  // Auto-load entities on init
  useEffect(() => {
    if (isInitialized && entities.length === 0) {
      loadEntities();
    }
  }, [isInitialized, entities.length, loadEntities]);

  // Get entity by name
  const getEntityByName = useCallback((logicalName: string) => {
    return entities.find(e => e.logicalName === logicalName);
  }, [entities]);

  // Get entity fields
  const getEntityFields = useCallback(async (entityName: string): Promise<FieldInfo[]> => {
    // Check cache
    const cached = fieldsCache.get(entityName);
    if (cached) return cached;

    if (!metadataService) return [];

    const result = await metadataService.getEntityFields(entityName);
    if (result.success) {
      setFieldsCache(prev => new Map(prev).set(entityName, result.data));
      return result.data;
    }
    return [];
  }, [metadataService, fieldsCache]);

  // Get lookup target fields
  const getLookupTargetFields = useCallback(async (
    entityName: string,
    lookupField: string
  ): Promise<{ targetEntity: string; fields: FieldInfo[] } | null> => {
    if (!metadataService) return null;

    const result = await metadataService.getLookupTargetFields(entityName, lookupField);
    return result.success ? result.data : null;
  }, [metadataService]);

  // Execute query
  const executeQuery = useCallback(async (config: DynamicValueConfig): Promise<DropdownOption[]> => {
    if (!dynamicValuesService) return [];

    const result = await dynamicValuesService.executeQuery(config);
    return result.success ? result.data : [];
  }, [dynamicValuesService]);

  // Update PCF context
  const updatePCFContext = useCallback((context: IPCFContext) => {
    pcfContextRef.current = context;
    metadataService?.updateContext(context);
    dynamicValuesService?.updateContext(context);
  }, [metadataService, dynamicValuesService]);

  // Create questionnaire record in Dataverse
  const createQuestionnaireRecord = useCallback(async (
    record: DataverseQuestionnaireRecord
  ): Promise<DataverseResult<CreateResult>> => {
    const context = pcfContextRef.current;
    if (!context) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN',
          message: 'Dataverse context not initialized',
          userMessage: 'Dataverse context not initialized',
          isRetryable: false,
        },
      };
    }

    const crudService = new CrudService(context, {
      entityLogicalName: 'ctna_questionnaire',
    });

    return crudService.create(record as unknown as Record<string, unknown>);
  }, []);

  // Update questionnaire record in Dataverse
  const updateQuestionnaireRecord = useCallback(async (
    recordId: string,
    record: Partial<DataverseQuestionnaireRecord>
  ): Promise<DataverseResult<EntityReference>> => {
    const context = pcfContextRef.current;
    if (!context) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN',
          message: 'Dataverse context not initialized',
          userMessage: 'Dataverse context not initialized',
          isRetryable: false,
        },
      };
    }

    const crudService = new CrudService(context, {
      entityLogicalName: 'ctna_questionnaire',
    });

    return crudService.update(recordId, record as unknown as Record<string, unknown>);
  }, []);

  // Deactivate questionnaire record in Dataverse
  const deactivateQuestionnaireRecord = useCallback(async (
    recordId: string
  ): Promise<DataverseResult<EntityReference>> => {
    const context = pcfContextRef.current;
    if (!context) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN',
          message: 'Dataverse context not initialized',
          userMessage: 'Dataverse context not initialized',
          isRetryable: false,
        },
      };
    }

    const crudService = new CrudService(context, {
      entityLogicalName: 'ctna_questionnaire',
    });

    // Set status to Inactive
    return crudService.update(recordId, {
      ctna_status: 'Inactive',
    });
  }, []);

  // List all questionnaire records from Dataverse
  const listQuestionnairesFromDataverse = useCallback(async (): Promise<DataverseResult<QuestionnaireListItem[]>> => {
    const context = pcfContextRef.current;
    if (!context) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN',
          message: 'Dataverse context not initialized',
          userMessage: 'Dataverse context not initialized',
          isRetryable: false,
        },
      };
    }

    const queryService = new QueryService(context);

    const result = await queryService.retrieveMultiple<Record<string, unknown>>(
      'ctna_questionnaire',
      {
        select: [
          'ctna_questionnaireid',
          'ctna_name',
          'ctna_description',
          'ctna_status',
          'ctna_version',
          'ctna_schemaversion',
          'createdon',
          'modifiedon',
        ],
        filter: "ctna_status ne 'Inactive'",
        orderBy: 'modifiedon desc',
      }
    );

    if (!result.success) {
      return result as DataverseResult<QuestionnaireListItem[]>;
    }

    const items: QuestionnaireListItem[] = result.data.entities.map((entity) => ({
      id: String(entity.ctna_questionnaireid || ''),
      name: String(entity.ctna_name || ''),
      description: entity.ctna_description ? String(entity.ctna_description) : undefined,
      status: String(entity.ctna_status || ''),
      version: String(entity.ctna_version || '1.0'),
      schemaVersion: String(entity.ctna_schemaversion || '1.0'),
      createdOn: entity.createdon ? String(entity.createdon) : undefined,
      modifiedOn: entity.modifiedon ? String(entity.modifiedon) : undefined,
    }));

    return {
      success: true,
      data: items,
    };
  }, []);

  const value = useMemo<DataverseContextValue>(() => ({
    isPCFEnvironment,
    isInitialized,
    isLoading,
    error,
    entities,
    loadEntities,
    getEntityByName,
    getEntityFields,
    getLookupTargetFields,
    executeQuery,
    createQuestionnaireRecord,
    updateQuestionnaireRecord,
    deactivateQuestionnaireRecord,
    listQuestionnairesFromDataverse,
    updatePCFContext,
  }), [
    isPCFEnvironment,
    isInitialized,
    isLoading,
    error,
    entities,
    loadEntities,
    getEntityByName,
    getEntityFields,
    getLookupTargetFields,
    executeQuery,
    createQuestionnaireRecord,
    updateQuestionnaireRecord,
    deactivateQuestionnaireRecord,
    listQuestionnairesFromDataverse,
    updatePCFContext,
  ]);

  return (
    <DataverseContext.Provider value={value}>
      {children}
    </DataverseContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useDataverse(): DataverseContextValue {
  const context = useContext(DataverseContext);
  if (!context) {
    throw new Error('useDataverse must be used within a DataverseProvider');
  }
  return context;
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook for accessing entity fields with auto-loading
 */
export function useEntityFields(entityName: string | undefined) {
  const { getEntityFields } = useDataverse();
  const [fields, setFields] = useState<FieldInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!entityName) {
      setFields([]);
      return;
    }

    setIsLoading(true);
    void getEntityFields(entityName)
      .then(setFields)
      .catch(() => setFields([]))
      .finally(() => setIsLoading(false));
  }, [entityName, getEntityFields]);

  return { fields, isLoading };
}

/**
 * Hook for accessing lookup target fields
 */
export function useLookupTargetFields(entityName: string | undefined, lookupField: string | undefined) {
  const { getLookupTargetFields } = useDataverse();
  const [targetInfo, setTargetInfo] = useState<{ targetEntity: string; fields: FieldInfo[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!entityName || !lookupField) {
      setTargetInfo(null);
      return;
    }

    setIsLoading(true);
    void getLookupTargetFields(entityName, lookupField)
      .then(setTargetInfo)
      .catch(() => setTargetInfo(null))
      .finally(() => setIsLoading(false));
  }, [entityName, lookupField, getLookupTargetFields]);

  return { targetInfo, isLoading };
}
