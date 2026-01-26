/**
 * Dataverse Operations Playground Page
 * 
 * Unified page combining step-by-step documentation with interactive
 * Dataverse wrapper operations. Works in real-time when deployed to Dataverse.
 */

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { 
  makeStyles, 
  tokens, 
  Title1,
  Title2,
  Title3,
  Body1,
  Text,
  Button,
  Card,
  CardHeader,
  Badge,
  Divider,
  TabList,
  Tab,
  shorthands,
} from "@fluentui/react-components";
import { useNavigation } from "../lib/navigation";
import { 
  ArrowLeft24Regular,
  Database24Regular,
  Code24Regular,
  Play24Regular,
  DocumentText24Regular,
  Lightbulb24Regular,
  Rocket24Regular,
  Shield24Regular,
  ArrowRight16Regular,
  Checkmark16Regular,
  DocumentBriefcase24Regular,
} from "@fluentui/react-icons";
import { DataverseOperationsPlayground } from "../components/dataverse";
import { QuestionnaireWrapperPlayground } from "../components/questionnaire/QuestionnaireWrapperPlayground";
import { CodeBlock } from "../features/pcf-docs";

const useStyles = makeStyles({
  page: {
    minHeight: "100vh",
    backgroundColor: tokens.colorNeutralBackground2,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap(tokens.spacingVerticalM),
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalXXL),
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke1),
  },
  headerTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap(tokens.spacingVerticalXS),
  },
  headerBadges: {
    display: "flex",
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  tabContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  playgroundWrapper: {
    flex: 1,
    ...shorthands.padding(tokens.spacingHorizontalL),
    display: "flex",
    flexDirection: "column",
    minHeight: "600px",
  },
  docsWrapper: {
    flex: 1,
    ...shorthands.padding(tokens.spacingHorizontalXXL),
    overflowY: "auto",
    maxWidth: "1200px",
    marginInline: "auto",
    width: "100%",
  },
  section: {
    marginBottom: tokens.spacingVerticalXXL,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap(tokens.spacingHorizontalM),
    marginBottom: tokens.spacingVerticalM,
  },
  stepCard: {
    marginBottom: tokens.spacingVerticalL,
    ...shorthands.padding(tokens.spacingVerticalL),
    backgroundColor: tokens.colorNeutralBackground1,
  },
  stepNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    ...shorthands.borderRadius("50%"),
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: tokens.fontWeightBold,
    flexShrink: 0,
  },
  stepContent: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap(tokens.spacingVerticalM),
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    ...shorthands.gap(tokens.spacingHorizontalL),
    marginTop: tokens.spacingVerticalL,
  },
  featureCard: {
    ...shorthands.padding(tokens.spacingVerticalL),
  },
  codeSection: {
    marginTop: tokens.spacingVerticalM,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    overflow: "hidden",
  },
  tipBox: {
    display: "flex",
    alignItems: "flex-start",
    ...shorthands.gap(tokens.spacingHorizontalM),
    ...shorthands.padding(tokens.spacingVerticalM),
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    marginTop: tokens.spacingVerticalM,
  },
  navTabs: {
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalL),
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke1),
  },
});

// ============================================================================
// Step-by-Step Code Examples
// ============================================================================

const CODE_STEP1_SERVICE = `// ═══════════════════════════════════════════════════════════════════════════
// STEP 1: Import the PCF Wrapper Services
// ═══════════════════════════════════════════════════════════════════════════

import { 
  createCrudService,
  createQueryService,
  BaseDataverseService,
  type IPCFContext,
  type DataverseResult,
} from '../lib/dataverse/pcf';

// The 'context' parameter is provided by Dynamics 365 at runtime
// context.webAPI is connected to YOUR CRM environment
`;

const CODE_STEP2_CRUD = `// ═══════════════════════════════════════════════════════════════════════════
// STEP 2: Perform CRUD Operations
// ═══════════════════════════════════════════════════════════════════════════

// Initialize the CRUD service with your PCF context
const crudService = createCrudService(context, {
  entityLogicalName: 'account'
});

// CREATE - Add a new record
const createResult = await crudService.create({
  name: 'Contoso Ltd',
  telephone1: '+1-555-0100',
  websiteurl: 'https://contoso.com'
});

if (createResult.success) {
  console.log('Created account:', createResult.data.id);
}

// RETRIEVE - Get a single record by ID
const retrieveResult = await crudService.retrieve(accountId, {
  select: ['name', 'telephone1', 'createdon']
});

// UPDATE - Modify an existing record
const updateResult = await crudService.update(accountId, {
  telephone1: '+1-555-0200',
  description: 'Updated description'
});

// DELETE - Remove a record
const deleteResult = await crudService.delete(accountId);
`;

const CODE_STEP3_QUERY = `// ═══════════════════════════════════════════════════════════════════════════
// STEP 3: Query Multiple Records
// ═══════════════════════════════════════════════════════════════════════════

const queryService = createQueryService(context);

// OData Query - with type-safe options
const odataResult = await queryService.retrieveMultiple<Account>('account', {
  select: ['name', 'telephone1', 'primarycontactid'],
  filter: "statecode eq 0 and contains(name, 'Contoso')",
  orderBy: 'createdon desc',
  top: 50
});

if (odataResult.success) {
  console.log(\`Found \${odataResult.data.entities.length} accounts\`);
  for (const account of odataResult.data.entities) {
    console.log(account.name);
  }
}

// FetchXML Query - for complex scenarios
const fetchResult = await queryService.executeFetchXml<Account>('account', {
  fetchXml: \`
    <fetch top="50">
      <entity name="account">
        <attribute name="name" />
        <attribute name="accountid" />
        <filter>
          <condition attribute="statecode" operator="eq" value="0" />
        </filter>
        <order attribute="name" />
      </entity>
    </fetch>
  \`
});
`;

const CODE_STEP4_ERROR = `// ═══════════════════════════════════════════════════════════════════════════
// STEP 4: Handle Errors with ErrorHandler Wrapper Class
// ═══════════════════════════════════════════════════════════════════════════

import { 
  createCrudService,
  errorHandler,           // Singleton instance
  withRetry,              // Auto-retry wrapper
  withSafeExecution,      // Result pattern wrapper
  withSafeRetry,          // Combined retry + safe execution
  handleError,            // Declarative error handlers
} from '../lib/dataverse/pcf';

const crudService = createCrudService(context, { entityLogicalName: 'account' });

// ─────────────────────────────────────────────────────────────────────────────
// PATTERN 1: Basic Error Handling with errorHandler
// ─────────────────────────────────────────────────────────────────────────────

const result = await crudService.retrieve(accountId);

if (result.success) {
  console.log('Account name:', result.data.name);
} else {
  // Use errorHandler for consistent, typed error handling
  const code = errorHandler.getErrorCode(result.error);
  const userMessage = errorHandler.getUserMessage(result.error);
  
  // Check specific error types
  if (errorHandler.isNotFound(result.error)) {
    showToast('Account not found or deleted', 'warning');
    navigate('/accounts');
  } else if (errorHandler.isAccessDenied(result.error)) {
    showToast('You do not have permission', 'error');
  } else if (errorHandler.isRetryable(result.error)) {
    showToast('Temporary error. Please retry.', 'info');
  } else {
    showToast(userMessage, 'error');
  }
  
  // Get full normalized error for logging
  const normalized = errorHandler.normalize(result.error, 'retrieve', 'account');
  console.log(normalized.code);        // 'NOT_FOUND', 'ACCESS_DENIED', etc.
  console.log(normalized.userMessage); // User-friendly message
  console.log(normalized.isRetryable); // boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// PATTERN 2: Auto-Retry with Exponential Backoff
// ─────────────────────────────────────────────────────────────────────────────

const data = await withRetry(
  () => crudService.retrieve(accountId),
  {
    maxRetries: 3,           // Retry up to 3 times
    baseDelayMs: 1000,       // Start with 1 second delay
    backoffMultiplier: 2,    // Double delay each retry: 1s → 2s → 4s
    onRetry: (attempt, error, delay) => {
      console.log(\`Retry \${attempt} in \${delay}ms...\`);
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// PATTERN 3: Safe Execution (Never Throws)
// ─────────────────────────────────────────────────────────────────────────────

const safeResult = await withSafeExecution(
  () => crudService.retrieve(accountId),
  { operation: 'retrieve', entityType: 'account' }
);

if (safeResult.success) {
  console.log('Data:', safeResult.data);
} else {
  console.log('Error:', safeResult.error.userMessage);
}

// ─────────────────────────────────────────────────────────────────────────────
// PATTERN 4: Combined Safe + Retry
// ─────────────────────────────────────────────────────────────────────────────

const robustResult = await withSafeRetry(
  () => riskyOperation(),
  { maxRetries: 3, operation: 'create', entityType: 'account' }
);

// ─────────────────────────────────────────────────────────────────────────────
// PATTERN 5: Declarative Error Handlers
// ─────────────────────────────────────────────────────────────────────────────

const deleteResult = await crudService.delete(accountId);

if (!deleteResult.success) {
  handleError(deleteResult.error, {
    onNotFound: () => showToast('Already deleted', 'info'),
    onAccessDenied: () => showToast('Cannot delete', 'error'),
    onConcurrency: () => { refreshData(); showToast('Refresh and retry', 'warning'); },
    onNetwork: () => showToast('Check connection', 'warning'),
    onUnknown: (err) => showToast(err.userMessage, 'error'),
  }, undefined);
}
`;

const CODE_STEP5_METADATA = `// ═══════════════════════════════════════════════════════════════════════════
// STEP 5: Dynamic Entity Discovery
// ═══════════════════════════════════════════════════════════════════════════

// Get list of available entities in YOUR Dataverse
const entitiesResult = await context.webAPI.retrieveMultipleRecords(
  'EntityDefinition',
  '?$select=LogicalName,DisplayName&$filter=IsCustomizable/Value eq true'
);

// Get metadata for any entity - discover fields dynamically
class EntityDiscoveryService extends BaseDataverseService {
  async getEntityFields(entityName: string) {
    const result = await this.getEntityMetadata(entityName);
    if (!result.success) return result;
    return { success: true, data: result.data.Attributes };
  }
  
  async getPrimaryKeyField(entityName: string) {
    const result = await this.getEntityMetadata(entityName);
    if (!result.success) return result;
    return { success: true, data: result.data.PrimaryIdAttribute };
  }
}

// Usage: Build dropdown configs from metadata - no hardcoding!
const discoveryService = new EntityDiscoveryService(context);
const fieldsResult = await discoveryService.getEntityFields('account');
`;

const CODE_STEP6_PCF = `// ═══════════════════════════════════════════════════════════════════════════
// STEP 6: Use in Your PCF Control
// ═══════════════════════════════════════════════════════════════════════════

import type { IInputs, IOutputs } from './generated/ManifestTypes';
import { createCrudService, createQueryService } from '../lib/dataverse/pcf';

export class MyPCFControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private crudService!: ReturnType<typeof createCrudService>;
  private queryService!: ReturnType<typeof createQueryService>;
  
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    // ═══════════════════════════════════════════════════════════════════════
    // THE MAGIC: context.webAPI is connected to YOUR CRM environment
    // ═══════════════════════════════════════════════════════════════════════
    
    this.crudService = createCrudService(context, { 
      entityLogicalName: 'account' 
    });
    this.queryService = createQueryService(context);
    
    // Now you can use all Dataverse operations with type safety!
    this.loadData();
  }
  
  private async loadData() {
    const result = await this.queryService.retrieveMultiple('account', {
      filter: 'statecode eq 0',
      top: 100
    });
    
    if (result.success) {
      this.renderAccounts(result.data.entities);
    }
  }
  
  public updateView(context: ComponentFramework.Context<IInputs>): void {
    // Update services when context changes
    this.crudService.updateContext(context);
    this.queryService.updateContext(context);
  }
}
`;

export default function DataversePlaygroundPage() {
  const styles = useStyles();
  const { navigate } = useNavigation();
  const [activeTab, setActiveTab] = useState<string>("playground");

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerTitle}>
            <Title1>PCF Dataverse Wrapper Playground</Title1>
            <Body1>
              Interactive testing environment with step-by-step guides. 
              Works in real-time when deployed to Dynamics 365.
            </Body1>
          </div>
          <Button
            appearance="subtle"
            icon={<ArrowLeft24Regular />}
            onClick={() => navigate('docs-pcf')}
          >
            Back to Full Docs
          </Button>
        </div>
        <div className={styles.headerBadges}>
          <Badge appearance="filled" color="success">TypeScript</Badge>
          <Badge appearance="filled" color="brand">PCF Safe</Badge>
          <Badge appearance="filled" color="informative">Result Pattern</Badge>
          <Badge appearance="filled" color="warning">Real-time Ready</Badge>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.navTabs}>
        <TabList 
          selectedValue={activeTab}
          onTabSelect={(_, data) => setActiveTab(data.value as string)}
        >
          <Tab value="playground" icon={<Play24Regular />}>
            Dataverse Playground
          </Tab>
          <Tab value="wrapper" icon={<DocumentBriefcase24Regular />}>
            Questionnaire Wrapper
          </Tab>
          <Tab value="guide" icon={<DocumentText24Regular />}>
            Step-by-Step Guide
          </Tab>
        </TabList>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === "playground" ? (
          <div className={styles.playgroundWrapper}>
            <DataverseOperationsPlayground />
          </div>
        ) : activeTab === "wrapper" ? (
          <div className={styles.playgroundWrapper}>
            <QuestionnaireWrapperPlayground />
          </div>
        ) : (
          <div className={styles.docsWrapper}>
            {/* Overview */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <Database24Regular />
                <Title2>Quick Start Guide</Title2>
              </div>
              <Body1>
                This guide walks you through using the PCF Dataverse Wrapper to 
                perform real-time operations against Microsoft Dataverse from your 
                Power Apps Component Framework controls.
              </Body1>

              <div className={styles.featureGrid}>
                <Card className={styles.featureCard}>
                  <CardHeader
                    image={<Checkmark16Regular />}
                    header={<b>Type-Safe CRUD</b>}
                    description="Strongly-typed create, read, update, delete"
                  />
                </Card>
                <Card className={styles.featureCard}>
                  <CardHeader
                    image={<Shield24Regular />}
                    header={<b>Error Handling</b>}
                    description="Result pattern - never throws exceptions"
                  />
                </Card>
                <Card className={styles.featureCard}>
                  <CardHeader
                    image={<Rocket24Regular />}
                    header={<b>PCF Compliant</b>}
                    description="Uses only context.webAPI - no forbidden APIs"
                  />
                </Card>
              </div>
            </section>

            <Divider />

            {/* Step 1 */}
            <section className={styles.section}>
              <Card className={styles.stepCard}>
                <div style={{ display: 'flex', gap: tokens.spacingHorizontalL }}>
                  <div className={styles.stepNumber}>1</div>
                  <div className={styles.stepContent}>
                    <Title3>Import the Services</Title3>
                    <Body1>
                      Start by importing the wrapper services. The <code>context</code> parameter 
                      is provided by Dynamics 365 at runtime - you don't create it yourself.
                    </Body1>
                    <div className={styles.codeSection}>
                      <CodeBlock code={CODE_STEP1_SERVICE} language="typescript" />
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Step 2 */}
            <section className={styles.section}>
              <Card className={styles.stepCard}>
                <div style={{ display: 'flex', gap: tokens.spacingHorizontalL }}>
                  <div className={styles.stepNumber}>2</div>
                  <div className={styles.stepContent}>
                    <Title3>Perform CRUD Operations</Title3>
                    <Body1>
                      Use the CRUD service for create, retrieve, update, and delete operations. 
                      All operations return a <code>DataverseResult</code> that's either success or failure.
                    </Body1>
                    <div className={styles.codeSection}>
                      <CodeBlock code={CODE_STEP2_CRUD} language="typescript" />
                    </div>
                    <div className={styles.tipBox}>
                      <Lightbulb24Regular />
                      <Text>
                        <strong>Try it!</strong> Switch to the <strong>Interactive Playground</strong> tab 
                        and test Create, Retrieve, Update, Delete operations with your entity.
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Step 3 */}
            <section className={styles.section}>
              <Card className={styles.stepCard}>
                <div style={{ display: 'flex', gap: tokens.spacingHorizontalL }}>
                  <div className={styles.stepNumber}>3</div>
                  <div className={styles.stepContent}>
                    <Title3>Query Multiple Records</Title3>
                    <Body1>
                      Use the QueryService for retrieving multiple records with OData or FetchXML queries.
                    </Body1>
                    <div className={styles.codeSection}>
                      <CodeBlock code={CODE_STEP3_QUERY} language="typescript" />
                    </div>
                    <div className={styles.tipBox}>
                      <Lightbulb24Regular />
                      <Text>
                        <strong>Try it!</strong> In the Playground, select the <strong>Query</strong> operation 
                        and toggle between OData and FetchXML modes.
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Step 4 */}
            <section className={styles.section}>
              <Card className={styles.stepCard}>
                <div style={{ display: 'flex', gap: tokens.spacingHorizontalL }}>
                  <div className={styles.stepNumber}>4</div>
                  <div className={styles.stepContent}>
                    <Title3>Handle Errors with ErrorHandler Wrapper</Title3>
                    <Body1>
                      Use the <code>errorHandler</code> wrapper class for consistent, typed error handling. 
                      It provides utility methods like <code>isNotFound()</code>, <code>isRetryable()</code>, 
                      and wrappers like <code>withRetry()</code> and <code>withSafeExecution()</code>.
                    </Body1>
                    <div className={styles.codeSection}>
                      <CodeBlock code={CODE_STEP4_ERROR} language="typescript" />
                    </div>
                    <div className={styles.tipBox}>
                      <Lightbulb24Regular />
                      <Text>
                        <strong>Try it!</strong> In the Playground, select the <strong>Error Handling</strong> operation 
                        to simulate different error scenarios and see how to handle them.
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Step 5 */}
            <section className={styles.section}>
              <Card className={styles.stepCard}>
                <div style={{ display: 'flex', gap: tokens.spacingHorizontalL }}>
                  <div className={styles.stepNumber}>5</div>
                  <div className={styles.stepContent}>
                    <Title3>Dynamic Entity Discovery</Title3>
                    <Body1>
                      Discover entities and fields dynamically at runtime - no hardcoding required. 
                      The metadata comes directly from YOUR Dataverse environment.
                    </Body1>
                    <div className={styles.codeSection}>
                      <CodeBlock code={CODE_STEP5_METADATA} language="typescript" />
                    </div>
                    <div className={styles.tipBox}>
                      <Lightbulb24Regular />
                      <Text>
                        <strong>Note:</strong> In the Playground, entity and field dropdowns are populated 
                        dynamically. In dev mode you see sample data; when deployed, you see YOUR real entities.
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Step 6 */}
            <section className={styles.section}>
              <Card className={styles.stepCard}>
                <div style={{ display: 'flex', gap: tokens.spacingHorizontalL }}>
                  <div className={styles.stepNumber}>6</div>
                  <div className={styles.stepContent}>
                    <Title3>Use in Your PCF Control</Title3>
                    <Body1>
                      Here's a complete example of using the wrapper in a real PCF control. 
                      The <code>context</code> is provided by Dynamics 365 in the <code>init</code> method.
                    </Body1>
                    <div className={styles.codeSection}>
                      <CodeBlock code={CODE_STEP6_PCF} language="typescript" />
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Next Steps */}
            <section className={styles.section}>
              <Card className={styles.stepCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalL }}>
                  <Rocket24Regular style={{ fontSize: 32 }} />
                  <div>
                    <Title3>Ready to Build!</Title3>
                    <Body1>
                      Now you can use the Interactive Playground to test operations and copy the 
                      generated code snippets directly into your PCF control.
                    </Body1>
                    <Button 
                      appearance="primary" 
                      style={{ marginTop: tokens.spacingVerticalM }}
                      icon={<Play24Regular />}
                      onClick={() => setActiveTab("playground")}
                    >
                      Open Interactive Playground
                    </Button>
                  </div>
                </div>
              </Card>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
