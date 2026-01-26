/**
 * PCF Dataverse Wrapper - Main Entry Point
 * 
 * Production-ready services for Dataverse integration in PCF controls.
 * All services fetch data dynamically from Dataverse - NO hardcoded configurations.
 */

// ============================================================================
// Core Types
// ============================================================================

export {
  // Helper function for normalizing PCF context
  normalizePCFContext,
} from './types';

export type {
  // PCF Context types
  IPCFWebApi,
  IPCFUtility,
  IPCFContext,
  PCFContextLike,
  
  // Entity types
  EntityReference,
  CreateResult,
  RetrieveMultipleResponse,
  
  // Query types
  ODataOptions,
  ExpandOption,
  FetchXmlOptions,
  QueryResult,
  RetrieveAllOptions,
  
  // Metadata types
  EntityMetadata,
  AttributeMetadata,
  OptionMetadata,
  
  // Error types
  DataverseErrorCode,
  NormalizedError,
  
  // Result types
  SuccessResult,
  FailureResult,
  DataverseResult,
  
  // Operation types
  OperationType,
  UpdateOptions,
} from './types';

// ============================================================================
// Logger
// ============================================================================

export {
  createLogger,
  getLogger,
  configureDefaultLogger,
  logger,
  type ILogger,
  type LogLevel,
  type LoggerConfig,
} from './Logger';

// ============================================================================
// Error Handler
// ============================================================================

export {
  createErrorHandler,
  getErrorHandler,
  errorHandler,
  // Utility functions
  withRetry,
  withSafeExecution,
  withSafeRetry,
  handleError,
  type IErrorHandler,
  type RetryOptions,
  type SafeResult,
  type ErrorHandlers,
} from './ErrorHandler';

// ============================================================================
// Base Service
// ============================================================================

export {
  BaseDataverseService,
  createBaseServiceConfig,
  type BaseServiceConfig,
} from './BaseDataverseService';

// ============================================================================
// CRUD Service
// ============================================================================

export {
  CrudService,
  createCrudService,
  type EntityRecord,
  type CrudServiceConfig,
  type UpsertResult,
} from './CrudService';

// ============================================================================
// Query Service
// ============================================================================

export {
  QueryService,
  createQueryService,
} from './QueryService';

// ============================================================================
// Metadata Service (Real-time entity/field discovery)
// ============================================================================

export {
  MetadataService,
  createMetadataService,
  type EntityInfo,
  type FieldInfo,
  type EntityWithFields,
} from './MetadataService';

// ============================================================================
// Dynamic Values Service (Real-time dropdown data)
// ============================================================================

export {
  DynamicValuesService,
  createDynamicValuesService,
  type DropdownOption,
  type ExecuteQueryOptions,
} from './DynamicValuesService';

// ============================================================================
// React Context & Hooks
// ============================================================================

export {
  DataverseProvider,
  useDataverse,
  useEntityFields,
  useLookupTargetFields,
  type DataverseContextValue,
  type DataverseProviderProps,
} from './DataverseContext';

// ============================================================================
// FetchXML Templates
// ============================================================================

export {
  FetchXmlTemplates,
} from './QueryService.examples';

// ============================================================================
// Example Entity Types (for reference)
// ============================================================================

export type {
  Account,
  Contact,
  Incident,
} from './CrudService.examples';

export {
  createAccountService,
  createContactService,
  createIncidentService,
} from './CrudService.examples';
