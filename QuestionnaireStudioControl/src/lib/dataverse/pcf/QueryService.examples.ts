/**
 * QueryService Usage Examples
 * 
 * Demonstrates OData and FetchXML query patterns for PCF controls.
 */

import type { IPCFContext } from './types';
import { createQueryService, QueryService } from './QueryService';
import type { Account, Contact } from './CrudService.examples';

// ============================================================================
// FetchXML Templates
// ============================================================================

/**
 * FetchXML Query Builder Helpers
 * Keep FetchXML templates centralized, not embedded in UI components
 */
export const FetchXmlTemplates = {
  /**
   * Get active accounts with optional name filter
   */
  activeAccounts: (nameFilter?: string) => `
    <fetch top="100">
      <entity name="account">
        <attribute name="accountid" />
        <attribute name="name" />
        <attribute name="telephone1" />
        <attribute name="emailaddress1" />
        <attribute name="revenue" />
        <filter type="and">
          <condition attribute="statecode" operator="eq" value="0" />
          ${nameFilter ? `<condition attribute="name" operator="like" value="%${nameFilter}%" />` : ''}
        </filter>
        <order attribute="name" />
      </entity>
    </fetch>
  `,

  /**
   * Get contacts for an account
   */
  accountContacts: (accountId: string) => `
    <fetch>
      <entity name="contact">
        <attribute name="contactid" />
        <attribute name="fullname" />
        <attribute name="emailaddress1" />
        <attribute name="telephone1" />
        <attribute name="jobtitle" />
        <filter>
          <condition attribute="parentcustomerid" operator="eq" value="${accountId}" />
          <condition attribute="statecode" operator="eq" value="0" />
        </filter>
        <order attribute="fullname" />
      </entity>
    </fetch>
  `,

  /**
   * Get accounts with primary contact (linked entity)
   */
  accountsWithContact: () => `
    <fetch top="50">
      <entity name="account">
        <attribute name="accountid" />
        <attribute name="name" />
        <attribute name="telephone1" />
        <link-entity name="contact" from="contactid" to="primarycontactid" link-type="outer" alias="contact">
          <attribute name="fullname" />
          <attribute name="emailaddress1" />
        </link-entity>
        <filter>
          <condition attribute="statecode" operator="eq" value="0" />
        </filter>
        <order attribute="name" />
      </entity>
    </fetch>
  `,

  /**
   * Get account count by industry
   */
  accountCountByIndustry: () => `
    <fetch aggregate="true">
      <entity name="account">
        <attribute name="industrycode" groupby="true" alias="industry" />
        <attribute name="accountid" aggregate="count" alias="count" />
        <filter>
          <condition attribute="statecode" operator="eq" value="0" />
          <condition attribute="industrycode" operator="not-null" />
        </filter>
      </entity>
    </fetch>
  `,

  /**
   * Get recently modified records
   */
  recentlyModified: (entityName: string, days = 7) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const isoDate = date.toISOString().split('T')[0];
    
    return `
      <fetch top="100">
        <entity name="${entityName}">
          <all-attributes />
          <filter>
            <condition attribute="modifiedon" operator="on-or-after" value="${isoDate}" />
          </filter>
          <order attribute="modifiedon" descending="true" />
        </entity>
      </fetch>
    `;
  },

  /**
   * Search across multiple fields
   */
  searchAccounts: (searchTerm: string) => `
    <fetch top="50">
      <entity name="account">
        <attribute name="accountid" />
        <attribute name="name" />
        <attribute name="accountnumber" />
        <attribute name="telephone1" />
        <attribute name="emailaddress1" />
        <filter type="or">
          <condition attribute="name" operator="like" value="%${searchTerm}%" />
          <condition attribute="accountnumber" operator="like" value="%${searchTerm}%" />
          <condition attribute="emailaddress1" operator="like" value="%${searchTerm}%" />
          <condition attribute="telephone1" operator="like" value="${searchTerm}%" />
        </filter>
        <order attribute="name" />
      </entity>
    </fetch>
  `,

  /**
   * Hierarchical query - get child accounts
   */
  childAccounts: (parentAccountId: string) => `
    <fetch>
      <entity name="account">
        <attribute name="accountid" />
        <attribute name="name" />
        <attribute name="telephone1" />
        <filter>
          <condition attribute="parentaccountid" operator="eq" value="${parentAccountId}" />
          <condition attribute="statecode" operator="eq" value="0" />
        </filter>
        <order attribute="name" />
      </entity>
    </fetch>
  `,
};

// ============================================================================
// Query Patterns Examples
// ============================================================================

/**
 * Example: Basic OData Query
 */
export async function exampleODataQuery(context: IPCFContext): Promise<void> {
  const queryService = createQueryService(context);

  // Simple query with filter and ordering
  const result = await queryService.retrieveMultiple<Account>('account', {
    select: ['name', 'telephone1', 'emailaddress1'],
    filter: "statecode eq 0",
    orderBy: "name asc",
    top: 50,
  });

  if (result.success) {
    console.log(`Found ${result.data.entities.length} accounts`);
    result.data.entities.forEach(account => {
      console.log(`- ${account.name}: ${account.telephone1}`);
    });

    // Check for more pages
    if (result.data.moreRecords && result.data.nextLink) {
      console.log('More records available...');
    }
  } else {
    console.error('Query failed:', result.error.userMessage);
  }
}

/**
 * Example: OData with Expand (Related Records)
 */
export async function exampleODataExpand(context: IPCFContext): Promise<void> {
  const queryService = createQueryService(context);

  // Query accounts with expanded primary contact
  const result = await queryService.retrieveMultiple<Account & {
    primarycontactid?: Contact;
  }>('account', {
    select: ['name', 'telephone1'],
    expand: [{
      property: 'primarycontactid',
      select: ['fullname', 'emailaddress1', 'telephone1'],
    }],
    filter: "statecode eq 0",
    top: 25,
  });

  if (result.success) {
    result.data.entities.forEach(account => {
      const contact = account.primarycontactid;
      console.log(`${account.name} - Contact: ${contact?.fullname ?? 'None'}`);
    });
  }
}

/**
 * Example: Paging Through Results
 */
export async function examplePaging(context: IPCFContext): Promise<void> {
  const queryService = createQueryService(context);
  
  let pageNumber = 1;
  let nextLink: string | undefined;
  let totalLoaded = 0;

  // First page
  const firstResult = await queryService.retrieveMultiple<Account>('account', {
    select: ['name'],
    filter: "statecode eq 0",
  }, 50);

  if (!firstResult.success) {
    console.error('Failed to load first page');
    return;
  }

  totalLoaded += firstResult.data.entities.length;
  nextLink = firstResult.data.nextLink;
  console.log(`Page ${pageNumber}: ${firstResult.data.entities.length} records`);

  // Subsequent pages
  while (nextLink && pageNumber < 5) { // Limit to 5 pages for example
    pageNumber++;
    
    const pageResult = await queryService.getNextPage<Account>('account', nextLink);
    
    if (!pageResult.success) {
      console.error(`Failed to load page ${pageNumber}`);
      break;
    }

    totalLoaded += pageResult.data.entities.length;
    nextLink = pageResult.data.nextLink;
    console.log(`Page ${pageNumber}: ${pageResult.data.entities.length} records`);
  }

  console.log(`Total loaded: ${totalLoaded} records`);
}

/**
 * Example: Retrieve All with Progress
 */
export async function exampleRetrieveAll(context: IPCFContext): Promise<void> {
  const queryService = createQueryService(context);

  // Create abort controller for cancellation
  const abortController = new AbortController();

  // Set timeout to cancel after 30 seconds
  const timeout = setTimeout(() => {
    abortController.abort();
    console.log('Query cancelled due to timeout');
  }, 30000);

  const result = await queryService.retrieveAll<Contact>('contact', {
    filter: "statecode eq 0",
    select: ['fullname', 'emailaddress1'],
    maxRecords: 2000, // Safety limit
    signal: abortController.signal,
    onProgress: (loaded) => {
      console.log(`Loading... ${loaded} records`);
    },
  });

  clearTimeout(timeout);

  if (result.success) {
    console.log(`Loaded all ${result.data.length} contacts`);
  }
}

/**
 * Example: FetchXML Query
 */
export async function exampleFetchXml(context: IPCFContext): Promise<void> {
  const queryService = createQueryService(context);

  // Use centralized template
  const fetchXml = FetchXmlTemplates.activeAccounts('Contoso');

  const result = await queryService.executeFetchXml<Account>('account', {
    fetchXml,
    page: 1,
    count: 50,
  });

  if (result.success) {
    console.log(`Found ${result.data.entities.length} accounts`);
    
    // Check for more pages
    if (result.data.moreRecords && result.data.pagingCookie) {
      // Fetch next page
      const page2 = await queryService.executeFetchXml<Account>('account', {
        fetchXml,
        page: 2,
        count: 50,
        pagingCookie: result.data.pagingCookie,
      });
      
      if (page2.success) {
        console.log(`Page 2: ${page2.data.entities.length} accounts`);
      }
    }
  }
}

/**
 * Example: FetchXML with Linked Entities
 */
export async function exampleFetchXmlLinked(context: IPCFContext): Promise<void> {
  const queryService = createQueryService(context);

  interface AccountWithContact {
    [key: string]: unknown;
    accountid: string;
    name: string;
    'contact.fullname'?: string;
    'contact.emailaddress1'?: string;
  }

  const fetchXml = FetchXmlTemplates.accountsWithContact();

  const result = await queryService.executeFetchXml<AccountWithContact>('account', {
    fetchXml,
  });

  if (result.success) {
    result.data.entities.forEach(record => {
      console.log(`${record.name} - Contact: ${record['contact.fullname'] ?? 'N/A'}`);
    });
  }
}

/**
 * Example: Aggregate Query
 */
export async function exampleAggregate(context: IPCFContext): Promise<void> {
  const queryService = createQueryService(context);

  interface IndustryCount {
    [key: string]: unknown;
    industry: number;
    count: number;
  }

  const fetchXml = FetchXmlTemplates.accountCountByIndustry();

  const result = await queryService.executeFetchXml<IndustryCount>('account', {
    fetchXml,
  });

  if (result.success) {
    console.log('Accounts by Industry:');
    result.data.entities.forEach(row => {
      console.log(`  Industry ${row.industry}: ${row.count} accounts`);
    });
  }
}

/**
 * Example: Count and Existence Checks
 */
export async function exampleCountAndAny(context: IPCFContext): Promise<void> {
  const queryService = createQueryService(context);

  // Count active accounts
  const countResult = await queryService.count('account', "statecode eq 0");
  if (countResult.success) {
    console.log(`Active accounts: ${countResult.data}`);
  }

  // Check if any high-revenue accounts exist
  const anyResult = await queryService.any('account', "revenue gt 1000000");
  if (anyResult.success) {
    console.log(`Has high-revenue accounts: ${anyResult.data}`);
  }
}

/**
 * Example: First/Single Record
 */
export async function exampleFirstAndSingle(context: IPCFContext): Promise<void> {
  const queryService = createQueryService(context);

  // Get first matching account (or null)
  const firstResult = await queryService.firstOrNull<Account>('account', {
    filter: "name eq 'Contoso Ltd'",
    select: ['accountid', 'name', 'telephone1'],
  });

  if (firstResult.success) {
    if (firstResult.data) {
      console.log(`Found: ${firstResult.data.name}`);
    } else {
      console.log('No matching account found');
    }
  }

  // Get single record (fails if 0 or multiple)
  const singleResult = await queryService.single<Account>('account', {
    filter: "accountnumber eq 'ACC-001'",
  });

  if (singleResult.success) {
    console.log(`Single match: ${singleResult.data.name}`);
  } else {
    console.log(`Error: ${singleResult.error.userMessage}`);
  }
}

/**
 * Example: Lookup Options for Dropdown
 */
export async function exampleLookupOptions(context: IPCFContext): Promise<void> {
  const queryService = createQueryService(context);

  // Get account options for a dropdown
  const result = await queryService.getLookupOptions('account', {
    filter: "statecode eq 0",
    orderBy: "name asc",
    top: 100,
  });

  if (result.success) {
    console.log('Account options:');
    result.data.forEach(option => {
      console.log(`  [${option.id}] ${option.name}`);
    });

    // Use in a React component:
    // <select>
    //   {options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
    // </select>
  }
}

// ============================================================================
// PCF Control Integration Example
// ============================================================================

/**
 * Example PCF Control using QueryService
 */
export class AccountListControl {
  private _queryService!: QueryService;
  private _container!: HTMLDivElement;
  private _abortController: AbortController | null = null;

  init(
    context: IPCFContext,
    _notifyOutputChanged: () => void,
    _state: Record<string, unknown>,
    container: HTMLDivElement
  ): void {
    this._container = container;
    this._queryService = createQueryService(context);
    
    this.loadAccounts();
  }

  updateView(context: IPCFContext): void {
    this._queryService.updateContext(context);
  }

  private async loadAccounts(): Promise<void> {
    // Cancel any pending request
    this._abortController?.abort();
    this._abortController = new AbortController();

    this.renderLoading();

    const result = await this._queryService.retrieveMultiple<Account>('account', {
      select: ['name', 'telephone1', 'emailaddress1'],
      filter: "statecode eq 0",
      orderBy: "name asc",
      top: 50,
    });

    if (result.success) {
      this.renderAccounts(result.data.entities);
    } else {
      this.renderError(result.error.userMessage);
    }
  }

  async searchAccounts(searchTerm: string): Promise<void> {
    if (!searchTerm.trim()) {
      return this.loadAccounts();
    }

    this._abortController?.abort();
    this._abortController = new AbortController();

    this.renderLoading();

    // Use FetchXML template for search
    const fetchXml = FetchXmlTemplates.searchAccounts(searchTerm);
    
    const result = await this._queryService.executeFetchXml<Account>('account', {
      fetchXml,
    });

    if (result.success) {
      this.renderAccounts(result.data.entities);
    } else {
      this.renderError(result.error.userMessage);
    }
  }

  private renderLoading(): void {
    this._container.innerHTML = '<div class="loading">Loading...</div>';
  }

  private renderAccounts(accounts: Account[]): void {
    if (accounts.length === 0) {
      this._container.innerHTML = '<div class="empty">No accounts found</div>';
      return;
    }

    this._container.innerHTML = `
      <ul class="account-list">
        ${accounts.map(a => `
          <li>
            <strong>${a.name}</strong>
            <span>${a.telephone1 ?? ''}</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  private renderError(message: string): void {
    this._container.innerHTML = `<div class="error">${message}</div>`;
  }

  destroy(): void {
    this._abortController?.abort();
    this._container.innerHTML = '';
  }
}
