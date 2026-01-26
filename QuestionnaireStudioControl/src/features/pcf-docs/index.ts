/**
 * PCF Documentation Feature - Index
 * 
 * Self-contained exports for the PCF documentation feature.
 * This folder can be deleted without affecting the rest of the project.
 */

// Components
export { DynamicValuesPlayground } from './components/DynamicValuesPlayground';
export { CodeBlock } from './components/CodeBlock';

// Data
export { SAMPLE_ENTITIES, SAMPLE_DATA, OPERATORS, getEntityByLogicalName, getFilterableFields } from './data/sampleEntities';

// Utils
export { generateFetchXml, generateFormattedOData } from './utils/queryGenerators';

// Types
export type * from './types';
