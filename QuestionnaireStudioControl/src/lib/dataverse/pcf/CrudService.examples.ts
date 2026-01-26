/**
 * CrudService Usage Examples
 * 
 * Demonstrates how to use CrudService<T> with typed entity interfaces
 * in a PCF control context.
 */

import type { IPCFContext } from './types';
import { CrudService, createCrudService } from './CrudService';

// ============================================================================
// Sample Entity Interfaces
// ============================================================================

/**
 * Account entity interface
 * Maps to Dataverse 'account' entity
 */
export interface Account {
  [key: string]: unknown;  // Index signature for EntityRecord compatibility
  
  // Primary key (read-only after create)
  accountid?: string;
  
  // Core fields
  name: string;
  accountnumber?: string;
  telephone1?: string;
  telephone2?: string;
  fax?: string;
  websiteurl?: string;
  emailaddress1?: string;
  
  // Address fields
  address1_line1?: string;
  address1_line2?: string;
  address1_city?: string;
  address1_stateorprovince?: string;
  address1_postalcode?: string;
  address1_country?: string;
  
  // Lookup fields (navigation properties)
  _primarycontactid_value?: string;       // Contact lookup
  _parentaccountid_value?: string;        // Parent account lookup
  _ownerid_value?: string;                // Owner lookup
  
  // Choice/Option set fields
  accountcategorycode?: number;           // Category
  industrycode?: number;                  // Industry
  statecode?: number;                     // Status
  statuscode?: number;                    // Status reason
  
  // Numeric fields
  revenue?: number;
  numberofemployees?: number;
  
  // Text fields
  description?: string;
  
  // Date fields
  createdon?: string;                     // ISO date string
  modifiedon?: string;
}

/**
 * Contact entity interface
 * Maps to Dataverse 'contact' entity
 */
export interface Contact {
  [key: string]: unknown;  // Index signature for EntityRecord compatibility
  
  contactid?: string;
  
  // Name fields
  firstname?: string;
  lastname?: string;
  fullname?: string;                      // Computed, read-only
  
  // Communication
  emailaddress1?: string;
  telephone1?: string;
  mobilephone?: string;
  
  // Job info
  jobtitle?: string;
  department?: string;
  
  // Lookups
  _parentcustomerid_value?: string;       // Account/Contact polymorphic
  _ownerid_value?: string;
  
  // Status
  statecode?: number;
  statuscode?: number;
  
  // Dates
  birthdate?: string;
  createdon?: string;
  modifiedon?: string;
}

/**
 * Incident (Case) entity interface
 * Maps to Dataverse 'incident' entity
 */
export interface Incident {
  [key: string]: unknown;  // Index signature for EntityRecord compatibility
  
  incidentid?: string;
  
  // Core fields
  title: string;
  description?: string;
  ticketnumber?: string;                  // Auto-generated
  
  // Priority and severity
  prioritycode?: number;
  severitycode?: number;
  
  // Lookups
  _customerid_value?: string;             // Customer (polymorphic)
  _primarycontactid_value?: string;
  _ownerid_value?: string;
  
  // Status
  statecode?: number;
  statuscode?: number;
  
  // Dates
  createdon?: string;
  modifiedon?: string;
  resolvedon?: string;
}

// ============================================================================
// Example: Creating Entity-Specific Services
// ============================================================================

/**
 * Create an Account service with pre-configured entity settings
 */
export function createAccountService(context: IPCFContext): CrudService<Account> {
  return createCrudService<Account>(context, 'account', {
    entitySetName: 'accounts',
    primaryIdAttribute: 'accountid',
  });
}

/**
 * Create a Contact service
 */
export function createContactService(context: IPCFContext): CrudService<Contact> {
  return createCrudService<Contact>(context, 'contact', {
    entitySetName: 'contacts',
    primaryIdAttribute: 'contactid',
  });
}

/**
 * Create an Incident (Case) service
 */
export function createIncidentService(context: IPCFContext): CrudService<Incident> {
  return createCrudService<Incident>(context, 'incident', {
    entitySetName: 'incidents',
    primaryIdAttribute: 'incidentid',
  });
}

// ============================================================================
// Example: PCF Control Usage
// ============================================================================

/**
 * Example PCF Control demonstrating CrudService usage
 * 
 * NOTE: This is a conceptual example. In actual PCF:
 * - context would be ComponentFramework.Context<IInputs>
 * - You'd implement StandardControl interface
 */
export class ExampleAccountControl {
  private _accountService!: CrudService<Account>;
  private _contactService!: CrudService<Contact>;
  private _container!: HTMLDivElement;

  /**
   * PCF init() lifecycle method
   */
  init(
    context: IPCFContext,
    _notifyOutputChanged: () => void,
    _state: Record<string, unknown>,
    container: HTMLDivElement
  ): void {
    this._container = container;
    
    // Initialize services
    this._accountService = createAccountService(context);
    this._contactService = createContactService(context);
    
    // Load initial data
    this.loadData();
  }

  /**
   * PCF updateView() lifecycle method
   */
  updateView(context: IPCFContext): void {
    // Update service contexts
    this._accountService.updateContext(context);
    this._contactService.updateContext(context);
  }

  /**
   * Example: Load and display an account
   */
  private async loadData(): Promise<void> {
    // Retrieve with specific columns
    const result = await this._accountService.retrieve(
      '00000000-0000-0000-0000-000000000001',
      {
        select: ['name', 'telephone1', 'emailaddress1', 'revenue'],
      }
    );

    if (result.success) {
      this.renderAccount(result.data);
    } else {
      this.renderError(result.error.userMessage);
    }
  }

  /**
   * Example: Create a new account
   */
  async createAccount(name: string, phone?: string): Promise<string | null> {
    const result = await this._accountService.create({
      name,
      telephone1: phone,
    });

    if (result.success) {
      console.log('Account created with ID:', result.data.id);
      return result.data.id;
    } else {
      console.error('Failed to create account:', result.error.userMessage);
      return null;
    }
  }

  /**
   * Example: Create account with primary contact
   */
  async createAccountWithContact(
    accountName: string,
    contactId: string
  ): Promise<string | null> {
    // Use setLookup helper for proper @odata.bind formatting
    const accountData = this._accountService.setLookup(
      { name: accountName },
      'primarycontactid',
      'contacts',
      contactId
    );

    const result = await this._accountService.create(accountData);
    
    if (result.success) {
      return result.data.id;
    }
    
    return null;
  }

  /**
   * Example: Update account fields
   */
  async updateAccountPhone(accountId: string, newPhone: string): Promise<boolean> {
    const result = await this._accountService.update(accountId, {
      telephone1: newPhone,
    });

    return result.success;
  }

  /**
   * Example: Upsert pattern (create or update)
   */
  async saveAccount(accountId: string | undefined, data: Partial<Account>): Promise<void> {
    const result = await this._accountService.upsert(accountId, data);

    if (result.success) {
      if (result.data.wasCreated) {
        console.log('New account created:', result.data.id);
      } else {
        console.log('Account updated:', result.data.id);
      }
    } else {
      console.error('Save failed:', result.error.userMessage);
    }
  }

  /**
   * Example: Delete with confirmation
   */
  async deleteAccount(accountId: string): Promise<boolean> {
    // First check if account exists
    const exists = await this._accountService.exists(accountId);
    if (!exists.success || !exists.data) {
      console.warn('Account does not exist');
      return false;
    }

    const result = await this._accountService.delete(accountId);
    
    if (result.success) {
      console.log('Account deleted');
      return true;
    }
    
    console.error('Delete failed:', result.error.userMessage);
    return false;
  }

  /**
   * Example: Batch create accounts
   */
  async importAccounts(names: string[]): Promise<number> {
    const records = names.map(name => ({ name }));
    
    const result = await this._accountService.createMany(records, {
      stopOnError: false, // Continue on errors
    });

    if (result.success) {
      console.log(`Created ${result.data.length} accounts`);
      return result.data.length;
    }
    
    return 0;
  }

  // UI rendering methods (simplified)
  private renderAccount(account: Account): void {
    this._container.innerHTML = `
      <div class="account-card">
        <h2>${account.name}</h2>
        <p>Phone: ${account.telephone1 ?? 'N/A'}</p>
        <p>Email: ${account.emailaddress1 ?? 'N/A'}</p>
        <p>Revenue: ${account.revenue ? `$${account.revenue.toLocaleString()}` : 'N/A'}</p>
      </div>
    `;
  }

  private renderError(message: string): void {
    this._container.innerHTML = `
      <div class="error-message">
        <p>${message}</p>
      </div>
    `;
  }

  /**
   * PCF destroy() lifecycle method
   */
  destroy(): void {
    this._container.innerHTML = '';
  }
}

// ============================================================================
// Example: Direct Usage (without class wrapper)
// ============================================================================

/**
 * Standalone function examples showing direct service usage
 */
export async function exampleDirectUsage(context: IPCFContext): Promise<void> {
  // Create service
  const accountService = createCrudService<Account>(context, 'account');

  // CREATE
  const createResult = await accountService.create({
    name: 'Acme Corporation',
    telephone1: '555-0100',
    industrycode: 1, // Accounting
  });

  if (!createResult.success) {
    console.error('Create failed:', createResult.error.message);
    return;
  }

  const accountId = createResult.data.id;
  console.log('Created account:', accountId);

  // RETRIEVE
  const getResult = await accountService.retrieve(accountId, {
    select: ['name', 'telephone1', 'createdon'],
  });

  if (getResult.success) {
    console.log('Account name:', getResult.data.name);
    console.log('Created on:', getResult.data.createdon);
  }

  // UPDATE
  const updateResult = await accountService.update(accountId, {
    description: 'Updated via CrudService',
    numberofemployees: 100,
  });

  if (updateResult.success) {
    console.log('Account updated successfully');
  }

  // CHECK EXISTS
  const existsResult = await accountService.exists(accountId);
  console.log('Account exists:', existsResult.success && existsResult.data);

  // RETRIEVE OR NULL (no error for not found)
  const maybeAccount = await accountService.retrieveOrNull('non-existent-id');
  if (maybeAccount.success) {
    console.log('Account or null:', maybeAccount.data); // null
  }

  // DELETE
  const deleteResult = await accountService.delete(accountId);
  if (deleteResult.success) {
    console.log('Account deleted');
  }
}
