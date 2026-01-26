# PCF Project Folder Structure

## Scalable Architecture for Large PCF Projects

This structure supports multiple controls, shared utilities, and clean separation of concerns.

---

## Folder Tree

```
pcf-project/
│
├── 📁 controls/                      # Individual PCF controls
│   │
│   ├── 📁 AccountQuickView/          # Control 1
│   │   ├── 📁 components/            # React components (UI only)
│   │   │   ├── AccountHeader.tsx
│   │   │   ├── ContactList.tsx
│   │   │   └── index.ts
│   │   ├── 📁 hooks/                 # Control-specific React hooks
│   │   │   ├── useAccountData.ts
│   │   │   └── index.ts
│   │   ├── 📁 styles/                # Control-specific styles
│   │   │   └── AccountQuickView.css
│   │   ├── AccountQuickView.tsx      # Main React component
│   │   ├── index.ts                  # PCF entry point (StandardControl)
│   │   └── ControlManifest.Input.xml # Control manifest
│   │
│   ├── 📁 ContactGrid/               # Control 2
│   │   ├── 📁 components/
│   │   ├── 📁 hooks/
│   │   ├── 📁 styles/
│   │   ├── ContactGrid.tsx
│   │   ├── index.ts
│   │   └── ControlManifest.Input.xml
│   │
│   └── 📁 CaseTimeline/              # Control 3
│       ├── 📁 components/
│       ├── 📁 hooks/
│       ├── 📁 styles/
│       ├── CaseTimeline.tsx
│       ├── index.ts
│       └── ControlManifest.Input.xml
│
├── 📁 shared/                        # Shared across all controls
│   │
│   ├── 📁 services/                  # Dataverse service layer
│   │   │
│   │   ├── 📁 core/                  # Core infrastructure
│   │   │   ├── types.ts              # Shared type definitions
│   │   │   ├── Logger.ts             # Logging utility
│   │   │   ├── ErrorHandler.ts       # Error normalization
│   │   │   ├── BaseDataverseService.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 crud/                  # CRUD operations
│   │   │   ├── CrudService.ts        # Generic CRUD service
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 query/                 # Query operations
│   │   │   ├── QueryService.ts       # OData & FetchXML
│   │   │   ├── FetchXmlBuilder.ts    # FetchXML construction
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 entities/              # Entity-specific services
│   │   │   ├── AccountService.ts
│   │   │   ├── ContactService.ts
│   │   │   ├── IncidentService.ts
│   │   │   ├── ActivityService.ts
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts                  # Public API exports
│   │
│   ├── 📁 types/                     # Shared TypeScript types
│   │   ├── entities/                 # Entity interfaces
│   │   │   ├── Account.ts
│   │   │   ├── Contact.ts
│   │   │   ├── Incident.ts
│   │   │   └── index.ts
│   │   ├── pcf.ts                    # PCF-specific types
│   │   ├── common.ts                 # Common utility types
│   │   └── index.ts
│   │
│   ├── 📁 hooks/                     # Shared React hooks
│   │   ├── useDataverseQuery.ts      # Generic query hook
│   │   ├── useDataverseMutation.ts   # Generic mutation hook
│   │   ├── usePCFContext.ts          # Context management
│   │   ├── useDebounce.ts
│   │   └── index.ts
│   │
│   ├── 📁 components/                # Shared UI components
│   │   ├── 📁 primitives/            # Base components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── index.ts
│   │   ├── 📁 dataverse/             # Dataverse-aware components
│   │   │   ├── LookupPicker.tsx
│   │   │   ├── OptionSetSelect.tsx
│   │   │   ├── EntityForm.tsx
│   │   │   └── index.ts
│   │   ├── 📁 layout/                # Layout components
│   │   │   ├── Card.tsx
│   │   │   ├── Grid.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── 📁 utils/                     # Utility functions
│   │   ├── formatting.ts             # Date, currency, number formatting
│   │   ├── validation.ts             # Input validation
│   │   ├── guards.ts                 # Type guards
│   │   ├── constants.ts              # Shared constants
│   │   └── index.ts
│   │
│   ├── 📁 queries/                   # Centralized FetchXML templates
│   │   ├── accountQueries.ts
│   │   ├── contactQueries.ts
│   │   ├── incidentQueries.ts
│   │   └── index.ts
│   │
│   └── 📁 styles/                    # Shared styles
│       ├── variables.css             # CSS custom properties
│       ├── reset.css                 # CSS reset
│       ├── utilities.css             # Utility classes
│       └── index.css                 # Main entry point
│
├── 📁 test/                          # Testing infrastructure
│   ├── 📁 mocks/                     # Mock implementations
│   │   ├── MockPCFContext.ts         # Mock PCF context
│   │   ├── MockWebApi.ts             # Mock WebApi
│   │   ├── mockData.ts               # Sample data
│   │   └── index.ts
│   ├── 📁 fixtures/                  # Test fixtures
│   │   ├── accounts.json
│   │   ├── contacts.json
│   │   └── incidents.json
│   ├── 📁 helpers/                   # Test utilities
│   │   ├── renderControl.tsx
│   │   ├── waitForData.ts
│   │   └── index.ts
│   └── setup.ts                      # Test setup
│
├── 📁 docs/                          # Documentation
│   ├── ARCHITECTURE.md               # Architecture overview
│   ├── CODING_STANDARDS.md           # Coding standards
│   ├── SERVICES.md                   # Service layer docs
│   ├── CONTRIBUTING.md               # Contribution guide
│   └── 📁 controls/                  # Per-control documentation
│       ├── AccountQuickView.md
│       ├── ContactGrid.md
│       └── CaseTimeline.md
│
├── 📁 scripts/                       # Build and deployment scripts
│   ├── build-all.ps1                 # Build all controls
│   ├── deploy.ps1                    # Deploy to environment
│   ├── generate-control.ps1          # Scaffold new control
│   └── lint-fix.ps1                  # Lint and fix
│
├── 📁 config/                        # Configuration files
│   ├── environments.json             # Environment URLs
│   ├── entities.json                 # Entity metadata cache
│   └── feature-flags.json            # Feature toggles
│
├── .eslintrc.js                      # ESLint configuration
├── .prettierrc                       # Prettier configuration
├── tsconfig.json                     # TypeScript configuration
├── tsconfig.base.json                # Shared TS config
├── package.json                      # Dependencies
├── pcfconfig.json                    # PCF CLI configuration
└── README.md                         # Project overview
```

---

## Folder Explanations

### 📁 `controls/`

**Purpose**: Contains individual PCF controls, each deployable independently.

| Subfolder | Description |
|-----------|-------------|
| `components/` | React components specific to this control. Pure UI, no business logic. |
| `hooks/` | Control-specific React hooks for state and data management. |
| `styles/` | CSS files scoped to this control. |
| `index.ts` | PCF entry point implementing `StandardControl` interface. |
| `[ControlName].tsx` | Main React component rendered by the control. |
| `ControlManifest.Input.xml` | PCF manifest defining properties, resources. |

**Example Control Structure:**
```
AccountQuickView/
├── components/
│   ├── AccountHeader.tsx      # Displays account name, number
│   ├── AccountDetails.tsx     # Shows address, phone, etc.
│   ├── ContactList.tsx        # Lists related contacts
│   └── index.ts               # Barrel export
├── hooks/
│   ├── useAccountData.ts      # Fetches account + contacts
│   └── useContactActions.ts   # Create/update/delete contacts
├── styles/
│   └── AccountQuickView.css
├── AccountQuickView.tsx       # Main component composition
├── index.ts                   # PCF StandardControl wrapper
└── ControlManifest.Input.xml
```

---

### 📁 `shared/services/`

**Purpose**: Dataverse service layer shared across all controls.

| Subfolder | Description |
|-----------|-------------|
| `core/` | Infrastructure: Logger, ErrorHandler, BaseDataverseService, types. |
| `crud/` | Generic `CrudService<T>` for entity-agnostic CRUD operations. |
| `query/` | `QueryService` for OData and FetchXML queries. |
| `entities/` | Entity-specific services extending `CrudService` with typed interfaces. |

**Design Principles:**
- No UI logic in services
- All Dataverse calls go through `BaseDataverseService`
- Entity services provide typed, domain-specific methods
- Consistent `DataverseResult<T>` return type

---

### 📁 `shared/types/`

**Purpose**: Centralized TypeScript type definitions.

| File/Folder | Description |
|-------------|-------------|
| `entities/` | Interfaces for Dataverse entities (Account, Contact, etc.). |
| `pcf.ts` | PCF-specific types (IInputs, IOutputs, context types). |
| `common.ts` | Utility types (Result, Maybe, etc.). |

**Entity Interface Pattern:**
```typescript
// shared/types/entities/Account.ts
export interface Account {
  [key: string]: unknown;
  accountid?: string;
  name: string;
  telephone1?: string;
  // ... other fields
}
```

---

### 📁 `shared/hooks/`

**Purpose**: Shared React hooks for data fetching and state management.

| Hook | Description |
|------|-------------|
| `useDataverseQuery` | Generic hook for queries with loading/error states. |
| `useDataverseMutation` | Generic hook for create/update/delete with optimistic updates. |
| `usePCFContext` | Provides access to PCF context throughout component tree. |
| `useDebounce` | Debounces rapidly changing values (search input). |

**Usage Example:**
```typescript
// In a control component
const { data, isLoading, error, refetch } = useDataverseQuery(
  'accounts',
  () => accountService.retrieve(accountId)
);
```

---

### 📁 `shared/components/`

**Purpose**: Reusable UI components shared across controls.

| Subfolder | Description |
|-----------|-------------|
| `primitives/` | Base components: Button, Input, Spinner, etc. |
| `dataverse/` | Dataverse-aware: LookupPicker, OptionSetSelect. |
| `layout/` | Layout: Card, Grid, ErrorBoundary. |

**Key Components:**
- `LookupPicker`: Renders lookup field with search
- `OptionSetSelect`: Renders choice/optionset dropdown
- `ErrorBoundary`: Catches React errors gracefully

---

### 📁 `shared/queries/`

**Purpose**: Centralized FetchXML templates. **Never embed FetchXML in UI components.**

| File | Description |
|------|-------------|
| `accountQueries.ts` | Account-related FetchXML templates. |
| `contactQueries.ts` | Contact-related FetchXML templates. |
| `incidentQueries.ts` | Case/Incident FetchXML templates. |

**Pattern:**
```typescript
// shared/queries/accountQueries.ts
export const AccountQueries = {
  activeAccounts: (nameFilter?: string) => `
    <fetch top="100">
      <entity name="account">
        <attribute name="name" />
        <filter>
          <condition attribute="statecode" operator="eq" value="0" />
        </filter>
      </entity>
    </fetch>
  `,
  
  accountWithContacts: (accountId: string) => `...`,
};
```

---

### 📁 `shared/utils/`

**Purpose**: Pure utility functions with no Dataverse or UI dependencies.

| File | Description |
|------|-------------|
| `formatting.ts` | Date, currency, number formatters. |
| `validation.ts` | Input validation helpers. |
| `guards.ts` | TypeScript type guards. |
| `constants.ts` | Shared constants (status codes, etc.). |

---

### 📁 `shared/styles/`

**Purpose**: Shared CSS files for consistent styling.

| File | Description |
|------|-------------|
| `variables.css` | CSS custom properties (colors, spacing, fonts). |
| `reset.css` | Browser CSS reset. |
| `utilities.css` | Utility classes (.flex, .gap-4, etc.). |

---

### 📁 `test/`

**Purpose**: Testing infrastructure.

| Subfolder | Description |
|-----------|-------------|
| `mocks/` | Mock implementations of PCF context, WebApi. |
| `fixtures/` | Sample data for tests (JSON files). |
| `helpers/` | Test utility functions. |

**MockPCFContext Example:**
```typescript
// test/mocks/MockPCFContext.ts
export function createMockContext(overrides?: Partial<IPCFContext>): IPCFContext {
  return {
    webAPI: createMockWebApi(),
    utils: createMockUtility(),
    ...overrides,
  };
}
```

---

### 📁 `docs/`

**Purpose**: Project documentation.

| File | Description |
|------|-------------|
| `ARCHITECTURE.md` | High-level architecture overview. |
| `CODING_STANDARDS.md` | Coding conventions and rules. |
| `SERVICES.md` | Service layer documentation. |
| `controls/` | Per-control documentation. |

---

### 📁 `scripts/`

**Purpose**: Automation scripts for build, deploy, scaffolding.

| Script | Description |
|--------|-------------|
| `build-all.ps1` | Builds all controls for deployment. |
| `deploy.ps1` | Deploys to Dataverse environment. |
| `generate-control.ps1` | Scaffolds new control from template. |

---

### 📁 `config/`

**Purpose**: Configuration files for different environments.

| File | Description |
|------|-------------|
| `environments.json` | Dev, test, prod environment URLs. |
| `entities.json` | Cached entity metadata. |
| `feature-flags.json` | Feature toggles. |

---

## Import Patterns

### From Controls to Shared

```typescript
// controls/AccountQuickView/hooks/useAccountData.ts
import { AccountService } from '@shared/services/entities';
import { useDataverseQuery } from '@shared/hooks';
import type { Account } from '@shared/types/entities';
```

### Path Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["shared/*"],
      "@controls/*": ["controls/*"],
      "@test/*": ["test/*"]
    }
  }
}
```

---

## Scaling Guidelines

| Scenario | Recommendation |
|----------|----------------|
| Adding new control | Use `generate-control.ps1` script for consistent structure. |
| Adding new entity | Create interface in `types/entities/`, service in `services/entities/`. |
| Adding shared component | Place in appropriate `shared/components/` subfolder. |
| Adding FetchXML query | Add to relevant file in `shared/queries/`. |
| Cross-control code | If used by 2+ controls, move to `shared/`. |

---

## Key Principles

1. **No Business Logic in UI**: Components render, hooks manage state, services handle data.
2. **No Direct WebApi Calls**: All Dataverse access through service layer.
3. **Centralized FetchXML**: Never embed queries in components.
4. **Typed Everything**: Use TypeScript interfaces for all entities.
5. **Testable by Design**: Mock-friendly services, pure utility functions.
6. **Single Responsibility**: Each folder has one clear purpose.
