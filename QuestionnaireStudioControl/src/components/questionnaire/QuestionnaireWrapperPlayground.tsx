/**
 * QuestionnaireWrapper Playground Component
 * 
 * Interactive demo for testing the QuestionnaireWrapper class methods.
 */

import * as React from 'react';
import { useState, useMemo } from 'react';
import {
  makeStyles,
  tokens,
  shorthands,
  Card,
  CardHeader,
  Button,
  Badge,
  Text,
  Title3,
  Body1,
  Dropdown,
  Option,
  Textarea,
} from '@fluentui/react-components';
import {
  Play24Regular,
  Copy24Regular,
  Checkmark24Regular,
  DocumentText24Regular,
  ArrowDownload24Regular,
  Info24Regular,
} from '@fluentui/react-icons';
import { QuestionnaireWrapper } from '../../lib/QuestionnaireWrapper';
import { QuestionnaireFactory } from '../../lib/questionnaire';
import { CodeBlock } from '../../features/pcf-docs';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    ...shorthands.gap(tokens.spacingVerticalL),
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    ...shorthands.gap(tokens.spacingHorizontalL),
    flex: 1,
    minHeight: 0,
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalM),
    height: '100%',
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    overflow: 'auto',
    ...shorthands.padding(tokens.spacingVerticalM),
  },
  methodGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    ...shorthands.gap(tokens.spacingHorizontalS),
    marginBottom: tokens.spacingVerticalM,
  },
  methodButton: {
    justifyContent: 'flex-start',
    textAlign: 'left',
  },
  output: {
    fontFamily: 'monospace',
    fontSize: tokens.fontSizeBase200,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.padding(tokens.spacingVerticalM),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    overflow: 'auto',
    flex: 1,
    minHeight: '200px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.gap(tokens.spacingHorizontalM),
  },
  badges: {
    display: 'flex',
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
  inputSection: {
    marginBottom: tokens.spacingVerticalM,
  },
  codePreview: {
    marginTop: tokens.spacingVerticalM,
  },
  infoBox: {
    display: 'flex',
    alignItems: 'flex-start',
    ...shorthands.gap(tokens.spacingHorizontalS),
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    marginBottom: tokens.spacingVerticalM,
  },
});

type WrapperMethod = 
  | 'toJSON'
  | 'toJSONString'
  | 'getRawQuestionnaire'
  | 'getMetadata'
  | 'toBlob'
  | 'toDataverseRecord'
  | 'fromId'
  | 'fromName'
  | 'listAll';

const METHODS: { id: WrapperMethod; label: string; description: string }[] = [
  { id: 'fromId', label: 'fromId()', description: 'Load questionnaire by ID from localStorage' },
  { id: 'fromName', label: 'fromName()', description: 'Load questionnaire by name from localStorage' },
  { id: 'listAll', label: 'listAll()', description: 'List all available questionnaires' },
  { id: 'toDataverseRecord', label: 'toDataverseRecord()', description: 'Generate Dataverse ctna_questionnaire record' },
  { id: 'toJSON', label: 'toJSON()', description: 'Returns full export format' },
  { id: 'toJSONString', label: 'toJSONString()', description: 'Returns formatted JSON string' },
  { id: 'getRawQuestionnaire', label: 'getRawQuestionnaire()', description: 'Returns raw questionnaire object' },
  { id: 'getMetadata', label: 'getMetadata()', description: 'Returns questionnaire metadata' },
  { id: 'toBlob', label: 'toBlob()', description: 'Creates a Blob for download' },
];

const SAMPLE_QUESTIONNAIRES = [
  { 
    id: 'default', 
    name: 'Default (Empty)',
    factory: () => QuestionnaireFactory.questionnaire({
      name: 'Default Questionnaire',
      description: 'A default empty questionnaire',
    }),
  },
  { 
    id: 'simple', 
    name: 'Simple Form',
    factory: () => QuestionnaireFactory.questionnaire({
      name: 'Customer Feedback Form',
      description: 'A simple customer feedback questionnaire',
      status: 'Draft',
      version: '1.0.0',
      serviceCatalog: 'Customer Service',
      pages: [
        QuestionnaireFactory.page({
          name: 'Basic Information',
          description: 'Collect basic customer details',
          sections: [
            QuestionnaireFactory.section({
              name: 'Contact Details',
              questions: [
                QuestionnaireFactory.question({
                  text: 'What is your name?',
                  type: 'Text',
                  required: true,
                }),
                QuestionnaireFactory.question({
                  text: 'What is your email?',
                  type: 'Text',
                  required: true,
                }),
              ],
            }),
          ],
        }),
        QuestionnaireFactory.page({
          name: 'Feedback',
          description: 'Your feedback matters',
          sections: [
            QuestionnaireFactory.section({
              name: 'Rating',
              questions: [
                QuestionnaireFactory.question({
                  text: 'How would you rate our service?',
                  type: 'Rating',
                }),
                QuestionnaireFactory.question({
                  text: 'Would you recommend us?',
                  type: 'Boolean',
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  },
  { 
    id: 'complex', 
    name: 'IT Support Request',
    factory: () => QuestionnaireFactory.questionnaire({
      name: 'IT Support Request',
      description: 'IT incident and request logging form',
      status: 'Published',
      version: '2.1.0',
      serviceCatalog: 'IT Services',
      pages: [
        QuestionnaireFactory.page({
          name: 'Issue Details',
          sections: [
            QuestionnaireFactory.section({
              name: 'Problem Description',
              questions: [
                QuestionnaireFactory.question({
                  text: 'Describe your issue',
                  type: 'TextArea',
                  required: true,
                }),
                QuestionnaireFactory.question({
                  text: 'Select the category',
                  type: 'Choice',
                  answerSets: [
                    QuestionnaireFactory.answerSet({
                      name: 'Categories',
                      isDefault: true,
                      answers: [
                        QuestionnaireFactory.answer({ label: 'Hardware', value: 'hardware' }),
                        QuestionnaireFactory.answer({ label: 'Software', value: 'software' }),
                        QuestionnaireFactory.answer({ label: 'Network', value: 'network' }),
                        QuestionnaireFactory.answer({ label: 'Access', value: 'access' }),
                      ],
                    }),
                  ],
                }),
                QuestionnaireFactory.question({
                  text: 'Priority',
                  type: 'Choice',
                  answerSets: [
                    QuestionnaireFactory.answerSet({
                      name: 'Priority Levels',
                      isDefault: true,
                      answers: [
                        QuestionnaireFactory.answer({ label: 'Low', value: '4' }),
                        QuestionnaireFactory.answer({ label: 'Medium', value: '3' }),
                        QuestionnaireFactory.answer({ label: 'High', value: '2' }),
                        QuestionnaireFactory.answer({ label: 'Critical', value: '1' }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  },
];

export function QuestionnaireWrapperPlayground() {
  const styles = useStyles();
  const [selectedMethod, setSelectedMethod] = useState<WrapperMethod>('toJSON');
  const [selectedSample, setSelectedSample] = useState('simple');
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const questionnaire = useMemo(() => {
    const sample = SAMPLE_QUESTIONNAIRES.find(s => s.id === selectedSample);
    return sample?.factory() ?? SAMPLE_QUESTIONNAIRES[0].factory();
  }, [selectedSample]);

  const wrapper = useMemo(() => {
    return new QuestionnaireWrapper(questionnaire);
  }, [questionnaire]);

  const executeMethod = () => {
    let result: unknown;
    
    switch (selectedMethod) {
      case 'fromId': {
        // Demo: Try to load from the first available saved questionnaire
        const allItems = QuestionnaireWrapper.listAll();
        if (allItems.length > 0) {
          const firstItem = allItems[0];
          const loadResult = QuestionnaireWrapper.fromId(firstItem.id);
          if (loadResult.success) {
            result = {
              success: true,
              source: loadResult.data.getSourceInfo(),
              metadata: loadResult.data.getMetadata(),
              message: `Loaded "${firstItem.name}" from ${firstItem.source}`,
            };
          } else {
            result = { success: false, error: loadResult.error.message };
          }
        } else {
          result = { 
            success: false, 
            error: 'No saved questionnaires found. Save a draft or publish a questionnaire first.',
            hint: 'Go to the Questionnaire Builder and save a draft to test this method.',
          };
        }
        break;
      }
      case 'fromName': {
        // Demo: Try to load using the sample questionnaire name
        const loadResult = QuestionnaireWrapper.fromName(questionnaire.name);
        if (loadResult.success) {
          result = {
            success: true,
            source: loadResult.data.getSourceInfo(),
            metadata: loadResult.data.getMetadata(),
            message: `Found "${questionnaire.name}" in localStorage`,
          };
        } else {
          result = { 
            success: false, 
            error: loadResult.error.message,
            hint: `Save a questionnaire named "${questionnaire.name}" to test this method.`,
          };
        }
        break;
      }
      case 'listAll': {
        const allItems = QuestionnaireWrapper.listAll();
        result = {
          totalCount: allItems.length,
          drafts: allItems.filter(i => i.source === 'draft').map(i => ({ id: i.id, name: i.name })),
          published: allItems.filter(i => i.source === 'published').map(i => ({ id: i.id, name: i.name })),
        };
        break;
      }
      case 'toDataverseRecord': {
        const record = wrapper.toDataverseRecord();
        result = {
          _entityName: 'ctna_questionnaire',
          _description: 'Ready to create in Dataverse via CrudService.create()',
          record,
        };
        break;
      }
      case 'toJSON':
        result = wrapper.toJSON();
        break;
      case 'toJSONString':
        result = wrapper.toJSONString();
        break;
      case 'getRawQuestionnaire':
        result = wrapper.getRawQuestionnaire();
        break;
      case 'getMetadata':
        result = wrapper.getMetadata();
        break;
      case 'toBlob': {
        const blob = wrapper.toBlob();
        result = {
          type: blob.type,
          size: `${blob.size} bytes`,
          preview: 'Blob created successfully! Click "Download Blob" to save.',
        };
        break;
      }
    }

    if (typeof result === 'string') {
      setOutput(result);
    } else {
      setOutput(JSON.stringify(result, null, 2));
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBlob = () => {
    const blob = wrapper.toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${questionnaire.name || 'questionnaire'}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const codePreview = useMemo(() => {
    switch (selectedMethod) {
      case 'fromId':
        return `import { QuestionnaireWrapper } from '../lib/QuestionnaireWrapper';

// Load questionnaire by ID from localStorage (drafts or published)
const result = QuestionnaireWrapper.fromId("draft-abc123");

if (result.success) {
  const wrapper = result.data;
  console.log(wrapper.getMetadata());    // { name, status, ... }
  console.log(wrapper.getSourceInfo());  // { source: 'draft', id: '...' }
  const json = wrapper.toJSON();         // Full export format
} else {
  console.error(result.error.message);   // "Questionnaire not found..."
}`;

      case 'fromName':
        return `import { QuestionnaireWrapper } from '../lib/QuestionnaireWrapper';

// Load questionnaire by name from localStorage
const result = QuestionnaireWrapper.fromName("IT Support Request");

if (result.success) {
  const wrapper = result.data;
  const exportJson = wrapper.toJSON();
  console.log(exportJson.questionnaire.name);  // "IT Support Request"
} else {
  console.error(result.error.message);
}`;

      case 'listAll':
        return `import { QuestionnaireWrapper } from '../lib/QuestionnaireWrapper';

// List all available questionnaires from localStorage
const allItems = QuestionnaireWrapper.listAll();

allItems.forEach(item => {
  console.log(item.name);    // Questionnaire name
  console.log(item.id);      // Unique ID
  console.log(item.source);  // 'draft' or 'published'
});

// Load a specific one
if (allItems.length > 0) {
  const result = QuestionnaireWrapper.fromId(allItems[0].id);
}`;

      case 'toDataverseRecord':
        return `import { QuestionnaireWrapper } from '../lib/QuestionnaireWrapper';
import { CrudService } from '../lib/dataverse/pcf/CrudService';

// Generate Dataverse record for ctna_questionnaire entity
const wrapper = new QuestionnaireWrapper(questionnaire);
const record = wrapper.toDataverseRecord();

/**
 * Record structure:
 * {
 *   ctna_name: string,           // Display name
 *   ctna_description: string,    // Designer notes (multiline)
 *   ctna_status: number,         // 100000000=Draft, 100000001=Published
 *   ctna_version: string,        // Semantic version e.g. "1.0.0"
 *   ctna_schemaversion: string,  // JSON schema version e.g. "1.0"
 *   ctna_definitionjson: string  // Full questionnaire JSON tree
 * }
 */

// Create record in Dataverse
const crudService = new CrudService(context.webAPI);
const result = await crudService.create("ctna_questionnaire", record);

if (result.success) {
  console.log("Created record:", result.data.id);
} else {
  console.error("Failed:", result.error);
}`;

      case 'toJSON':
        return `import { QuestionnaireWrapper } from '../lib/QuestionnaireWrapper';

// Get full export format (ExportedQuestionnaire)
const wrapper = new QuestionnaireWrapper(questionnaire);
const exportData = wrapper.toJSON();

console.log(exportData.version);       // "1.0"
console.log(exportData.exportedAt);    // ISO timestamp
console.log(exportData.questionnaire); // Full questionnaire`;

      case 'toJSONString':
        return `import { QuestionnaireWrapper } from '../lib/QuestionnaireWrapper';

const wrapper = new QuestionnaireWrapper(questionnaire);

// Get formatted JSON string
const jsonString = wrapper.toJSONString();
const compactJson = wrapper.toJSONString(0); // No indentation`;

      case 'getRawQuestionnaire':
        return `import { QuestionnaireWrapper } from '../lib/QuestionnaireWrapper';

const wrapper = new QuestionnaireWrapper(questionnaire);

// Get raw questionnaire object (without export metadata)
const raw = wrapper.getRawQuestionnaire();
console.log(raw.name);
console.log(raw.pages.length);`;

      case 'getMetadata':
        return `import { QuestionnaireWrapper } from '../lib/QuestionnaireWrapper';

const wrapper = new QuestionnaireWrapper(questionnaire);

// Get questionnaire metadata
const metadata = wrapper.getMetadata();
console.log(metadata.name);
console.log(metadata.version);
console.log(metadata.status);`;

      case 'toBlob':
        return `import { QuestionnaireWrapper } from '../lib/QuestionnaireWrapper';

const wrapper = new QuestionnaireWrapper(questionnaire);

// Create Blob for download or API transmission
const blob = wrapper.toBlob();

// Download as file
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'questionnaire.json';
link.click();`;

      default:
        return '';
    }
  }, [selectedMethod]);

  return (
    <div className={styles.container}>
      <div className={styles.infoBox}>
        <Info24Regular />
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM, flex: 1 }}>
          <Text>
            The <strong>QuestionnaireWrapper</strong> class provides programmatic access to questionnaire data 
            in the standard export format. Select a sample questionnaire and method to test.
          </Text>
          
          <div>
            <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalXS }}>
              Questionnaire Parameter Structure
            </Text>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
              The constructor accepts a <code>Questionnaire</code> object with the following hierarchy:
              <br />• <strong>Questionnaire</strong>: <code>name</code>, <code>description</code>, <code>status</code>, <code>version</code>, <code>serviceCatalog</code>, <code>pages[]</code>
              <br />• <strong>Page</strong>: <code>id</code>, <code>name</code>, <code>description</code>, <code>sections[]</code>
              <br />• <strong>Section</strong>: <code>id</code>, <code>name</code>, <code>questions[]</code>, <code>branches[]</code>
              <br />• <strong>Question</strong>: <code>id</code>, <code>text</code>, <code>type</code>, <code>required</code>, <code>answerSets[]</code>, <code>conditionGroup</code>, <code>actionRecord</code>
            </Text>
          </div>

          <div>
            <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalXS }}>
              Usage Examples
            </Text>
            <CodeBlock 
              language="typescript" 
              code={`import { QuestionnaireWrapper } from "../lib/QuestionnaireWrapper";

// Option 1: Load by ID from localStorage
const byIdResult = QuestionnaireWrapper.fromId("draft-abc123");
if (byIdResult.success) {
  const wrapper = byIdResult.data;
  const json = wrapper.toJSON();  // Full export format
}

// Option 2: Load by Name from localStorage
const byNameResult = QuestionnaireWrapper.fromName("IT Support Request");
if (byNameResult.success) {
  const metadata = byNameResult.data.getMetadata();
}

// Option 3: List all available questionnaires
const allItems = QuestionnaireWrapper.listAll();
// Returns: [{ id, name, source: 'draft'|'published', questionnaire }]

// Option 4: Create directly from Questionnaire object
const wrapper = new QuestionnaireWrapper(myQuestionnaire);
const exportJson = wrapper.toJSON();`} 
            />
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Left Panel - Configuration */}
        <div className={styles.panel}>
          <Card className={styles.card}>
            <CardHeader
              header={<Title3>Configuration</Title3>}
              description="Select a sample questionnaire and method to execute"
            />
            <div className={styles.cardContent}>
              <div className={styles.inputSection}>
                <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>
                  Sample Questionnaire
                </Text>
                <Dropdown
                  value={SAMPLE_QUESTIONNAIRES.find(s => s.id === selectedSample)?.name}
                  onOptionSelect={(_, data) => {
                    if (data.optionValue) {
                      setSelectedSample(data.optionValue);
                      setOutput('');
                    }
                  }}
                  style={{ width: '100%' }}
                >
                  {SAMPLE_QUESTIONNAIRES.map(sample => (
                    <Option key={sample.id} value={sample.id}>
                      {sample.name}
                    </Option>
                  ))}
                </Dropdown>
              </div>

              <div className={styles.inputSection}>
                <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>
                  Wrapper Methods
                </Text>
                <div className={styles.methodGrid}>
                  {METHODS.map(method => (
                    <Button
                      key={method.id}
                      appearance={selectedMethod === method.id ? 'primary' : 'secondary'}
                      className={styles.methodButton}
                      onClick={() => {
                        setSelectedMethod(method.id);
                        setOutput('');
                      }}
                      icon={<DocumentText24Regular />}
                    >
                      {method.label}
                    </Button>
                  ))}
                </div>
                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                  {METHODS.find(m => m.id === selectedMethod)?.description}
                </Text>
              </div>

              <div className={styles.codePreview}>
                <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>
                  Code Example
                </Text>
                <CodeBlock code={codePreview} language="typescript" />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel - Output */}
        <div className={styles.panel}>
          <Card className={styles.card}>
            <CardHeader
              header={
                <div className={styles.header}>
                  <Title3>Output</Title3>
                  <div className={styles.badges}>
                    <Badge appearance="outline" color="informative">
                      {selectedMethod}
                    </Badge>
                  </div>
                </div>
              }
              action={
                <div style={{ display: 'flex', gap: tokens.spacingHorizontalS }}>
                  <Button
                    appearance="primary"
                    icon={<Play24Regular />}
                    onClick={executeMethod}
                  >
                    Execute
                  </Button>
                  {selectedMethod === 'toBlob' && output && (
                    <Button
                      appearance="secondary"
                      icon={<ArrowDownload24Regular />}
                      onClick={handleDownloadBlob}
                    >
                      Download Blob
                    </Button>
                  )}
                  {output && (
                    <Button
                      appearance="subtle"
                      icon={copied ? <Checkmark24Regular /> : <Copy24Regular />}
                      onClick={handleCopy}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  )}
                </div>
              }
            />
            <div className={styles.cardContent}>
              {output ? (
                <pre className={styles.output}>{output}</pre>
              ) : (
                <div 
                  className={styles.output} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: tokens.colorNeutralForeground3,
                  }}
                >
                  Click "Execute" to see the output
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default QuestionnaireWrapperPlayground;
