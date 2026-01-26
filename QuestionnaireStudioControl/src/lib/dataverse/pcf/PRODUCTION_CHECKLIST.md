# PCF Dataverse Wrapper - Production Readiness Checklist

## Overview

This checklist ensures your PCF controls using the Dataverse wrapper framework are production-ready, performant, secure, and maintainable.

---

## ✅ Performance Considerations

### Data Fetching

| Item | Status | Notes |
|------|--------|-------|
| **Column Selection** | ☐ | Always use `$select` to retrieve only needed columns |
| **Row Limits** | ☐ | Use `$top` to limit records (default max: 5000) |
| **Pagination** | ☐ | Implement proper paging for large datasets |
| **Parallel Requests** | ☐ | Use `Promise.all()` for independent queries |
| **Request Cancellation** | ☐ | Use `AbortController` to cancel abandoned requests |

```typescript
// ✅ Good: Selective columns, limited rows, parallel
const [accounts, contacts] = await Promise.all([
  queryService.retrieveMultiple<Account>('account', {
    select: ['name', 'telephone1'],  // Only needed columns
    top: 50,                          // Limit results
    filter: "statecode eq 0"
  }),
  queryService.retrieveMultiple<Contact>('contact', {
    select: ['fullname', 'emailaddress1'],
    top: 50
  })
]);

// ❌ Bad: All columns, unlimited, sequential
const accounts = await queryService.retrieveMultiple('account');
const contacts = await queryService.retrieveMultiple('contact');
```

### Caching

| Item | Status | Notes |
|------|--------|-------|
| **Metadata Caching** | ☐ | Enable `enableMetadataCache: true` (default) |
| **Cache Invalidation** | ☐ | Clear cache on data changes if needed |
| **Static Data Caching** | ☐ | Cache option sets, lookup options that rarely change |
| **TTL Consideration** | ☐ | Set appropriate cache TTL (default: 5 minutes) |

```typescript
// Good: Cache lookup options
class LookupCache {
  private _cache = new Map<string, { data: unknown; expires: number }>();
  private _ttl = 5 * 60 * 1000; // 5 minutes
  
  async getOrFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this._cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data as T;
    }
    const data = await fetcher();
    this._cache.set(key, { data, expires: Date.now() + this._ttl });
    return data;
  }
}
```

### Rendering

| Item | Status | Notes |
|------|--------|-------|
| **Avoid Re-renders** | ☐ | Check for actual changes before re-rendering |
| **Debounce Inputs** | ☐ | Debounce search inputs (300-500ms) |
| **Virtualization** | ☐ | Use virtual scrolling for large lists |
| **Lazy Loading** | ☐ | Load data on demand, not upfront |

```typescript
// Debounce search
private _searchDebounce: number | null = null;

onSearchInput(value: string): void {
  if (this._searchDebounce) {
    clearTimeout(this._searchDebounce);
  }
  this._searchDebounce = window.setTimeout(() => {
    this.performSearch(value);
  }, 300);
}
```

### Memory Management

| Item | Status | Notes |
|------|--------|-------|
| **Cleanup in destroy()** | ☐ | Cancel pending requests, clear timeouts |
| **Remove Event Listeners** | ☐ | Clean up DOM event listeners |
| **Clear Large Data** | ☐ | Nullify large arrays/objects on destroy |
| **Abort Controllers** | ☐ | Abort all pending fetch operations |

```typescript
destroy(): void {
  // Cancel pending operations
  this._abortController?.abort();
  
  // Clear timeouts
  if (this._searchDebounce) {
    clearTimeout(this._searchDebounce);
  }
  
  // Clear caches
  this._accountService.clearMetadataCache();
  
  // Clear state
  this._state = null;
  
  // Clear DOM
  this._container.innerHTML = '';
}
```

---

## ✅ Error Handling Validation

### Error Handler Coverage

| Item | Status | Notes |
|------|--------|-------|
| **All Operations Wrapped** | ☐ | Every Dataverse call uses `execute()` wrapper |
| **User-Friendly Messages** | ☐ | Never show raw error codes to users |
| **Error Logging** | ☐ | All errors logged with context |
| **Retry Logic** | ☐ | Implement retry for transient errors |

```typescript
// Retry pattern for transient errors
async executeWithRetry<T>(
  fn: () => Promise<DataverseResult<T>>,
  maxRetries = 3
): Promise<DataverseResult<T>> {
  let lastError: NormalizedError | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await fn();
    
    if (result.success) {
      return result;
    }
    
    lastError = result.error;
    
    if (!result.error.isRetryable || attempt === maxRetries) {
      return result;
    }
    
    // Exponential backoff
    await this.delay(Math.pow(2, attempt) * 100);
  }
  
  return { success: false, error: lastError! };
}
```

### Error Scenarios

| Scenario | Handled | User Experience |
|----------|---------|-----------------|
| Network failure | ☐ | Show retry button, offline indicator |
| Record not found | ☐ | Navigate away or show "not found" |
| Access denied | ☐ | Show permission error, hide action |
| Validation error | ☐ | Highlight invalid fields |
| Timeout | ☐ | Show timeout message with retry |
| Rate limiting | ☐ | Show wait message, auto-retry |
| Duplicate record | ☐ | Show duplicate warning |

### Error Recovery

| Item | Status | Notes |
|------|--------|-------|
| **Retry Button** | ☐ | Provide manual retry for failed operations |
| **Partial Success** | ☐ | Handle batch operations with partial failure |
| **Graceful Degradation** | ☐ | Show partial data when some calls fail |
| **Error Boundaries** | ☐ | React ErrorBoundary for component crashes |

```typescript
// Graceful degradation
const [accountResult, contactsResult] = await Promise.all([
  this.loadAccount(accountId),
  this.loadContacts(accountId)
]);

if (!accountResult.success) {
  // Critical failure - show error
  this.showError(accountResult.error);
  return;
}

// Non-critical: show account even if contacts fail
const contacts = contactsResult.success ? contactsResult.data : [];
if (!contactsResult.success) {
  this._logger.warn('Failed to load contacts', contactsResult.error);
}

this.render(accountResult.data, contacts);
```

---

## ✅ Security Considerations

### Input Validation

| Item | Status | Notes |
|------|--------|-------|
| **Sanitize User Input** | ☐ | Never trust user input in queries |
| **Escape Special Characters** | ☐ | Escape quotes in OData filters |
| **Length Limits** | ☐ | Enforce max length on text fields |
| **Type Validation** | ☐ | Validate GUIDs, numbers, dates |

```typescript
// Input validation with zod
import { z } from 'zod';

const accountSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Name is required")
    .max(160, "Name must be under 160 characters")
    .regex(/^[^<>]*$/, "Name contains invalid characters"),
  telephone1: z.string()
    .optional()
    .refine(val => !val || /^[\d\s\-\+\(\)]+$/.test(val), "Invalid phone format"),
  emailaddress1: z.string()
    .optional()
    .email("Invalid email format"),
});

// Validate before save
async saveAccount(data: unknown): Promise<void> {
  const validation = accountSchema.safeParse(data);
  
  if (!validation.success) {
    this.showValidationErrors(validation.error.errors);
    return;
  }
  
  await this._accountService.update(accountId, validation.data);
}
```

### OData/FetchXML Injection Prevention

| Item | Status | Notes |
|------|--------|-------|
| **Escape Filter Values** | ☐ | Properly escape string values |
| **Parameterized Queries** | ☐ | Use builder patterns, not string concat |
| **Validate GUIDs** | ☐ | Validate GUID format before use |
| **Whitelist Operators** | ☐ | Only allow known filter operators |

```typescript
// ✅ Safe: Escape user input
function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

function buildFilter(searchTerm: string): string {
  const escaped = escapeODataString(searchTerm.trim());
  return `contains(name, '${escaped}')`;
}

// ✅ Safe: Validate GUID
function isValidGuid(id: string): boolean {
  const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return guidPattern.test(id);
}

async retrieve(id: string): Promise<DataverseResult<Account>> {
  if (!isValidGuid(id)) {
    return this.failure({
      code: 'INVALID_ARGUMENT',
      message: 'Invalid record ID format',
      userMessage: 'Invalid record identifier.',
      isRetryable: false,
    });
  }
  return this._accountService.retrieve(id);
}

// ❌ Dangerous: Direct string interpolation
const filter = `name eq '${userInput}'`;  // SQL injection risk!
```

### XSS Prevention

| Item | Status | Notes |
|------|--------|-------|
| **Escape HTML Output** | ☐ | Never render raw user data as HTML |
| **Avoid innerHTML** | ☐ | Use textContent or proper escaping |
| **Sanitize Rich Text** | ☐ | Use DOMPurify for HTML content |
| **CSP Headers** | ☐ | Ensure proper Content-Security-Policy |

```typescript
// Safe HTML rendering
private escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

private render(account: Account): void {
  // ✅ Safe: Escaped
  this._container.innerHTML = `
    <h2>${this.escapeHtml(account.name)}</h2>
    <p>${this.escapeHtml(account.description ?? '')}</p>
  `;
  
  // ❌ Dangerous: Raw HTML
  // this._container.innerHTML = `<h2>${account.name}</h2>`;
}
```

### Data Protection

| Item | Status | Notes |
|------|--------|-------|
| **No Sensitive Logging** | ☐ | Never log PII, passwords, tokens |
| **Minimal Data Exposure** | ☐ | Only fetch/display needed fields |
| **Respect RLS** | ☐ | Don't bypass Dataverse security |
| **Secure Transport** | ☐ | HTTPS only (handled by platform) |

```typescript
// ✅ Good: Log without sensitive data
this._logger.info('User authenticated', { userId: user.id });

// ❌ Bad: Logging sensitive data
this._logger.info('User login', { email: user.email, password: user.password });
```

---

## ✅ Future Extensibility

### Code Organization

| Item | Status | Notes |
|------|--------|-------|
| **Single Responsibility** | ☐ | Each class/function does one thing |
| **Dependency Injection** | ☐ | Services accept dependencies via constructor |
| **Interface Segregation** | ☐ | Small, focused interfaces |
| **Open/Closed Principle** | ☐ | Extend via inheritance, not modification |

```typescript
// Good: Extensible entity service
export class AccountService extends CrudService<Account> {
  constructor(context: IPCFContext) {
    super(context, { entityLogicalName: 'account' });
  }
  
  // Entity-specific methods
  async getAccountsWithRevenue(minRevenue: number): Promise<DataverseResult<Account[]>> {
    return this.queryService.retrieveAll<Account>('account', {
      filter: `revenue ge ${minRevenue}`,
      select: ['name', 'revenue'],
    });
  }
}
```

### Configuration

| Item | Status | Notes |
|------|--------|-------|
| **Externalized Config** | ☐ | No hardcoded URLs, entity names in UI |
| **Feature Flags** | ☐ | Toggle features without code changes |
| **Environment Detection** | ☐ | Different behavior for dev/prod |
| **Versioning** | ☐ | Version service APIs for backward compat |

```typescript
// Configuration object
interface AppConfig {
  maxPageSize: number;
  enableDebugLogging: boolean;
  cacheTimeoutMs: number;
  features: {
    enableBatchOperations: boolean;
    enableOfflineMode: boolean;
  };
}

const defaultConfig: AppConfig = {
  maxPageSize: 50,
  enableDebugLogging: false,
  cacheTimeoutMs: 5 * 60 * 1000,
  features: {
    enableBatchOperations: true,
    enableOfflineMode: false,
  },
};
```

### Testing Support

| Item | Status | Notes |
|------|--------|-------|
| **Mock-Friendly Design** | ☐ | Services accept interfaces, not concretions |
| **Testable Functions** | ☐ | Pure functions where possible |
| **Isolated Side Effects** | ☐ | Side effects in dedicated services |
| **Test Coverage** | ☐ | >80% coverage for services |

```typescript
// Mock-friendly: Accept interface
class AccountController {
  constructor(
    private _accountService: CrudService<Account>, // Interface, not concrete
    private _queryService: QueryService
  ) {}
}

// In tests
const mockService = createMockCrudService<Account>();
const controller = new AccountController(mockService, mockQueryService);
```

---

## ✅ Common PCF Pitfalls to Avoid

### Lifecycle Issues

| Pitfall | Impact | Solution |
|---------|--------|----------|
| **Init work in updateView** | Performance | Initialize services in `init()`, update context in `updateView()` |
| **Missing destroy cleanup** | Memory leaks | Cancel requests, clear timeouts, remove listeners |
| **Not updating context** | Stale data | Call `service.updateContext(context)` in every `updateView()` |
| **Blocking init** | Slow load | Use async/await, don't block rendering |

```typescript
// ❌ Wrong: Heavy work in updateView
updateView(context: Context): void {
  this._service = new CrudService(context); // Creates new service every update!
  this.loadAllData(); // Loads data on every property change!
}

// ✅ Correct: Initialize once, update context
init(context: Context): void {
  this._service = new CrudService(context);
  this.loadInitialData();
}

updateView(context: Context): void {
  this._service.updateContext(context);
  // Only reload if meaningful property changed
  if (this.hasRelevantChanges(context)) {
    this.loadData();
  }
}
```

### Forbidden APIs

| API | Issue | Alternative |
|-----|-------|-------------|
| `Xrm.WebApi` | Not available in Canvas | Use `context.webAPI` |
| `Xrm.Page` | Deprecated, not in PCF | Use control parameters |
| `parent.Xrm` | Security violation | N/A - redesign approach |
| `window.fetch` for Dataverse | Auth/CORS issues | Use `context.webAPI` |
| `localStorage` | Not persistent | Use control state or Dataverse |
| `eval()` | Security violation | Never use |

### Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| **Fire-and-forget async** | Unhandled errors | Always await and handle errors |
| **String building FetchXML** | Injection risk | Use template functions |
| **Ignoring paging** | Missing data | Always handle `moreRecords` |
| **Hardcoded entity names** | Inflexibility | Use configuration |
| **Console.log in prod** | Performance, noise | Use Logger with levels |
| **Any type usage** | Type safety loss | Define proper interfaces |

```typescript
// ❌ Fire-and-forget
handleSave(): void {
  this._service.update(id, data); // No await, no error handling!
}

// ✅ Proper async handling
async handleSave(): Promise<void> {
  const result = await this._service.update(id, data);
  if (!result.success) {
    this.showError(result.error.userMessage);
  }
}
```

### React-Specific Pitfalls

| Pitfall | Impact | Solution |
|---------|--------|----------|
| **New objects in render** | Infinite re-renders | Memoize with useMemo/useCallback |
| **Missing keys** | React warnings, bugs | Add unique keys to lists |
| **Direct DOM manipulation** | Conflicts with React | Use refs or state |
| **Async in useEffect cleanup** | Race conditions | Use abort controllers |

---

## ✅ Pre-Deployment Checklist

### Code Quality

| Item | Status |
|------|--------|
| All TypeScript errors resolved | ☐ |
| ESLint/Prettier checks pass | ☐ |
| No `console.log` statements (use Logger) | ☐ |
| No `any` types (use proper interfaces) | ☐ |
| No TODO comments in production code | ☐ |

### Testing

| Item | Status |
|------|--------|
| Unit tests for all services | ☐ |
| Integration tests with mock context | ☐ |
| Manual testing in Model-driven app | ☐ |
| Manual testing in Canvas app (if applicable) | ☐ |
| Error scenarios tested | ☐ |

### Performance

| Item | Status |
|------|--------|
| Network calls minimized | ☐ |
| Proper column selection | ☐ |
| Pagination implemented | ☐ |
| No memory leaks (tested with DevTools) | ☐ |
| Debouncing on inputs | ☐ |

### Security

| Item | Status |
|------|--------|
| Input validation on all user inputs | ☐ |
| HTML properly escaped | ☐ |
| No sensitive data in logs | ☐ |
| OData/FetchXML injection prevented | ☐ |

### Documentation

| Item | Status |
|------|--------|
| README with setup instructions | ☐ |
| API documentation for services | ☐ |
| Control usage documentation | ☐ |
| Known limitations documented | ☐ |

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────┐
│                    PCF PRODUCTION CHECKLIST                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INIT                          UPDATEVIEW                       │
│  ├─ Create services            ├─ Update service contexts       │
│  ├─ Initialize logger          ├─ Check for meaningful changes  │
│  ├─ Load initial data          └─ Refresh only if needed        │
│  └─ Render loading state                                        │
│                                                                  │
│  DESTROY                       ERROR HANDLING                   │
│  ├─ Abort pending requests     ├─ Always use Result pattern     │
│  ├─ Clear timeouts             ├─ Log with context              │
│  ├─ Remove event listeners     ├─ Show user-friendly messages   │
│  └─ Clear caches               └─ Implement retry for transient │
│                                                                  │
│  NEVER DO                      ALWAYS DO                        │
│  ├─ Use Xrm.* APIs             ├─ Use context.webAPI            │
│  ├─ Fire-and-forget async      ├─ Await and handle errors       │
│  ├─ Hardcode entity names      ├─ Use configuration             │
│  ├─ Build SQL with strings     ├─ Use parameterized queries     │
│  └─ Log sensitive data         └─ Use Logger abstraction        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```
