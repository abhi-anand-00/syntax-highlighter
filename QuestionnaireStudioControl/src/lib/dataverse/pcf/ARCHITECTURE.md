# Dataverse Wrapper Architecture for PCF Controls

## 1. Class Responsibility Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PCF CONTROL LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  MyPCFControl                                                        │    │
│  │  - init(context) → initializes services                             │    │
│  │  - updateView(context) → refreshes data                             │    │
│  │  - destroy() → cleanup                                              │    │
│  └──────────────────────────────┬──────────────────────────────────────┘    │
└─────────────────────────────────┼───────────────────────────────────────────┘
                                  │ uses
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                      │
│                                                                              │
│  ┌──────────────────────┐    ┌──────────────────────┐                       │
│  │   CrudService<T>     │    │    QueryService      │                       │
│  │                      │    │                      │                       │
│  │ - create()           │    │ - retrieveMultiple() │                       │
│  │ - retrieve()         │    │ - executeFetchXml()  │                       │
│  │ - update()           │    │ - retrieveAll()      │                       │
│  │ - delete()           │    │ - getNextPage()      │                       │
│  │ - upsert()           │    │                      │                       │
│  └──────────┬───────────┘    └──────────┬───────────┘                       │
│             │                           │                                    │
│             └─────────┬─────────────────┘                                    │
│                       │ extends                                              │
│                       ▼                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    BaseDataverseService                              │    │
│  │                                                                      │    │
│  │  - context.webAPI access                                            │    │
│  │  - buildQueryString()                                               │    │
│  │  - getEntityMetadata()                                              │    │
│  │  - wrapOperation()                                                  │    │
│  └──────────────────────────────┬──────────────────────────────────────┘    │
└─────────────────────────────────┼───────────────────────────────────────────┘
                                  │ uses
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INFRASTRUCTURE LAYER                                 │
│                                                                              │
│  ┌──────────────────────┐    ┌──────────────────────┐                       │
│  │    ErrorHandler      │    │       Logger         │                       │
│  │                      │    │                      │                       │
│  │ - normalize()        │    │ - debug()            │                       │
│  │ - getUserMessage()   │    │ - info()             │                       │
│  │ - getErrorCode()     │    │ - warn()             │                       │
│  │ - isRetryable()      │    │ - error()            │                       │
│  └──────────────────────┘    └──────────────────────┘                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Class Responsibilities

### 2.1 Logger

**Purpose**: Environment-aware logging with structured output and level filtering.

| Responsibility | Description |
|----------------|-------------|
| Level filtering | Only output logs at or above configured minimum level |
| Structured output | Consistent format with timestamp, level, context |
| Environment detection | Auto-disable debug/info in production |
| Context binding | Create child loggers with preset context |

### 2.2 ErrorHandler

**Purpose**: Normalize Dataverse errors into consistent, typed error objects.

| Responsibility | Description |
|----------------|-------------|
| Error normalization | Convert raw Dataverse errors to typed structure |
| Code mapping | Map hex error codes to semantic codes |
| User messages | Provide localized, user-friendly error messages |
| Retry detection | Identify transient errors that can be retried |

### 2.3 BaseDataverseService

**Purpose**: Foundation class providing shared Dataverse access patterns.

| Responsibility | Description |
|----------------|-------------|
| Context management | Store and provide access to `context.webAPI` |
| Query building | Construct OData query strings from options |
| Metadata caching | Cache entity metadata to reduce API calls |
| Operation wrapping | Standardized try/catch with Result pattern |

### 2.4 CrudService<T>

**Purpose**: Type-safe CRUD operations for a specific entity type.

| Responsibility | Description |
|----------------|-------------|
| Create records | Insert new records with validation |
| Retrieve records | Get single record by ID with column selection |
| Update records | Modify existing records with concurrency |
| Delete records | Remove records by ID |
| Upsert records | Create or update based on existence |
| Lookup binding | Format lookup fields for OData |

### 2.5 QueryService

**Purpose**: Complex data retrieval with paging and FetchXML support.

| Responsibility | Description |
|----------------|-------------|
| OData queries | Execute retrieveMultiple with filters |
| FetchXML execution | Run FetchXML queries with paging |
| Auto-paging | Retrieve all records across pages |
| Page management | Handle paging cookies and nextLink |

---

## 3. Method Signatures

### 3.1 Logger

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  minLevel: LogLevel;
  enabled: boolean;
  prefix?: string;
}

interface ILogger {
  // Core logging methods
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;

  // Configuration
  configure(config: Partial<LoggerConfig>): void;
  
  // Child logger with context
  child(context: string): ILogger;
  
  // Environment helpers
  isProduction(): boolean;
  setMinLevel(level: LogLevel): void;
}
```

### 3.2 ErrorHandler

```typescript
type DataverseErrorCode =
  | 'NOT_FOUND'
  | 'ACCESS_DENIED'
  | 'DUPLICATE_RECORD'
  | 'INVALID_REFERENCE'
  | 'VALIDATION_ERROR'
  | 'CONCURRENCY_ERROR'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

interface NormalizedError {
  code: DataverseErrorCode;
  message: string;
  userMessage: string;
  isRetryable: boolean;
  originalError?: unknown;
  details?: Record<string, unknown>;
}

interface IErrorHandler {
  // Normalize any error to structured format
  normalize(error: unknown): NormalizedError;
  
  // Get user-friendly message for display
  getUserMessage(error: unknown, fallback?: string): string;
  
  // Get semantic error code
  getErrorCode(error: unknown): DataverseErrorCode;
  
  // Check if error is retryable (transient)
  isRetryable(error: unknown): boolean;
  
  // Check specific error types
  isNotFound(error: unknown): boolean;
  isAccessDenied(error: unknown): boolean;
  isDuplicate(error: unknown): boolean;
  
  // Format error for logging
  toLogFormat(error: unknown): Record<string, unknown>;
}
```

### 3.3 BaseDataverseService

```typescript
interface ODataOptions {
  select?: string[];
  filter?: string;
  orderBy?: string;
  top?: number;
  skip?: number;
  expand?: ExpandOption[];
  count?: boolean;
}

interface ExpandOption {
  property: string;
  select?: string[];
  filter?: string;
  orderBy?: string;
  top?: number;
}

interface EntityMetadata {
  logicalName: string;
  entitySetName: string;
  primaryIdAttribute: string;
  primaryNameAttribute: string;
  displayName: string;
  attributes: AttributeMetadata[];
}

interface DataverseResult<T> {
  success: true;
  data: T;
} | {
  success: false;
  error: NormalizedError;
}

abstract class BaseDataverseService {
  // Constructor accepts PCF context
  constructor(context: ComponentFramework.Context<IInputs>);
  
  // Protected access to webAPI
  protected get webApi(): ComponentFramework.WebApi;
  
  // Protected access to utility
  protected get utility(): ComponentFramework.Utility;
  
  // Build OData query string from options
  protected buildQueryString(options?: ODataOptions): string;
  
  // Build $expand clause
  protected buildExpandClause(expand: ExpandOption): string;
  
  // Get cached or fetch entity metadata
  protected getEntityMetadata(
    entityName: string,
    forceRefresh?: boolean
  ): Promise<DataverseResult<EntityMetadata>>;
  
  // Wrap async operation with error handling
  protected wrapOperation<T>(
    operation: string,
    entityType: string,
    fn: () => Promise<T>,
    recordId?: string
  ): Promise<DataverseResult<T>>;
  
  // Clear metadata cache
  clearMetadataCache(entityName?: string): void;
  
  // Update context (for updateView lifecycle)
  updateContext(context: ComponentFramework.Context<IInputs>): void;
}
```

### 3.4 CrudService<T>

```typescript
interface EntityReference {
  id: string;
  entityType: string;
  name?: string;
}

interface CreateResult {
  id: string;
  entityType: string;
}

interface UpdateOptions {
  concurrencyBehavior?: 'AlwaysOverwrite' | 'IfRowVersionMatches';
  eTag?: string;
}

class CrudService<T extends Record<string, unknown>> extends BaseDataverseService {
  // Constructor with entity configuration
  constructor(
    context: ComponentFramework.Context<IInputs>,
    entityLogicalName: string,
    entitySetName?: string
  );
  
  // Readonly entity info
  readonly entityLogicalName: string;
  readonly entitySetName: string;
  
  // Create a new record
  create(data: Partial<T>): Promise<DataverseResult<CreateResult>>;
  
  // Retrieve single record by ID
  retrieve(
    id: string,
    options?: ODataOptions
  ): Promise<DataverseResult<T>>;
  
  // Retrieve single record or null if not found
  retrieveOrNull(
    id: string,
    options?: ODataOptions
  ): Promise<DataverseResult<T | null>>;
  
  // Update existing record
  update(
    id: string,
    data: Partial<T>,
    options?: UpdateOptions
  ): Promise<DataverseResult<EntityReference>>;
  
  // Delete record by ID
  delete(id: string): Promise<DataverseResult<void>>;
  
  // Create or update based on existence
  upsert(
    id: string | undefined,
    data: Partial<T>
  ): Promise<DataverseResult<CreateResult | EntityReference>>;
  
  // Check if record exists
  exists(id: string): Promise<DataverseResult<boolean>>;
  
  // Helper: Format lookup value for create/update
  static formatLookupValue(
    targetEntity: string,
    targetId: string
  ): string;
  
  // Helper: Set lookup on data object
  setLookup(
    data: Partial<T>,
    lookupAttribute: string,
    targetEntity: string,
    targetId: string | null
  ): Partial<T>;
  
  // Helper: Clear lookup on data object
  clearLookup(
    data: Partial<T>,
    lookupAttribute: string
  ): Partial<T>;
}
```

### 3.5 QueryService

```typescript
interface QueryResult<T> {
  entities: T[];
  totalCount?: number;
  moreRecords: boolean;
  nextLink?: string;
  pagingCookie?: string;
}

interface FetchXmlOptions {
  fetchXml: string;
  page?: number;
  pagingCookie?: string;
  count?: number;
}

interface RetrieveAllOptions extends ODataOptions {
  maxRecords?: number;      // Safety limit (default: 5000)
  onProgress?: (loaded: number, total?: number) => void;
  signal?: AbortSignal;     // Cancellation support
}

class QueryService extends BaseDataverseService {
  // Constructor
  constructor(context: ComponentFramework.Context<IInputs>);
  
  // Execute OData query with paging support
  retrieveMultiple<T>(
    entityType: string,
    options?: ODataOptions,
    maxPageSize?: number
  ): Promise<DataverseResult<QueryResult<T>>>;
  
  // Get next page using nextLink
  getNextPage<T>(
    nextLink: string
  ): Promise<DataverseResult<QueryResult<T>>>;
  
  // Retrieve ALL records (auto-paging)
  retrieveAll<T>(
    entityType: string,
    options?: RetrieveAllOptions
  ): Promise<DataverseResult<T[]>>;
  
  // Execute FetchXML query
  executeFetchXml<T>(
    entityType: string,
    options: FetchXmlOptions
  ): Promise<DataverseResult<QueryResult<T>>>;
  
  // Execute FetchXML with auto-paging
  executeFetchXmlAll<T>(
    entityType: string,
    fetchXml: string,
    maxRecords?: number
  ): Promise<DataverseResult<T[]>>;
  
  // Count records matching filter
  count(
    entityType: string,
    filter?: string
  ): Promise<DataverseResult<number>>;
  
  // Check if any records match filter
  any(
    entityType: string,
    filter?: string
  ): Promise<DataverseResult<boolean>>;
  
  // Get first matching record or null
  firstOrNull<T>(
    entityType: string,
    options?: ODataOptions
  ): Promise<DataverseResult<T | null>>;
}
```

---

## 4. PCF Control Lifecycle Integration

### 4.1 Lifecycle Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PCF CONTROL LIFECYCLE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐                                                            │
│  │    init()   │ ← Called once when control loads                           │
│  └──────┬──────┘                                                            │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  1. Initialize Logger with environment detection                    │    │
│  │  2. Create ErrorHandler instance                                    │    │
│  │  3. Create service instances (CrudService, QueryService)            │    │
│  │  4. Load initial data (async, non-blocking)                         │    │
│  │  5. Render initial UI state (loading)                               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────┐                                                       │
│  │   updateView()   │ ← Called on property changes, form save, etc.        │
│  └────────┬─────────┘                                                       │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  1. Update service contexts (service.updateContext(context))        │    │
│  │  2. Check if data refresh needed (compare parameters)               │    │
│  │  3. Refresh data if needed                                          │    │
│  │  4. Re-render UI with new data                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│           │                                                                  │
│           │ (user interactions trigger data operations)                      │
│           ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  User Action (Create/Update/Delete)                                 │    │
│  │  1. Call appropriate service method                                 │    │
│  │  2. Handle Result (success/failure)                                 │    │
│  │  3. Show user feedback (toast/message)                              │    │
│  │  4. Refresh related data if needed                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────┐                                                            │
│  │  destroy()  │ ← Called when control unloads                              │
│  └──────┬──────┘                                                            │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  1. Cancel pending async operations                                 │    │
│  │  2. Clear metadata cache                                            │    │
│  │  3. Cleanup React root (if using React)                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Example PCF Control Structure

```typescript
// PCF Control Implementation Pattern
class MyPCFControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  
  // Service instances (initialized in init())
  private _accountService: CrudService<Account>;
  private _queryService: QueryService;
  private _logger: ILogger;
  private _errorHandler: IErrorHandler;
  
  // State
  private _container: HTMLDivElement;
  private _currentRecordId: string | null;
  private _abortController: AbortController;
  
  /**
   * INIT - Called once when control loads
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    // 1. Store container
    this._container = container;
    
    // 2. Initialize infrastructure
    this._logger = createLogger('MyPCFControl');
    this._errorHandler = createErrorHandler();
    
    // 3. Initialize services with context
    this._accountService = new CrudService<Account>(context, 'account');
    this._queryService = new QueryService(context);
    
    // 4. Create abort controller for cancellation
    this._abortController = new AbortController();
    
    // 5. Load initial data (non-blocking)
    this.loadInitialData(context);
    
    // 6. Render initial loading state
    this.renderLoading();
    
    this._logger.info('Control initialized');
  }
  
  /**
   * UPDATE VIEW - Called on property/context changes
   */
  public updateView(context: ComponentFramework.Context<IInputs>): void {
    // 1. Update service contexts
    this._accountService.updateContext(context);
    this._queryService.updateContext(context);
    
    // 2. Check if refresh needed
    const newRecordId = context.parameters.recordId?.raw;
    if (newRecordId !== this._currentRecordId) {
      this._currentRecordId = newRecordId;
      this.refreshData(newRecordId);
    }
    
    // 3. Re-render with current state
    this.render();
  }
  
  /**
   * DESTROY - Called when control unloads
   */
  public destroy(): void {
    // 1. Cancel pending operations
    this._abortController.abort();
    
    // 2. Clear caches
    this._accountService.clearMetadataCache();
    
    // 3. Cleanup DOM
    this._container.innerHTML = '';
    
    this._logger.info('Control destroyed');
  }
  
  /**
   * Data loading with proper error handling
   */
  private async loadInitialData(context: ComponentFramework.Context<IInputs>): Promise<void> {
    const recordId = context.parameters.recordId?.raw;
    if (!recordId) return;
    
    const result = await this._accountService.retrieve(recordId, {
      select: ['name', 'accountnumber', 'telephone1']
    });
    
    if (result.success) {
      this.renderData(result.data);
    } else {
      this._logger.error('Failed to load account', { error: result.error });
      this.renderError(result.error.userMessage);
    }
  }
}
```

### 4.3 Service Interaction Patterns

```typescript
// Pattern 1: Simple CRUD Operation
async function handleSave(data: Partial<Account>): Promise<void> {
  const result = await accountService.update(recordId, data);
  
  if (result.success) {
    showToast('Account saved successfully');
  } else {
    showError(result.error.userMessage);
  }
}

// Pattern 2: Query with Error Handling
async function loadContacts(accountId: string): Promise<Contact[]> {
  const result = await queryService.retrieveMultiple<Contact>('contact', {
    filter: `_parentcustomerid_value eq ${accountId}`,
    select: ['fullname', 'emailaddress1'],
    orderBy: 'fullname asc',
    top: 50
  });
  
  if (result.success) {
    return result.data.entities;
  } else {
    logger.error('Failed to load contacts', { accountId, error: result.error });
    return []; // Graceful degradation
  }
}

// Pattern 3: Chained Operations
async function createAndAssociate(): Promise<void> {
  // Create contact
  const createResult = await contactService.create({
    firstname: 'John',
    lastname: 'Doe'
  });
  
  if (!createResult.success) {
    showError(createResult.error.userMessage);
    return;
  }
  
  // Update account with new contact reference
  const updateResult = await accountService.update(accountId, 
    accountService.setLookup({}, 'primarycontactid', 'contact', createResult.data.id)
  );
  
  if (updateResult.success) {
    showToast('Contact created and linked');
  } else {
    // Rollback: delete the created contact
    await contactService.delete(createResult.data.id);
    showError('Failed to link contact');
  }
}

// Pattern 4: Parallel Queries
async function loadDashboardData(): Promise<DashboardData> {
  const [accountsResult, contactsResult, opportunitiesResult] = await Promise.all([
    queryService.retrieveMultiple<Account>('account', { top: 10 }),
    queryService.retrieveMultiple<Contact>('contact', { top: 10 }),
    queryService.retrieveMultiple<Opportunity>('opportunity', { top: 10 })
  ]);
  
  return {
    accounts: accountsResult.success ? accountsResult.data.entities : [],
    contacts: contactsResult.success ? contactsResult.data.entities : [],
    opportunities: opportunitiesResult.success ? opportunitiesResult.data.entities : []
  };
}
```

---

## 5. Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPENDENCY DIRECTION                          │
│                    (arrows = "depends on")                       │
└─────────────────────────────────────────────────────────────────┘

PCF Control
    │
    ├──────────────────┬─────────────────────┐
    │                  │                     │
    ▼                  ▼                     ▼
CrudService<T>    QueryService         (UI Components)
    │                  │
    └────────┬─────────┘
             │
             ▼
    BaseDataverseService
             │
             ├─────────────────┐
             │                 │
             ▼                 ▼
       ErrorHandler         Logger
             │                 │
             └────────┬────────┘
                      │
                      ▼
               (No dependencies)
```

---

## 6. File Structure

```
src/lib/dataverse/pcf/
├── types.ts                    # Shared type definitions
├── interfaces/
│   ├── ILogger.ts              # Logger interface
│   ├── IErrorHandler.ts        # ErrorHandler interface  
│   └── index.ts                # Interface exports
├── infrastructure/
│   ├── Logger.ts               # Logger implementation
│   ├── ErrorHandler.ts         # ErrorHandler implementation
│   └── index.ts                # Infrastructure exports
├── services/
│   ├── BaseDataverseService.ts # Abstract base class
│   ├── CrudService.ts          # Generic CRUD service
│   ├── QueryService.ts         # Query service
│   └── index.ts                # Service exports
├── index.ts                    # Public API exports
├── PCF_CODING_STANDARDS.md     # Coding standards
└── ARCHITECTURE.md             # This file
```
