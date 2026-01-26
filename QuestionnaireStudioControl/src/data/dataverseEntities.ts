/**
 * Dataverse Entity Configuration for PCF Control Integration
 * 
 * This module provides sample Dataverse entity metadata that mirrors
 * Microsoft Dynamics 365 CRM table structures. In production PCF control,
 * this data will be fetched dynamically via the WebAPI or Metadata API.
 * 
 * Entity Naming Convention:
 * - logicalName: The system name used in OData/FetchXML queries (e.g., 'account')
 * - displayName: The user-friendly name shown in UI (e.g., 'Account')
 * 
 * Field Types map to Dataverse attribute types:
 * - string: SingleLine.Text, MultiLine.Text
 * - lookup: EntityReference (related entity)
 * - optionset: OptionSet (dropdown), State, Status
 * - boolean: TwoOptions
 * - number: WholeNumber, Decimal, Currency
 * - datetime: DateOnly, DateAndTime
 * - guid: UniqueIdentifier (primary key)
 */

export type DataverseFieldType = 
  | 'string'
  | 'lookup'
  | 'optionset'
  | 'boolean'
  | 'number'
  | 'decimal'
  | 'currency'
  | 'datetime'
  | 'guid'
  | 'multiselect';

export interface DataverseField {
  logicalName: string;
  displayName: string;
  type: DataverseFieldType;
  /** For lookup fields, the target entity logical name */
  lookupTarget?: string;
  /** For optionset fields, the option set name or inline options */
  optionSetName?: string;
  /** Whether this field is the primary name field */
  isPrimaryName?: boolean;
  /** Whether this field is the primary key */
  isPrimaryKey?: boolean;
}

export interface DataverseEntity {
  logicalName: string;
  displayName: string;
  displayCollectionName: string;
  primaryIdAttribute: string;
  primaryNameAttribute: string;
  fields: DataverseField[];
}

/**
 * Sample Dataverse entities representing common Dynamics 365 CRM tables.
 * 
 * In a production PCF control, replace this with dynamic metadata retrieval:
 * - Use Xrm.Utility.getEntityMetadata() for entity info
 * - Use WebAPI to query EntityDefinitions for full metadata
 */
export const DATAVERSE_ENTITIES: DataverseEntity[] = [
  {
    logicalName: 'account',
    displayName: 'Account',
    displayCollectionName: 'Accounts',
    primaryIdAttribute: 'accountid',
    primaryNameAttribute: 'name',
    fields: [
      { logicalName: 'accountid', displayName: 'Account ID', type: 'guid', isPrimaryKey: true },
      { logicalName: 'name', displayName: 'Account Name', type: 'string', isPrimaryName: true },
      { logicalName: 'accountnumber', displayName: 'Account Number', type: 'string' },
      { logicalName: 'telephone1', displayName: 'Main Phone', type: 'string' },
      { logicalName: 'emailaddress1', displayName: 'Email', type: 'string' },
      { logicalName: 'websiteurl', displayName: 'Website', type: 'string' },
      { logicalName: 'address1_city', displayName: 'City', type: 'string' },
      { logicalName: 'address1_stateorprovince', displayName: 'State/Province', type: 'string' },
      { logicalName: 'address1_country', displayName: 'Country', type: 'string' },
      { logicalName: 'industrycode', displayName: 'Industry', type: 'optionset', optionSetName: 'industrycode' },
      { logicalName: 'revenue', displayName: 'Annual Revenue', type: 'currency' },
      { logicalName: 'numberofemployees', displayName: 'Number of Employees', type: 'number' },
      { logicalName: 'primarycontactid', displayName: 'Primary Contact', type: 'lookup', lookupTarget: 'contact' },
      { logicalName: 'ownerid', displayName: 'Owner', type: 'lookup', lookupTarget: 'systemuser' },
      { logicalName: 'statecode', displayName: 'Status', type: 'optionset', optionSetName: 'account_statecode' },
      { logicalName: 'statuscode', displayName: 'Status Reason', type: 'optionset', optionSetName: 'account_statuscode' },
      { logicalName: 'createdon', displayName: 'Created On', type: 'datetime' },
      { logicalName: 'modifiedon', displayName: 'Modified On', type: 'datetime' },
    ]
  },
  {
    logicalName: 'contact',
    displayName: 'Contact',
    displayCollectionName: 'Contacts',
    primaryIdAttribute: 'contactid',
    primaryNameAttribute: 'fullname',
    fields: [
      { logicalName: 'contactid', displayName: 'Contact ID', type: 'guid', isPrimaryKey: true },
      { logicalName: 'fullname', displayName: 'Full Name', type: 'string', isPrimaryName: true },
      { logicalName: 'firstname', displayName: 'First Name', type: 'string' },
      { logicalName: 'lastname', displayName: 'Last Name', type: 'string' },
      { logicalName: 'jobtitle', displayName: 'Job Title', type: 'string' },
      { logicalName: 'emailaddress1', displayName: 'Email', type: 'string' },
      { logicalName: 'telephone1', displayName: 'Business Phone', type: 'string' },
      { logicalName: 'mobilephone', displayName: 'Mobile Phone', type: 'string' },
      { logicalName: 'address1_city', displayName: 'City', type: 'string' },
      { logicalName: 'address1_stateorprovince', displayName: 'State/Province', type: 'string' },
      { logicalName: 'address1_country', displayName: 'Country', type: 'string' },
      { logicalName: 'parentcustomerid', displayName: 'Company Name', type: 'lookup', lookupTarget: 'account' },
      { logicalName: 'ownerid', displayName: 'Owner', type: 'lookup', lookupTarget: 'systemuser' },
      { logicalName: 'statecode', displayName: 'Status', type: 'optionset', optionSetName: 'contact_statecode' },
      { logicalName: 'statuscode', displayName: 'Status Reason', type: 'optionset', optionSetName: 'contact_statuscode' },
      { logicalName: 'birthdate', displayName: 'Birthday', type: 'datetime' },
      { logicalName: 'createdon', displayName: 'Created On', type: 'datetime' },
      { logicalName: 'modifiedon', displayName: 'Modified On', type: 'datetime' },
    ]
  },
  {
    logicalName: 'lead',
    displayName: 'Lead',
    displayCollectionName: 'Leads',
    primaryIdAttribute: 'leadid',
    primaryNameAttribute: 'fullname',
    fields: [
      { logicalName: 'leadid', displayName: 'Lead ID', type: 'guid', isPrimaryKey: true },
      { logicalName: 'fullname', displayName: 'Full Name', type: 'string', isPrimaryName: true },
      { logicalName: 'firstname', displayName: 'First Name', type: 'string' },
      { logicalName: 'lastname', displayName: 'Last Name', type: 'string' },
      { logicalName: 'companyname', displayName: 'Company Name', type: 'string' },
      { logicalName: 'jobtitle', displayName: 'Job Title', type: 'string' },
      { logicalName: 'emailaddress1', displayName: 'Email', type: 'string' },
      { logicalName: 'telephone1', displayName: 'Business Phone', type: 'string' },
      { logicalName: 'mobilephone', displayName: 'Mobile Phone', type: 'string' },
      { logicalName: 'address1_city', displayName: 'City', type: 'string' },
      { logicalName: 'address1_country', displayName: 'Country', type: 'string' },
      { logicalName: 'leadsourcecode', displayName: 'Lead Source', type: 'optionset', optionSetName: 'leadsourcecode' },
      { logicalName: 'leadqualitycode', displayName: 'Rating', type: 'optionset', optionSetName: 'leadqualitycode' },
      { logicalName: 'budgetamount', displayName: 'Budget Amount', type: 'currency' },
      { logicalName: 'ownerid', displayName: 'Owner', type: 'lookup', lookupTarget: 'systemuser' },
      { logicalName: 'statecode', displayName: 'Status', type: 'optionset', optionSetName: 'lead_statecode' },
      { logicalName: 'statuscode', displayName: 'Status Reason', type: 'optionset', optionSetName: 'lead_statuscode' },
      { logicalName: 'createdon', displayName: 'Created On', type: 'datetime' },
    ]
  },
  {
    logicalName: 'opportunity',
    displayName: 'Opportunity',
    displayCollectionName: 'Opportunities',
    primaryIdAttribute: 'opportunityid',
    primaryNameAttribute: 'name',
    fields: [
      { logicalName: 'opportunityid', displayName: 'Opportunity ID', type: 'guid', isPrimaryKey: true },
      { logicalName: 'name', displayName: 'Topic', type: 'string', isPrimaryName: true },
      { logicalName: 'description', displayName: 'Description', type: 'string' },
      { logicalName: 'estimatedvalue', displayName: 'Est. Revenue', type: 'currency' },
      { logicalName: 'actualvalue', displayName: 'Actual Revenue', type: 'currency' },
      { logicalName: 'closeprobability', displayName: 'Probability', type: 'number' },
      { logicalName: 'estimatedclosedate', displayName: 'Est. Close Date', type: 'datetime' },
      { logicalName: 'actualclosedate', displayName: 'Actual Close Date', type: 'datetime' },
      { logicalName: 'customerid', displayName: 'Potential Customer', type: 'lookup', lookupTarget: 'account' },
      { logicalName: 'parentcontactid', displayName: 'Contact', type: 'lookup', lookupTarget: 'contact' },
      { logicalName: 'pricelevelid', displayName: 'Price List', type: 'lookup', lookupTarget: 'pricelevel' },
      { logicalName: 'salesstage', displayName: 'Sales Stage', type: 'optionset', optionSetName: 'opportunitysalesstage' },
      { logicalName: 'ownerid', displayName: 'Owner', type: 'lookup', lookupTarget: 'systemuser' },
      { logicalName: 'statecode', displayName: 'Status', type: 'optionset', optionSetName: 'opportunity_statecode' },
      { logicalName: 'statuscode', displayName: 'Status Reason', type: 'optionset', optionSetName: 'opportunity_statuscode' },
      { logicalName: 'createdon', displayName: 'Created On', type: 'datetime' },
    ]
  },
  {
    logicalName: 'incident',
    displayName: 'Case',
    displayCollectionName: 'Cases',
    primaryIdAttribute: 'incidentid',
    primaryNameAttribute: 'title',
    fields: [
      { logicalName: 'incidentid', displayName: 'Case ID', type: 'guid', isPrimaryKey: true },
      { logicalName: 'title', displayName: 'Case Title', type: 'string', isPrimaryName: true },
      { logicalName: 'ticketnumber', displayName: 'Case Number', type: 'string' },
      { logicalName: 'description', displayName: 'Description', type: 'string' },
      { logicalName: 'customerid', displayName: 'Customer', type: 'lookup', lookupTarget: 'account' },
      { logicalName: 'primarycontactid', displayName: 'Contact', type: 'lookup', lookupTarget: 'contact' },
      { logicalName: 'subjectid', displayName: 'Subject', type: 'lookup', lookupTarget: 'subject' },
      { logicalName: 'prioritycode', displayName: 'Priority', type: 'optionset', optionSetName: 'incident_prioritycode' },
      { logicalName: 'casetypecode', displayName: 'Case Type', type: 'optionset', optionSetName: 'incident_casetypecode' },
      { logicalName: 'caseorigincode', displayName: 'Origin', type: 'optionset', optionSetName: 'incident_caseorigincode' },
      { logicalName: 'ownerid', displayName: 'Owner', type: 'lookup', lookupTarget: 'systemuser' },
      { logicalName: 'statecode', displayName: 'Status', type: 'optionset', optionSetName: 'incident_statecode' },
      { logicalName: 'statuscode', displayName: 'Status Reason', type: 'optionset', optionSetName: 'incident_statuscode' },
      { logicalName: 'createdon', displayName: 'Created On', type: 'datetime' },
      { logicalName: 'modifiedon', displayName: 'Modified On', type: 'datetime' },
    ]
  },
  {
    logicalName: 'systemuser',
    displayName: 'User',
    displayCollectionName: 'Users',
    primaryIdAttribute: 'systemuserid',
    primaryNameAttribute: 'fullname',
    fields: [
      { logicalName: 'systemuserid', displayName: 'User ID', type: 'guid', isPrimaryKey: true },
      { logicalName: 'fullname', displayName: 'Full Name', type: 'string', isPrimaryName: true },
      { logicalName: 'firstname', displayName: 'First Name', type: 'string' },
      { logicalName: 'lastname', displayName: 'Last Name', type: 'string' },
      { logicalName: 'domainname', displayName: 'User Name', type: 'string' },
      { logicalName: 'internalemailaddress', displayName: 'Primary Email', type: 'string' },
      { logicalName: 'title', displayName: 'Title', type: 'string' },
      { logicalName: 'businessunitid', displayName: 'Business Unit', type: 'lookup', lookupTarget: 'businessunit' },
      { logicalName: 'isdisabled', displayName: 'Status', type: 'boolean' },
      { logicalName: 'createdon', displayName: 'Created On', type: 'datetime' },
    ]
  },
  {
    logicalName: 'team',
    displayName: 'Team',
    displayCollectionName: 'Teams',
    primaryIdAttribute: 'teamid',
    primaryNameAttribute: 'name',
    fields: [
      { logicalName: 'teamid', displayName: 'Team ID', type: 'guid', isPrimaryKey: true },
      { logicalName: 'name', displayName: 'Team Name', type: 'string', isPrimaryName: true },
      { logicalName: 'description', displayName: 'Description', type: 'string' },
      { logicalName: 'teamtype', displayName: 'Team Type', type: 'optionset', optionSetName: 'team_type' },
      { logicalName: 'businessunitid', displayName: 'Business Unit', type: 'lookup', lookupTarget: 'businessunit' },
      { logicalName: 'administratorid', displayName: 'Administrator', type: 'lookup', lookupTarget: 'systemuser' },
      { logicalName: 'createdon', displayName: 'Created On', type: 'datetime' },
    ]
  },
  {
    logicalName: 'product',
    displayName: 'Product',
    displayCollectionName: 'Products',
    primaryIdAttribute: 'productid',
    primaryNameAttribute: 'name',
    fields: [
      { logicalName: 'productid', displayName: 'Product ID', type: 'guid', isPrimaryKey: true },
      { logicalName: 'name', displayName: 'Name', type: 'string', isPrimaryName: true },
      { logicalName: 'productnumber', displayName: 'Product ID', type: 'string' },
      { logicalName: 'description', displayName: 'Description', type: 'string' },
      { logicalName: 'price', displayName: 'List Price', type: 'currency' },
      { logicalName: 'currentcost', displayName: 'Current Cost', type: 'currency' },
      { logicalName: 'standardcost', displayName: 'Standard Cost', type: 'currency' },
      { logicalName: 'quantityonhand', displayName: 'Quantity On Hand', type: 'decimal' },
      { logicalName: 'defaultuomid', displayName: 'Default Unit', type: 'lookup', lookupTarget: 'uom' },
      { logicalName: 'subjectid', displayName: 'Subject', type: 'lookup', lookupTarget: 'subject' },
      { logicalName: 'statecode', displayName: 'Status', type: 'optionset', optionSetName: 'product_statecode' },
      { logicalName: 'statuscode', displayName: 'Status Reason', type: 'optionset', optionSetName: 'product_statuscode' },
      { logicalName: 'createdon', displayName: 'Created On', type: 'datetime' },
    ]
  },
  {
    logicalName: 'queue',
    displayName: 'Queue',
    displayCollectionName: 'Queues',
    primaryIdAttribute: 'queueid',
    primaryNameAttribute: 'name',
    fields: [
      { logicalName: 'queueid', displayName: 'Queue ID', type: 'guid', isPrimaryKey: true },
      { logicalName: 'name', displayName: 'Name', type: 'string', isPrimaryName: true },
      { logicalName: 'description', displayName: 'Description', type: 'string' },
      { logicalName: 'emailaddress', displayName: 'Incoming Email', type: 'string' },
      { logicalName: 'queueviewtype', displayName: 'Type', type: 'optionset', optionSetName: 'queue_queueviewtype' },
      { logicalName: 'ownerid', displayName: 'Owner', type: 'lookup', lookupTarget: 'systemuser' },
      { logicalName: 'statecode', displayName: 'Status', type: 'optionset', optionSetName: 'queue_statecode' },
      { logicalName: 'statuscode', displayName: 'Status Reason', type: 'optionset', optionSetName: 'queue_statuscode' },
      { logicalName: 'createdon', displayName: 'Created On', type: 'datetime' },
    ]
  },
  {
    logicalName: 'businessunit',
    displayName: 'Business Unit',
    displayCollectionName: 'Business Units',
    primaryIdAttribute: 'businessunitid',
    primaryNameAttribute: 'name',
    fields: [
      { logicalName: 'businessunitid', displayName: 'Business Unit ID', type: 'guid', isPrimaryKey: true },
      { logicalName: 'name', displayName: 'Name', type: 'string', isPrimaryName: true },
      { logicalName: 'divisionname', displayName: 'Division', type: 'string' },
      { logicalName: 'parentbusinessunitid', displayName: 'Parent Business', type: 'lookup', lookupTarget: 'businessunit' },
      { logicalName: 'isdisabled', displayName: 'Is Disabled', type: 'boolean' },
      { logicalName: 'createdon', displayName: 'Created On', type: 'datetime' },
    ]
  },
];

/**
 * OData-compatible operators for Dataverse queries
 * Maps to standard OData $filter operators
 */
export const DATAVERSE_OPERATORS = [
  { value: 'eq', label: 'Equals', odataOperator: 'eq', applicableTo: ['string', 'number', 'decimal', 'currency', 'boolean', 'optionset', 'guid', 'lookup'] },
  { value: 'ne', label: 'Not Equals', odataOperator: 'ne', applicableTo: ['string', 'number', 'decimal', 'currency', 'boolean', 'optionset', 'guid', 'lookup'] },
  { value: 'contains', label: 'Contains', odataFunction: 'contains', applicableTo: ['string'] },
  { value: 'not_contains', label: 'Does Not Contain', odataFunction: 'not contains', applicableTo: ['string'] },
  { value: 'startswith', label: 'Begins With', odataFunction: 'startswith', applicableTo: ['string'] },
  { value: 'endswith', label: 'Ends With', odataFunction: 'endswith', applicableTo: ['string'] },
  { value: 'gt', label: 'Greater Than', odataOperator: 'gt', applicableTo: ['number', 'decimal', 'currency', 'datetime'] },
  { value: 'ge', label: 'Greater Than or Equals', odataOperator: 'ge', applicableTo: ['number', 'decimal', 'currency', 'datetime'] },
  { value: 'lt', label: 'Less Than', odataOperator: 'lt', applicableTo: ['number', 'decimal', 'currency', 'datetime'] },
  { value: 'le', label: 'Less Than or Equals', odataOperator: 'le', applicableTo: ['number', 'decimal', 'currency', 'datetime'] },
  { value: 'null', label: 'Is Null', odataOperator: 'eq null', applicableTo: ['string', 'number', 'decimal', 'currency', 'boolean', 'optionset', 'guid', 'lookup', 'datetime'] },
  { value: 'not_null', label: 'Is Not Null', odataOperator: 'ne null', applicableTo: ['string', 'number', 'decimal', 'currency', 'boolean', 'optionset', 'guid', 'lookup', 'datetime'] },
] as const;

/**
 * Lookup-specific operators for navigating related entity fields
 */
export const LOOKUP_OPERATORS = [
  { value: 'lookup_eq', label: 'Related Field Equals', description: 'Filter by a field on the related entity' },
  { value: 'lookup_ne', label: 'Related Field Not Equals', description: 'Exclude by a field on the related entity' },
  { value: 'lookup_contains', label: 'Related Field Contains', description: 'Filter where related field contains value' },
] as const;

export type DataverseOperator = typeof DATAVERSE_OPERATORS[number]['value'];
export type LookupOperator = typeof LOOKUP_OPERATORS[number]['value'];

/**
 * Get operators applicable to a specific field type
 */
export const getOperatorsForFieldType = (fieldType: DataverseFieldType) => {
  return DATAVERSE_OPERATORS.filter(op => 
    (op.applicableTo as readonly string[]).includes(fieldType)
  );
};

/**
 * Helper to get entity by logical name
 */
export const getEntityByLogicalName = (logicalName: string): DataverseEntity | undefined => {
  return DATAVERSE_ENTITIES.find(e => e.logicalName === logicalName);
};

/**
 * Helper to get field by logical name
 */
export const getFieldByLogicalName = (entity: DataverseEntity, fieldLogicalName: string): DataverseField | undefined => {
  return entity.fields.find(f => f.logicalName === fieldLogicalName);
};

/**
 * Get fields suitable for display (label field)
 */
export const getDisplayFields = (entity: DataverseEntity): DataverseField[] => {
  return entity.fields.filter(f => f.type === 'string' && !f.isPrimaryKey);
};

/**
 * Get fields suitable for value storage
 */
export const getValueFields = (entity: DataverseEntity): DataverseField[] => {
  return entity.fields.filter(f => f.type === 'guid' || f.type === 'string' || f.type === 'number');
};

/**
 * Get filterable fields (excludes complex types)
 */
export const getFilterableFields = (entity: DataverseEntity): DataverseField[] => {
  return entity.fields.filter(f => !f.isPrimaryKey || f.type !== 'guid');
};

/**
 * Get lookup fields from an entity
 */
export const getLookupFields = (entity: DataverseEntity): DataverseField[] => {
  return entity.fields.filter(f => f.type === 'lookup');
};

/**
 * Check if a field is a lookup type
 */
export const isLookupField = (field: DataverseField): boolean => {
  return field.type === 'lookup';
};

/**
 * Build a lookup expression path (e.g., "primarycontactid/fullname" for OData)
 */
export const buildLookupPath = (lookupField: string, targetField: string): string => {
  return `${lookupField}/${targetField}`;
};

/**
 * Parse a lookup expression path back to components
 */
export const parseLookupPath = (path: string): { lookupField: string; targetField: string } | null => {
  const parts = path.split('/');
  if (parts.length === 2) {
    return { lookupField: parts[0], targetField: parts[1] };
  }
  return null;
};
