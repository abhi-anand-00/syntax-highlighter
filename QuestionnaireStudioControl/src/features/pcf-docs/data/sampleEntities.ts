/**
 * Sample Dataverse Entities for PCF Documentation Playground
 * 
 * Self-contained sample data - NO external dependencies.
 * In production PCF, this data comes from YOUR Dataverse at runtime.
 */

import type { DataverseEntity, DataverseFieldType, SampleRecord } from '../types';

// ============================================================================
// Sample Entity Metadata (simulates what Dataverse Metadata API returns)
// ============================================================================

export const SAMPLE_ENTITIES: DataverseEntity[] = [
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
      { logicalName: 'address1_city', displayName: 'City', type: 'string' },
      { logicalName: 'industrycode', displayName: 'Industry', type: 'optionset' },
      { logicalName: 'revenue', displayName: 'Annual Revenue', type: 'currency' },
      { logicalName: 'numberofemployees', displayName: 'Number of Employees', type: 'number' },
      { logicalName: 'primarycontactid', displayName: 'Primary Contact', type: 'lookup', lookupTarget: 'contact' },
      { logicalName: 'statecode', displayName: 'Status', type: 'optionset' },
      { logicalName: 'createdon', displayName: 'Created On', type: 'datetime' },
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
      { logicalName: 'address1_city', displayName: 'City', type: 'string' },
      { logicalName: 'parentcustomerid', displayName: 'Company Name', type: 'lookup', lookupTarget: 'account' },
      { logicalName: 'statecode', displayName: 'Status', type: 'optionset' },
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
      { logicalName: 'prioritycode', displayName: 'Priority', type: 'optionset' },
      { logicalName: 'statecode', displayName: 'Status', type: 'optionset' },
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
      { logicalName: 'estimatedvalue', displayName: 'Est. Revenue', type: 'currency' },
      { logicalName: 'closeprobability', displayName: 'Probability', type: 'number' },
      { logicalName: 'estimatedclosedate', displayName: 'Est. Close Date', type: 'datetime' },
      { logicalName: 'customerid', displayName: 'Potential Customer', type: 'lookup', lookupTarget: 'account' },
      { logicalName: 'statecode', displayName: 'Status', type: 'optionset' },
      { logicalName: 'createdon', displayName: 'Created On', type: 'datetime' },
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
      { logicalName: 'internalemailaddress', displayName: 'Primary Email', type: 'string' },
      { logicalName: 'title', displayName: 'Title', type: 'string' },
      { logicalName: 'isdisabled', displayName: 'Status', type: 'boolean' },
      { logicalName: 'createdon', displayName: 'Created On', type: 'datetime' },
    ]
  },
];

// ============================================================================
// Sample Data (simulates what Dataverse WebAPI returns)
// ============================================================================

export const SAMPLE_DATA: Record<string, SampleRecord[]> = {
  account: [
    { accountid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', name: 'Contoso Ltd', accountnumber: 'ACC-001', telephone1: '555-0100', emailaddress1: 'info@contoso.com', address1_city: 'Seattle', revenue: 5000000, numberofemployees: 500, statecode: 0 },
    { accountid: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', name: 'Fabrikam Inc', accountnumber: 'ACC-002', telephone1: '555-0200', emailaddress1: 'contact@fabrikam.com', address1_city: 'Portland', revenue: 3200000, numberofemployees: 250, statecode: 0 },
    { accountid: 'c3d4e5f6-a7b8-9012-cdef-123456789012', name: 'Adventure Works', accountnumber: 'ACC-003', telephone1: '555-0300', emailaddress1: 'sales@adventure-works.com', address1_city: 'San Francisco', revenue: 8500000, numberofemployees: 1200, statecode: 0 },
    { accountid: 'd4e5f6a7-b8c9-0123-defa-234567890123', name: 'Northwind Traders', accountnumber: 'ACC-004', telephone1: '555-0400', emailaddress1: 'hello@northwind.com', address1_city: 'Chicago', revenue: 1500000, numberofemployees: 75, statecode: 0 },
    { accountid: 'e5f6a7b8-c9d0-1234-efab-345678901234', name: 'Alpine Ski House', accountnumber: 'ACC-005', telephone1: '555-0500', emailaddress1: 'info@alpineski.com', address1_city: 'Denver', revenue: 2100000, numberofemployees: 120, statecode: 1 },
  ],
  contact: [
    { contactid: 'f1e2d3c4-b5a6-9780-1234-567890abcdef', fullname: 'John Smith', firstname: 'John', lastname: 'Smith', jobtitle: 'CEO', emailaddress1: 'john@contoso.com', telephone1: '555-1001', address1_city: 'Seattle', statecode: 0 },
    { contactid: 'e2d3c4b5-a697-8012-3456-7890abcdef01', fullname: 'Jane Doe', firstname: 'Jane', lastname: 'Doe', jobtitle: 'CTO', emailaddress1: 'jane@fabrikam.com', telephone1: '555-1002', address1_city: 'Portland', statecode: 0 },
    { contactid: 'd3c4b5a6-9780-1234-5678-90abcdef0123', fullname: 'Bob Wilson', firstname: 'Bob', lastname: 'Wilson', jobtitle: 'Sales Manager', emailaddress1: 'bob@adventure-works.com', telephone1: '555-1003', address1_city: 'San Francisco', statecode: 0 },
    { contactid: 'c4b5a697-8012-3456-7890-abcdef012345', fullname: 'Alice Brown', firstname: 'Alice', lastname: 'Brown', jobtitle: 'Support Lead', emailaddress1: 'alice@northwind.com', telephone1: '555-1004', address1_city: 'Chicago', statecode: 0 },
  ],
  incident: [
    { incidentid: '11111111-2222-3333-4444-555555555555', title: 'Login issues on mobile app', ticketnumber: 'CAS-001', description: 'User cannot log in', prioritycode: 1, statecode: 0 },
    { incidentid: '22222222-3333-4444-5555-666666666666', title: 'Billing discrepancy', ticketnumber: 'CAS-002', description: 'Invoice amount incorrect', prioritycode: 2, statecode: 0 },
    { incidentid: '33333333-4444-5555-6666-777777777777', title: 'Feature request: Dark mode', ticketnumber: 'CAS-003', description: 'Add dark mode support', prioritycode: 3, statecode: 0 },
    { incidentid: '44444444-5555-6666-7777-888888888888', title: 'Performance degradation', ticketnumber: 'CAS-004', description: 'App running slowly', prioritycode: 1, statecode: 1 },
  ],
  opportunity: [
    { opportunityid: 'aaaa1111-bbbb-cccc-dddd-eeee11112222', name: 'Enterprise License Deal', estimatedvalue: 250000, closeprobability: 75, statecode: 0 },
    { opportunityid: 'bbbb2222-cccc-dddd-eeee-ffff22223333', name: 'Cloud Migration Project', estimatedvalue: 180000, closeprobability: 60, statecode: 0 },
    { opportunityid: 'cccc3333-dddd-eeee-ffff-000033334444', name: 'Support Contract Renewal', estimatedvalue: 45000, closeprobability: 90, statecode: 0 },
  ],
  systemuser: [
    { systemuserid: 'user1111-2222-3333-4444-555566667777', fullname: 'Admin User', firstname: 'Admin', lastname: 'User', internalemailaddress: 'admin@company.com', title: 'System Administrator', isdisabled: false },
    { systemuserid: 'user2222-3333-4444-5555-666677778888', fullname: 'Sales Rep', firstname: 'Sales', lastname: 'Rep', internalemailaddress: 'sales@company.com', title: 'Sales Representative', isdisabled: false },
    { systemuserid: 'user3333-4444-5555-6666-777788889999', fullname: 'Support Agent', firstname: 'Support', lastname: 'Agent', internalemailaddress: 'support@company.com', title: 'Customer Support', isdisabled: false },
  ],
};

// ============================================================================
// Helper Functions
// ============================================================================

export const getEntityByLogicalName = (logicalName: string): DataverseEntity | undefined => {
  return SAMPLE_ENTITIES.find(e => e.logicalName === logicalName);
};

export const getFilterableFields = (entity: DataverseEntity) => {
  return entity.fields.filter(f => !f.isPrimaryKey || f.type !== 'guid');
};

export const parseLookupPath = (path: string): { lookupField: string; targetField: string } | null => {
  const parts = path.split('/');
  if (parts.length === 2) {
    return { lookupField: parts[0], targetField: parts[1] };
  }
  return null;
};

// ============================================================================
// Operators
// ============================================================================

export const OPERATORS = [
  { value: 'eq', label: 'Equals' },
  { value: 'ne', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'startswith', label: 'Starts With' },
  { value: 'endswith', label: 'Ends With' },
  { value: 'gt', label: 'Greater Than' },
  { value: 'ge', label: 'Greater Than or Equals' },
  { value: 'lt', label: 'Less Than' },
  { value: 'le', label: 'Less Than or Equals' },
  { value: 'null', label: 'Is Null' },
  { value: 'not_null', label: 'Is Not Null' },
];
