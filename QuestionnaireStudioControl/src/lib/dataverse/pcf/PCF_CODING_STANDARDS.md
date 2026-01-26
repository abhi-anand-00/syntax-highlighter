# PCF Coding Standards for Dataverse Operations

## 1. PCF-Specific Constraints

### Environment Context
- **Runtime**: Model-driven apps, Canvas apps (PCF-hosted)
- **API Access**: `ComponentFramework.Context` only
- **Sandbox**: Runs in isolated iframe with restricted globals

---

## 2. Import Path Guidelines

### ⚠️ CRITICAL: Avoid Path Aliases in PCF Code

**Problem**: Vite/webpack path aliases like `@/` don't work in PCF builds.

```typescript
// ❌ BROKEN in PCF - alias won't resolve
import { AnswerSet } from "@/types/questionnaire";
import { Logger } from "@/lib/core/logger";

// ✅ WORKS in PCF - relative imports are portable
import { AnswerSet } from "../types/questionnaire";
import { Logger } from "../../core/logger";
```

**Why?**
- PCF uses its own build tooling (pac CLI / webpack)
- Path aliases like `@` are configured in `vite.config.ts` or `tsconfig.json`
- PCF's bundler doesn't inherit these configurations

**Best Practice for Portable Code:**
1. Use relative imports (`../`, `./`) for all internal modules
2. Keep related files close together to minimize path depth
3. Use barrel exports (`index.ts`) to simplify imports

```typescript
// shared/services/index.ts - barrel export
export { CrudService } from './crud/CrudService';
export { QueryService } from './query/QueryService';
export { Logger } from './core/Logger';

// In your control - clean relative import
import { CrudService, QueryService, Logger } from '../../shared/services';
```

---

## 2. Allowed vs Forbidden APIs

### ✅ ALLOWED APIs

| API | Usage |
|-----|-------|
| `context.webAPI.createRecord()` | Create Dataverse records |
| `context.webAPI.retrieveRecord()` | Get single record by ID |
| `context.webAPI.updateRecord()` | Update existing record |
| `context.webAPI.deleteRecord()` | Delete record by ID |
| `context.webAPI.retrieveMultipleRecords()` | OData queries with paging |
| `context.utils.getEntityMetadata()` | Entity/attribute metadata |
| `context.navigation.*` | Navigation APIs |
| `context.device.*` | Device capabilities |
| `context.formatting.*` | Value formatting |
| `context.resources.getString()` | Localized strings |

### ❌ FORBIDDEN APIs

| API | Reason |
|-----|--------|
| `Xrm.WebApi` | Not available in Canvas apps |
| `Xrm.Page` | Deprecated, not in PCF sandbox |
| `formContext` | Form-specific, not in PCF |
| `parent.Xrm` | Frame-breaking, blocked |
| `window.fetch()` for Dataverse | Bypasses auth, CORS issues |
| `XMLHttpRequest` | Use context.webAPI instead |
| `localStorage` | Not persistent across sessions |
| `sessionStorage` | Cleared on navigation |
| `eval()` / `new Function()` | Security violation |

---

## 3. Async/Await Rules

### ✅ DO

```typescript
// Always use async/await for Dataverse calls
async function getAccount(context: ComponentFramework.Context, id: string) {
  try {
    const result = await context.webAPI.retrieveRecord('account', id, '?$select=name');
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: normalizeError(error) };
  }
}

// Parallel independent calls
const [accounts, contacts] = await Promise.all([
  context.webAPI.retrieveMultipleRecords('account', '?$top=10'),
  context.webAPI.retrieveMultipleRecords('contact', '?$top=10')
]);

// Sequential dependent calls
const account = await context.webAPI.retrieveRecord('account', id);
const contacts = await context.webAPI.retrieveMultipleRecords(
  'contact', 
  `?$filter=_parentcustomerid_value eq ${id}`
);
```

### ❌ DON'T

```typescript
// Never use .then() chains in PCF
context.webAPI.retrieveRecord('account', id)
  .then(result => { /* nested callback hell */ });

// Never fire-and-forget without error handling
context.webAPI.deleteRecord('account', id); // Missing await!

// Never block with synchronous patterns
while (!dataLoaded) { /* spin lock */ }
```

---

## 4. Error Handling Strategy

### Standard Error Wrapper

```typescript
interface DataverseResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    userMessage: string;
    details?: unknown;
  };
}
```

### Error Code Mapping

| Dataverse Code | Internal Code | User Message |
|----------------|---------------|--------------|
| `0x80040217` | `NOT_FOUND` | Record not found or deleted |
| `0x80040220` | `ACCESS_DENIED` | Insufficient permissions |
| `0x80040333` | `DUPLICATE_RECORD` | Duplicate record exists |
| `0x8004431A` | `INVALID_REFERENCE` | Referenced record missing |
| `0x80048306` | `VALIDATION_ERROR` | Required field missing |
| `-2147220891` | `TIMEOUT` | Request timed out |

### Error Handling Rules

1. **Never throw from service layer** - return `Result<T>` objects
2. **Log all errors** with context (entity, operation, ID)
3. **Provide user-friendly messages** - never show raw error codes
4. **Preserve original error** in `details` for debugging

---

## 5. Logging Strategy

### Log Levels

| Level | When to Use | Production |
|-------|-------------|------------|
| `DEBUG` | Detailed flow tracing | ❌ Off |
| `INFO` | Key operations (CRUD success) | ❌ Off |
| `WARN` | Recoverable issues | ✅ On |
| `ERROR` | Failures requiring attention | ✅ On |

### Logging Rules

```typescript
// ✅ DO - Structured logging with context
logger.info('Record created', { 
  entity: 'account', 
  id: result.id,
  duration: Date.now() - start 
});

// ✅ DO - Error logging with stack
logger.error('Create failed', { 
  entity: 'account', 
  error: err.message,
  stack: err.stack 
});

// ❌ DON'T - Unstructured logging
console.log('Created record: ' + id);

// ❌ DON'T - Sensitive data in logs
logger.info('User data', { password: user.password });
```

### Environment Detection

```typescript
const isDevelopment = (): boolean => {
  try {
    return window.location.hostname === 'localhost' ||
           window.location.hostname.includes('127.0.0.1') ||
           window.location.search.includes('debug=true');
  } catch {
    return false;
  }
};
```

---

## 6. Folder & Naming Conventions

### Project Structure

```
src/
├── lib/
│   └── dataverse/
│       └── pcf/
│           ├── types.ts              # Shared type definitions
│           ├── Logger.ts             # Logging utility
│           ├── ErrorHandler.ts       # Error normalization
│           ├── BaseDataverseService.ts   # Core service base
│           ├── CrudService.ts        # Generic CRUD operations
│           ├── QueryService.ts       # Query & FetchXML
│           └── index.ts              # Public exports
│
├── services/                         # Entity-specific services
│   ├── AccountService.ts
│   ├── ContactService.ts
│   └── index.ts
│
└── controls/                         # PCF control implementations
    └── MyControl/
        ├── index.ts                  # Control entry point
        └── MyControl.tsx             # React component
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | PascalCase | `CrudService.ts` |
| Interfaces | PascalCase, prefix `I` optional | `DataverseResult` |
| Types | PascalCase | `EntityReference` |
| Classes | PascalCase | `QueryService` |
| Functions | camelCase | `retrieveRecord` |
| Constants | UPPER_SNAKE | `MAX_PAGE_SIZE` |
| Entity names | lowercase | `'account'`, `'contact'` |
| Private members | underscore prefix | `_webApi` |

---

## 7. Do's and Don'ts Summary

### ✅ DO's

1. **Use `context.webAPI` exclusively** for all Dataverse operations
2. **Wrap all calls in try/catch** with proper error handling
3. **Return `Result<T>` objects** instead of throwing exceptions
4. **Use async/await** for all asynchronous operations
5. **Implement request timeouts** for long-running queries
6. **Cache metadata** to reduce redundant API calls
7. **Use generic services** (`CrudService<T>`) for type safety
8. **Log with context** (entity, operation, duration)
9. **Handle paging** for large datasets (>5000 records)
10. **Validate inputs** before making API calls
11. **Use OData `$select`** to limit returned columns
12. **Batch related operations** when possible

### ❌ DON'TS

1. **Never use `Xrm.*`** - not available in all contexts
2. **Never access `parent` frame** - security violation
3. **Never use `fetch()` for Dataverse** - auth issues
4. **Never hardcode entity/column names** in components
5. **Never ignore errors** - always handle or propagate
6. **Never log sensitive data** (passwords, tokens, PII)
7. **Never use synchronous operations** - blocks UI
8. **Never store secrets in code** - use environment variables
9. **Never assume record exists** - always handle NOT_FOUND
10. **Never skip paging** for `retrieveMultiple` results
11. **Never put business logic in UI components**
12. **Never use `any` type** - maintain type safety

---

## 8. Code Review Checklist

- [ ] All Dataverse calls use `context.webAPI`
- [ ] All async operations use `await` with try/catch
- [ ] Errors return `Result<T>` objects, not thrown
- [ ] No hardcoded entity names in UI components
- [ ] Logging includes entity, operation, and context
- [ ] Large queries handle paging correctly
- [ ] No `Xrm`, `formContext`, or browser globals
- [ ] Types are explicit (no `any`)
- [ ] Private members prefixed with underscore
- [ ] Service layer has no React/UI dependencies
