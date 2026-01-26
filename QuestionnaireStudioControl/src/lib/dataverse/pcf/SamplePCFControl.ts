/**
 * Sample PCF Control using Dataverse Wrapper Services
 * 
 * This demonstrates a realistic PCF control implementation that:
 * - Initializes services in init()
 * - Uses CrudService for CRUD operations
 * - Uses QueryService for queries
 * - Handles errors via ErrorHandler
 * - Has NO direct context.webAPI calls
 * 
 * Control Purpose: Account Quick View with related contacts
 */

import type { IPCFContext, DataverseResult, NormalizedError } from './types';
import { createLogger, type ILogger } from './Logger';
import { createErrorHandler, type IErrorHandler } from './ErrorHandler';
import { CrudService, createCrudService } from './CrudService';
import { QueryService, createQueryService } from './QueryService';
import { FetchXmlTemplates } from './QueryService.examples';
import type { Account, Contact } from './CrudService.examples';

// ============================================================================
// Control Types
// ============================================================================

/**
 * PCF Input Properties (defined in ControlManifest.xml)
 */
interface IInputs {
  accountId: { raw: string | null };
  maxContacts: { raw: number | null };
}

/**
 * PCF Output Properties
 */
interface IOutputs {
  selectedContactId?: string;
}

/**
 * Internal control state
 */
interface ControlState {
  account: Account | null;
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;
  selectedContactId: string | null;
}

// ============================================================================
// PCF Control Implementation
// ============================================================================

/**
 * AccountQuickView PCF Control
 * 
 * Displays account details and related contacts.
 * Demonstrates proper service layer usage.
 */
export class AccountQuickViewControl {
  // ============================================================================
  // Private Properties
  // ============================================================================
  
  // Services (initialized in init)
  private _accountService!: CrudService<Account>;
  private _contactService!: CrudService<Contact>;
  private _queryService!: QueryService;
  private _errorHandler!: IErrorHandler;
  private _logger!: ILogger;

  // PCF lifecycle
  private _container!: HTMLDivElement;
  private _notifyOutputChanged!: () => void;
  private _context!: IPCFContext;

  // State
  private _state: ControlState = {
    account: null,
    contacts: [],
    isLoading: false,
    error: null,
    selectedContactId: null,
  };

  // Abort controller for cancelling pending requests
  private _abortController: AbortController | null = null;

  // Current account ID (for change detection)
  private _currentAccountId: string | null = null;

  // ============================================================================
  // PCF Lifecycle: init
  // ============================================================================

  /**
   * Called once when control is instantiated
   * 
   * KEY PATTERN: Initialize all services here, NOT in updateView
   */
  public init(
    context: IPCFContext,
    notifyOutputChanged: () => void,
    _state: Record<string, unknown>,
    container: HTMLDivElement
  ): void {
    // Store references
    this._context = context;
    this._notifyOutputChanged = notifyOutputChanged;
    this._container = container;

    // Initialize infrastructure services
    this._logger = createLogger('AccountQuickView');
    this._errorHandler = createErrorHandler(this._logger);

    // Initialize data services
    // Note: Services are initialized ONCE, context is updated in updateView
    this._accountService = createCrudService<Account>(context, 'account');
    this._contactService = createCrudService<Contact>(context, 'contact');
    this._queryService = createQueryService(context);

    this._logger.info('Control initialized');

    // Render initial loading state
    this.render();

    // Load initial data if account ID is provided
    const accountId = this.getAccountIdFromContext(context);
    if (accountId) {
      this.loadAccountData(accountId);
    }
  }

  // ============================================================================
  // PCF Lifecycle: updateView
  // ============================================================================

  /**
   * Called when any bound property changes
   * 
   * KEY PATTERN: 
   * - Update service contexts
   * - Detect meaningful changes
   * - Only reload if necessary
   */
  public updateView(context: IPCFContext): void {
    this._context = context;

    // IMPORTANT: Update all service contexts
    this._accountService.updateContext(context);
    this._contactService.updateContext(context);
    this._queryService.updateContext(context);

    // Check if account ID changed
    const newAccountId = this.getAccountIdFromContext(context);
    
    if (newAccountId !== this._currentAccountId) {
      this._logger.debug('Account ID changed', { 
        from: this._currentAccountId, 
        to: newAccountId 
      });
      
      this._currentAccountId = newAccountId;
      
      if (newAccountId) {
        this.loadAccountData(newAccountId);
      } else {
        this.clearState();
        this.render();
      }
    }
  }

  // ============================================================================
  // PCF Lifecycle: getOutputs
  // ============================================================================

  /**
   * Return output property values
   */
  public getOutputs(): IOutputs {
    return {
      selectedContactId: this._state.selectedContactId ?? undefined,
    };
  }

  // ============================================================================
  // PCF Lifecycle: destroy
  // ============================================================================

  /**
   * Cleanup when control is removed
   * 
   * KEY PATTERN: Cancel pending operations, clear caches
   */
  public destroy(): void {
    // Cancel any pending requests
    this._abortController?.abort();
    
    // Clear metadata cache
    this._accountService.clearMetadataCache();
    this._contactService.clearMetadataCache();
    this._queryService.clearMetadataCache();

    // Clear container
    this._container.innerHTML = '';

    this._logger.info('Control destroyed');
  }

  // ============================================================================
  // Data Operations (using services only)
  // ============================================================================

  /**
   * Load account and related contacts
   * 
   * KEY PATTERN: All data access through services, handle errors consistently
   */
  private async loadAccountData(accountId: string): Promise<void> {
    // Cancel any pending request
    this._abortController?.abort();
    this._abortController = new AbortController();

    // Set loading state
    this.setState({ isLoading: true, error: null });
    this.render();

    try {
      // Load account and contacts in parallel
      const [accountResult, contactsResult] = await Promise.all([
        this.loadAccount(accountId),
        this.loadContacts(accountId),
      ]);

      // Handle results
      if (!accountResult.success) {
        this.handleError(accountResult.error, 'load account');
        return;
      }

      // Contacts failure is non-fatal
      const contacts = contactsResult.success ? contactsResult.data : [];
      if (!contactsResult.success) {
        this._logger.warn('Failed to load contacts, showing account only', {
          error: contactsResult.error.message,
        });
      }

      // Update state with loaded data
      this.setState({
        account: accountResult.data,
        contacts,
        isLoading: false,
        error: null,
      });

      this._logger.info('Account data loaded', {
        accountId,
        contactCount: contacts.length,
      });

    } catch (error) {
      // Handle unexpected errors
      const normalized = this._errorHandler.normalize(error);
      this.handleError(normalized, 'load data');
    }

    this.render();
  }

  /**
   * Load account using CrudService
   */
  private async loadAccount(accountId: string): Promise<DataverseResult<Account>> {
    return this._accountService.retrieve(accountId, {
      select: [
        'name',
        'accountnumber',
        'telephone1',
        'emailaddress1',
        'websiteurl',
        'revenue',
        'numberofemployees',
        'description',
      ],
    });
  }

  /**
   * Load contacts using QueryService with FetchXML
   */
  private async loadContacts(accountId: string): Promise<DataverseResult<Contact[]>> {
    const maxContacts = this.getMaxContactsFromContext() ?? 10;
    
    // Use centralized FetchXML template
    const fetchXml = FetchXmlTemplates.accountContacts(accountId);

    const result = await this._queryService.executeFetchXml<Contact>('contact', {
      fetchXml,
      count: maxContacts,
    });

    if (result.success) {
      return { success: true, data: result.data.entities };
    }

    return result as DataverseResult<Contact[]>;
  }

  /**
   * Create a new contact for the account
   */
  public async createContact(
    firstName: string,
    lastName: string,
    email?: string
  ): Promise<string | null> {
    if (!this._currentAccountId) {
      this._logger.warn('Cannot create contact: no account selected');
      return null;
    }

    this.setState({ isLoading: true });
    this.render();

    // Build contact data with lookup binding
    const contactData = this._contactService.setLookup(
      {
        firstname: firstName,
        lastname: lastName,
        emailaddress1: email,
      } as Partial<Contact>,
      'parentcustomerid_account', // Polymorphic lookup
      'accounts',
      this._currentAccountId
    );

    const result = await this._contactService.create(contactData);

    if (result.success) {
      this._logger.info('Contact created', { id: result.data.id });
      
      // Refresh contacts list
      await this.loadAccountData(this._currentAccountId);
      
      return result.data.id;
    } else {
      this.handleError(result.error, 'create contact');
      return null;
    }
  }

  /**
   * Update account phone number
   */
  public async updateAccountPhone(newPhone: string): Promise<boolean> {
    if (!this._currentAccountId) return false;

    const result = await this._accountService.update(this._currentAccountId, {
      telephone1: newPhone,
    });

    if (result.success) {
      // Update local state
      if (this._state.account) {
        this.setState({
          account: { ...this._state.account, telephone1: newPhone },
        });
        this.render();
      }
      this._logger.info('Account phone updated');
      return true;
    } else {
      this.handleError(result.error, 'update phone');
      return false;
    }
  }

  /**
   * Delete a contact
   */
  public async deleteContact(contactId: string): Promise<boolean> {
    const result = await this._contactService.delete(contactId);

    if (result.success) {
      // Remove from local state
      this.setState({
        contacts: this._state.contacts.filter(c => c.contactid !== contactId),
      });
      this.render();
      this._logger.info('Contact deleted', { contactId });
      return true;
    } else {
      this.handleError(result.error, 'delete contact');
      return false;
    }
  }

  /**
   * Select a contact (outputs to form)
   */
  public selectContact(contactId: string): void {
    this.setState({ selectedContactId: contactId });
    this._notifyOutputChanged();
    this.render();
  }

  // ============================================================================
  // Error Handling (using ErrorHandler)
  // ============================================================================

  /**
   * Handle errors consistently
   * 
   * KEY PATTERN: Use ErrorHandler to get user-friendly messages
   */
  private handleError(error: NormalizedError, operation: string): void {
    this._logger.error(`Failed to ${operation}`, {
      code: error.code,
      message: error.message,
      isRetryable: error.isRetryable,
    });

    this.setState({
      isLoading: false,
      error: error.userMessage,
    });

    this.render();
  }

  // ============================================================================
  // State Management
  // ============================================================================

  private setState(partial: Partial<ControlState>): void {
    this._state = { ...this._state, ...partial };
  }

  private clearState(): void {
    this._state = {
      account: null,
      contacts: [],
      isLoading: false,
      error: null,
      selectedContactId: null,
    };
  }

  // ============================================================================
  // Context Helpers
  // ============================================================================

  private getAccountIdFromContext(context: IPCFContext): string | null {
    const inputs = context as unknown as { parameters: IInputs };
    return inputs.parameters?.accountId?.raw ?? null;
  }

  private getMaxContactsFromContext(): number | null {
    const inputs = this._context as unknown as { parameters: IInputs };
    return inputs.parameters?.maxContacts?.raw ?? null;
  }

  // ============================================================================
  // Rendering
  // ============================================================================

  private render(): void {
    const { account, contacts, isLoading, error, selectedContactId } = this._state;

    // Loading state
    if (isLoading) {
      this._container.innerHTML = `
        <div class="pcf-loading">
          <div class="spinner"></div>
          <span>Loading...</span>
        </div>
      `;
      return;
    }

    // Error state
    if (error) {
      this._container.innerHTML = `
        <div class="pcf-error">
          <span class="error-icon">⚠️</span>
          <span class="error-message">${this.escapeHtml(error)}</span>
          <button class="retry-btn" onclick="this.closest('.pcf-error').dispatchEvent(new CustomEvent('retry'))">
            Retry
          </button>
        </div>
      `;
      
      // Add retry handler
      this._container.querySelector('.pcf-error')?.addEventListener('retry', () => {
        if (this._currentAccountId) {
          this.loadAccountData(this._currentAccountId);
        }
      });
      return;
    }

    // Empty state
    if (!account) {
      this._container.innerHTML = `
        <div class="pcf-empty">
          <span>No account selected</span>
        </div>
      `;
      return;
    }

    // Account details
    this._container.innerHTML = `
      <div class="account-quick-view">
        <div class="account-header">
          <h2 class="account-name">${this.escapeHtml(account.name)}</h2>
          ${account.accountnumber ? `<span class="account-number">${this.escapeHtml(account.accountnumber)}</span>` : ''}
        </div>
        
        <div class="account-details">
          <div class="detail-row">
            <label>Phone:</label>
            <span>${account.telephone1 ?? 'N/A'}</span>
          </div>
          <div class="detail-row">
            <label>Email:</label>
            <span>${account.emailaddress1 ?? 'N/A'}</span>
          </div>
          ${account.websiteurl ? `
            <div class="detail-row">
              <label>Website:</label>
              <a href="${this.escapeHtml(account.websiteurl)}" target="_blank">${this.escapeHtml(account.websiteurl)}</a>
            </div>
          ` : ''}
          ${account.revenue ? `
            <div class="detail-row">
              <label>Revenue:</label>
              <span>$${Number(account.revenue).toLocaleString()}</span>
            </div>
          ` : ''}
          ${account.numberofemployees ? `
            <div class="detail-row">
              <label>Employees:</label>
              <span>${account.numberofemployees.toLocaleString()}</span>
            </div>
          ` : ''}
        </div>

        <div class="contacts-section">
          <h3>Contacts (${contacts.length})</h3>
          ${contacts.length > 0 ? `
            <ul class="contacts-list">
              ${contacts.map(contact => `
                <li class="contact-item ${contact.contactid === selectedContactId ? 'selected' : ''}"
                    data-contact-id="${contact.contactid}">
                  <div class="contact-info">
                    <span class="contact-name">${this.escapeHtml(contact.fullname ?? 'Unnamed')}</span>
                    ${contact.jobtitle ? `<span class="contact-title">${this.escapeHtml(contact.jobtitle)}</span>` : ''}
                  </div>
                  <div class="contact-actions">
                    ${contact.emailaddress1 ? `<a href="mailto:${contact.emailaddress1}" class="email-link">📧</a>` : ''}
                    ${contact.telephone1 ? `<a href="tel:${contact.telephone1}" class="phone-link">📞</a>` : ''}
                  </div>
                </li>
              `).join('')}
            </ul>
          ` : `
            <div class="no-contacts">No contacts found</div>
          `}
        </div>
      </div>
    `;

    // Add click handlers for contact selection
    this._container.querySelectorAll('.contact-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const contactId = (e.currentTarget as HTMLElement).dataset.contactId;
        if (contactId) {
          this.selectContact(contactId);
        }
      });
    });
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// ============================================================================
// Control Factory
// ============================================================================

/**
 * Factory function to create control instance
 * Used by PCF framework
 */
export function createAccountQuickViewControl(): AccountQuickViewControl {
  return new AccountQuickViewControl();
}
