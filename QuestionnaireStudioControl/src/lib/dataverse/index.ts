/**
 * Dataverse Integration Module
 * 
 * Comprehensive utilities for Microsoft Dataverse / Dynamics 365 CRM integration
 * in Power Apps Component Framework (PCF) controls.
 * 
 * Exports:
 * - DataverseService: Main service class for CRUD operations
 * - Query generators: OData and FetchXML query builders
 * - Types: TypeScript definitions for Dataverse entities
 */

// Service and factories
export { 
  DataverseService,
  createDataverseService,
  createMockDataverseService,
  type DataverseResult,
} from './DataverseService';

// Query generators
export * from './fetchXmlGenerator';
export * from './odataGenerator';

// Types
export * from './types';
