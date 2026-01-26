/**
 * DynamicValuesPanel - Fluent UI Version
 * 
 * Configures dynamic value mappings to Microsoft Dataverse tables.
 * Uses REAL-TIME Dataverse metadata - NO hardcoded sample data.
 */

import * as React from 'react';
import { useState, useEffect, useMemo } from "react";
import {
  Button,
  Input,
  Label,
  Field,
  Dropdown,
  Option,
  Combobox,
  Badge,
  TabList,
  Tab,
  Text,
  Tooltip,
  Spinner,
  makeStyles,
  tokens,
  shorthands,
  mergeClasses,
} from "@fluentui/react-components";
import {
  Dismiss24Regular,
  Add16Regular,
  Delete16Regular,
  FolderAdd16Regular,
  DatabaseRegular,
  Info16Regular,
  Code16Regular,
  Copy16Regular,
  Checkmark16Regular,
} from "@fluentui/react-icons";
import { generateFormattedFetchXml } from "../../lib/dataverse/fetchXmlGenerator";
import { generateFormattedOData } from "../../lib/dataverse/odataGenerator";
import { 
  useDataverse, 
  useEntityFields, 
  useLookupTargetFields,
  type FieldInfo,
} from "../../lib/dataverse/pcf";

// Re-export types for backward compatibility
export type { DynamicValueFilter, DynamicValueFilterGroup, DynamicValueConfig, DynamicValueOperator } from "../../types/questionnaire";
import type { DynamicValueFilter, DynamicValueFilterGroup, DynamicValueConfig } from "../../types/questionnaire";

// ============================================================================
// Fluent UI Styles
// ============================================================================

const useStyles = makeStyles({
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: "40%",
    minWidth: "450px",
    backgroundColor: tokens.colorNeutralBackground1,
    borderLeft: `1px solid ${tokens.colorNeutralStroke1}`,
    boxShadow: tokens.shadow64,
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  headerTitle: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap(tokens.spacingVerticalXS),
  },
  content: {
    flex: 1,
    overflowY: "auto",
    ...shorthands.padding(tokens.spacingVerticalL),
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap(tokens.spacingVerticalL),
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    ...shorthands.gap(tokens.spacingHorizontalM),
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  infoCard: {
    display: "flex",
    alignItems: "flex-start",
    ...shorthands.gap(tokens.spacingHorizontalM),
    ...shorthands.padding(tokens.spacingVerticalM),
    backgroundColor: tokens.colorBrandBackground2,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border("1px", "solid", tokens.colorBrandStroke1),
  },
  section: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap(tokens.spacingVerticalS),
  },
  sectionCard: {
    ...shorthands.padding(tokens.spacingVerticalM),
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    ...shorthands.gap(tokens.spacingHorizontalM),
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
  filterGroup: {
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorNeutralBackground1,
  },
  filterGroupHeader: {
    display: "flex",
    alignItems: "center",
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  filterGroupContent: {
    position: "relative",
  },
  filterRow: {
    display: "flex",
    alignItems: "stretch",
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    "&:last-child": {
      borderBottom: "none",
    },
  },
  filterRowConnector: {
    width: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  filterRowFields: {
    flex: 1,
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalS),
  },
  filterRowActions: {
    width: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  filterGroupFooter: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap(tokens.spacingHorizontalS),
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  emptyState: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...shorthands.padding(tokens.spacingVerticalXL),
    color: tokens.colorNeutralForeground3,
  },
  codePreview: {
    ...shorthands.padding(tokens.spacingVerticalM),
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    overflowX: "auto",
    whiteSpace: "pre",
    maxHeight: "200px",
    overflowY: "auto",
    position: "relative",
  },
  copyButton: {
    position: "absolute",
    top: tokens.spacingVerticalS,
    right: tokens.spacingHorizontalS,
  },
  lookupBadge: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap(tokens.spacingHorizontalXS),
  },
  entityBadge: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
  },
  connectorLine: {
    position: "absolute",
    left: "16px",
    top: 0,
    bottom: 0,
    width: "1px",
    backgroundColor: tokens.colorNeutralStroke1,
  },
  connectorBranch: {
    position: "absolute",
    left: "16px",
    top: "50%",
    width: "16px",
    height: "1px",
    backgroundColor: tokens.colorNeutralStroke1,
  },
});

// ============================================================================
// Interfaces
// ============================================================================

interface DynamicValuesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config?: DynamicValueConfig;
  onSave: (config: DynamicValueConfig) => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

// OData operators for filter conditions
const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does Not Contain' },
  { value: 'starts_with', label: 'Begins With' },
  { value: 'ends_with', label: 'Ends With' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'is_null', label: 'Is Null' },
  { value: 'is_not_null', label: 'Is Not Null' },
];

// Helper to check if a field is a lookup type
const isLookupField = (field: FieldInfo): boolean => {
  return field.type === 'lookup';
};

// Helper to get operators for a field type
const getOperatorsForFieldType = (fieldType: string) => {
  const stringOps = ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_null', 'is_not_null'];
  const numberOps = ['equals', 'not_equals', 'greater_than', 'less_than', 'is_null', 'is_not_null'];
  
  switch (fieldType) {
    case 'string':
      return OPERATORS.filter(op => stringOps.includes(op.value));
    case 'number':
    case 'decimal':
    case 'currency':
    case 'datetime':
      return OPERATORS.filter(op => numberOps.includes(op.value));
    default:
      return OPERATORS;
  }
};

// Helper to build lookup path
const buildLookupPath = (lookupField: string, targetField: string): string => {
  return `${lookupField}/${targetField}`;
};

// Helper to parse lookup path
const parseLookupPath = (path: string): { lookupField: string; targetField: string } | null => {
  const parts = path.split('/');
  if (parts.length === 2) {
    return { lookupField: parts[0], targetField: parts[1] };
  }
  return null;
};

const createEmptyConditionGroup = (): DynamicValueFilterGroup => ({
  type: 'group',
  id: `group-${Date.now()}`,
  matchType: 'AND',
  children: []
});

const createEmptyCondition = (): DynamicValueFilter => ({
  type: 'filter',
  id: `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  field: '',
  operator: 'equals',
  value: ''
});

// ============================================================================
// Filter Row Editor Component
// ============================================================================

interface FilterRowEditorProps {
  filter: DynamicValueFilter;
  availableFields: FieldInfo[];
  entityName: string;
  onUpdate: (updated: DynamicValueFilter) => void;
  onDelete: () => void;
}

const FilterRowEditor = ({ filter, availableFields, entityName, onUpdate, onDelete }: FilterRowEditorProps) => {
  const styles = useStyles();
  const [isLookupMode, setIsLookupMode] = useState(false);
  const [lookupField, setLookupField] = useState('');
  const [targetField, setTargetField] = useState('');

  useEffect(() => {
    const parsed = parseLookupPath(filter.field);
    if (parsed) {
      setIsLookupMode(true);
      setLookupField(parsed.lookupField);
      setTargetField(parsed.targetField);
    }
  }, []);

  // Use the lookup target fields hook
  const { targetInfo } = useLookupTargetFields(
    isLookupMode ? entityName : undefined, 
    isLookupMode ? lookupField : undefined
  );

  const selectedField = availableFields.find(f => f.logicalName === (isLookupMode ? lookupField : filter.field));
  const lookupFields = availableFields.filter(f => isLookupField(f));
  const targetEntityFields = targetInfo?.fields || [];

  const applicableOperators = isLookupMode
    ? getOperatorsForFieldType('string')
    : selectedField 
      ? getOperatorsForFieldType(selectedField.type)
      : OPERATORS;

  const handleFieldChange = (_: unknown, data: { optionValue?: string }) => {
    const value = data.optionValue || '';
    if (value === '__lookup__') {
      setIsLookupMode(true);
      setLookupField('');
      setTargetField('');
      onUpdate({ ...filter, field: '' });
    } else {
      setIsLookupMode(false);
      onUpdate({ ...filter, field: value });
    }
  };

  const handleLookupFieldChange = (_: unknown, data: { optionValue?: string }) => {
    const value = data.optionValue || '';
    setLookupField(value);
    setTargetField('');
    onUpdate({ ...filter, field: '' });
  };

  const handleTargetFieldChange = (_: unknown, data: { optionValue?: string }) => {
    const value = data.optionValue || '';
    setTargetField(value);
    if (lookupField && value) {
      const path = buildLookupPath(lookupField, value);
      onUpdate({ ...filter, field: path });
    }
  };

  const handleOperatorChange = (_: unknown, data: { optionValue?: string }) => {
    onUpdate({ ...filter, operator: (data.optionValue || 'equals') as DynamicValueFilter['operator'] });
  };

  const handleCancelLookup = () => {
    setIsLookupMode(false);
    setLookupField('');
    setTargetField('');
    onUpdate({ ...filter, field: '' });
  };

  return (
    <>
      <div className={styles.filterRowFields}>
        {isLookupMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS }}>
            <div className={styles.lookupBadge}>
              <Badge appearance="tint" color="brand" icon={<DatabaseRegular />}>Lookup</Badge>
              <Button
                appearance="subtle"
                size="small"
                icon={<Dismiss24Regular />}
                onClick={handleCancelLookup}
              >
                Cancel
              </Button>
            </div>
            <div className={styles.grid3}>
              <Dropdown
                placeholder="Lookup field..."
                value={lookupFields.find(f => f.logicalName === lookupField)?.displayName || ''}
                selectedOptions={lookupField ? [lookupField] : []}
                onOptionSelect={handleLookupFieldChange}
              >
                {lookupFields.map(field => (
                  <Option key={field.logicalName} value={field.logicalName} text={field.displayName}>
                    <DatabaseRegular style={{ marginRight: 8 }} />
                    {field.displayName}
                  </Option>
                ))}
              </Dropdown>

              <Dropdown
                placeholder="Related field..."
                value={targetEntityFields.find(f => f.logicalName === targetField)?.displayName || ''}
                selectedOptions={targetField ? [targetField] : []}
                onOptionSelect={handleTargetFieldChange}
                disabled={!lookupField || !targetInfo}
              >
                {targetEntityFields.map(field => (
                  <Option key={field.logicalName} value={field.logicalName} text={field.displayName}>
                    {field.displayName}
                    <Text size={200} style={{ marginLeft: 8, color: tokens.colorNeutralForeground3 }}>
                      ({field.type})
                    </Text>
                  </Option>
                ))}
              </Dropdown>

              <Dropdown
                placeholder="Operator"
                value={applicableOperators.find(op => op.value === filter.operator)?.label || ''}
                selectedOptions={[filter.operator]}
                onOptionSelect={handleOperatorChange}
              >
                {applicableOperators.map(op => (
                  <Option key={op.value} value={op.value} text={op.label}>
                    {op.label}
                  </Option>
                ))}
              </Dropdown>
            </div>
            {!['null', 'not_null'].includes(filter.operator) && (
              <Input
                placeholder="Value to compare"
                value={filter.value}
                onChange={(_, data) => onUpdate({ ...filter, value: data.value })}
              />
            )}
          </div>
        ) : (
          <div className={styles.grid3}>
            <Dropdown
              placeholder="Select field..."
              value={availableFields.find(f => f.logicalName === filter.field)?.displayName || ''}
              selectedOptions={filter.field ? [filter.field] : []}
              onOptionSelect={handleFieldChange}
            >
              {availableFields.map(field => (
                <Option key={field.logicalName} value={field.logicalName} text={field.displayName}>
                  {isLookupField(field) && <DatabaseRegular style={{ marginRight: 4 }} />}
                  {field.displayName}
                </Option>
              ))}
              {lookupFields.length > 0 && (
                <Option key="__lookup__" value="__lookup__" text="Filter by Related Field...">
                  <DatabaseRegular style={{ marginRight: 4, color: tokens.colorBrandForeground1 }} />
                  <Text style={{ color: tokens.colorBrandForeground1 }}>Filter by Related Field...</Text>
                </Option>
              )}
            </Dropdown>

            <Dropdown
              placeholder="Operator"
              value={applicableOperators.find(op => op.value === filter.operator)?.label || ''}
              selectedOptions={[filter.operator]}
              onOptionSelect={handleOperatorChange}
            >
              {applicableOperators.map(op => (
                <Option key={op.value} value={op.value} text={op.label}>
                  {op.label}
                </Option>
              ))}
            </Dropdown>

            {!['null', 'not_null'].includes(filter.operator) ? (
              <Input
                placeholder="Value"
                value={filter.value}
                onChange={(_, data) => onUpdate({ ...filter, value: data.value })}
              />
            ) : (
              <div />
            )}
          </div>
        )}
      </div>

      <div className={styles.filterRowActions}>
        <Tooltip content="Delete filter" relationship="label">
          <Button
            appearance="subtle"
            icon={<Delete16Regular />}
            onClick={onDelete}
          />
        </Tooltip>
      </div>
    </>
  );
};

// ============================================================================
// Filter Group Editor Component
// ============================================================================

interface FilterGroupEditorProps {
  group: DynamicValueFilterGroup;
  availableFields: FieldInfo[];
  entityName: string;
  onUpdate: (updated: DynamicValueFilterGroup) => void;
  onDelete?: () => void;
  isRoot?: boolean;
}

const FilterGroupEditor = ({ group, availableFields, entityName, onUpdate, onDelete, isRoot = true }: FilterGroupEditorProps) => {
  const styles = useStyles();

  const handleAddFilter = () => {
    onUpdate({
      ...group,
      children: [...group.children, createEmptyCondition()]
    });
  };

  const handleAddGroup = () => {
    onUpdate({
      ...group,
      children: [...group.children, createEmptyConditionGroup()]
    });
  };

  const handleUpdateChild = (childId: string, updated: DynamicValueFilter | DynamicValueFilterGroup) => {
    onUpdate({
      ...group,
      children: group.children.map(c => c.id === childId ? updated : c)
    });
  };

  const handleRemoveChild = (childId: string) => {
    onUpdate({
      ...group,
      children: group.children.filter(c => c.id !== childId)
    });
  };

  const handleMatchTypeChange = (_: unknown, data: { optionValue?: string }) => {
    onUpdate({ ...group, matchType: (data.optionValue || 'AND') as 'AND' | 'OR' });
  };

  return (
    <div className={styles.filterGroup}>
      {/* Header */}
      <div className={styles.filterGroupHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS, flex: 1 }}>
          <Dropdown
            value={group.matchType}
            selectedOptions={[group.matchType]}
            onOptionSelect={handleMatchTypeChange}
            style={{ minWidth: 80 }}
          >
            <Option value="AND">AND</Option>
            <Option value="OR">OR</Option>
          </Dropdown>
          <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
            Field
          </Text>
          <Text size={200} style={{ color: tokens.colorNeutralForeground3, marginLeft: 'auto' }}>
            Operator
          </Text>
          <Text size={200} style={{ color: tokens.colorNeutralForeground3, marginLeft: 'auto' }}>
            Value
          </Text>
        </div>
        {!isRoot && onDelete && (
          <Tooltip content="Delete group" relationship="label">
            <Button
              appearance="subtle"
              icon={<Delete16Regular />}
              onClick={onDelete}
            />
          </Tooltip>
        )}
      </div>

      {/* Content */}
      <div className={styles.filterGroupContent}>
        {group.children.length === 0 ? (
          <div className={styles.emptyState}>
            <Text>No conditions. Use buttons below to add filters.</Text>
          </div>
        ) : (
          group.children.map((child) => (
            <div key={child.id} className={styles.filterRow}>
              <div className={styles.filterRowConnector}>
                <div className={styles.connectorLine} />
                <div className={styles.connectorBranch} />
              </div>

              {child.type === 'group' ? (
                <div style={{ flex: 1, padding: tokens.spacingVerticalS }}>
                  <FilterGroupEditor
                    group={child}
                    availableFields={availableFields}
                    entityName={entityName}
                    onUpdate={(updated) => handleUpdateChild(child.id, updated)}
                    onDelete={() => handleRemoveChild(child.id)}
                    isRoot={false}
                  />
                </div>
              ) : (
                <FilterRowEditor
                  filter={child}
                  availableFields={availableFields}
                  entityName={entityName}
                  onUpdate={(updated) => handleUpdateChild(child.id, updated)}
                  onDelete={() => handleRemoveChild(child.id)}
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className={styles.filterGroupFooter}>
        <Button
          appearance="subtle"
          size="small"
          icon={<Add16Regular />}
          onClick={handleAddFilter}
        >
          Add Filter
        </Button>
        <Button
          appearance="subtle"
          size="small"
          icon={<FolderAdd16Regular />}
          onClick={handleAddGroup}
        >
          Add Group
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// Query Preview Component
// ============================================================================

interface QueryPreviewProps {
  config: {
    tableName: string;
    labelField: string;
    valueField: string;
    conditionGroup: DynamicValueFilterGroup;
    orderByField?: string;
    orderDirection: 'asc' | 'desc';
  };
}

const QueryPreview = ({ config }: QueryPreviewProps) => {
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = useState<string>('odata');
  const [copied, setCopied] = useState(false);

  const odataQuery = useMemo(() => {
    try {
      return generateFormattedOData(config);
    } catch {
      return '// Error generating OData query';
    }
  }, [config]);

  const fetchXmlQuery = useMemo(() => {
    try {
      return generateFormattedFetchXml(config, { top: 5000 });
    } catch {
      return '<!-- Error generating FetchXML query -->';
    }
  }, [config]);

  const handleCopy = async () => {
    const text = selectedTab === 'odata' ? odataQuery : fetchXmlQuery;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={styles.section}>
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
        <Code16Regular />
        <Label weight="semibold">Query Preview</Label>
      </div>

      <TabList
        selectedValue={selectedTab}
        onTabSelect={(_, data) => setSelectedTab(data.value as string)}
      >
        <Tab value="odata">OData</Tab>
        <Tab value="fetchxml">FetchXML</Tab>
      </TabList>

      <div style={{ position: 'relative' }}>
        <pre className={styles.codePreview}>
          {selectedTab === 'odata' ? odataQuery : fetchXmlQuery}
        </pre>
        <div className={styles.copyButton}>
          <Tooltip content={copied ? "Copied!" : "Copy to clipboard"} relationship="label">
            <Button
              appearance="subtle"
              size="small"
              icon={copied ? <Checkmark16Regular /> : <Copy16Regular />}
              onClick={handleCopy}
            />
          </Tooltip>
        </div>
      </div>

      <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
        {selectedTab === 'odata' 
          ? 'Use with Dataverse Web API: Xrm.WebApi.retrieveMultipleRecords()'
          : 'Use with FetchXML API: Xrm.WebApi.retrieveMultipleRecords(entityName, "?fetchXml=" + encodedXml)'
        }
      </Text>
    </div>
  );
};

// ============================================================================
// Main Panel Component
// ============================================================================

const DynamicValuesPanel = ({ isOpen, onClose, config, onSave }: DynamicValuesPanelProps) => {
  const styles = useStyles();
  const [tableName, setTableName] = useState('');
  const [labelField, setLabelField] = useState('');
  const [valueField, setValueField] = useState('');
  const [conditionGroup, setConditionGroup] = useState<DynamicValueFilterGroup>(createEmptyConditionGroup());
  const [orderByField, setOrderByField] = useState('');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (isOpen) {
      setTableName(config?.tableName || '');
      setLabelField(config?.labelField || '');
      setValueField(config?.valueField || '');
      setConditionGroup(config?.conditionGroup || config?.filterGroup || createEmptyConditionGroup());
      setOrderByField(config?.orderByField || '');
      setOrderDirection(config?.orderDirection || 'asc');
    }
  }, [isOpen, config]);

  const { entities, getEntityByName, isPCFEnvironment } = useDataverse();
  const { fields: availableFields, isLoading: fieldsLoading } = useEntityFields(tableName || undefined);
  const selectedEntity = getEntityByName(tableName);

  const handleSave = () => {
    onSave({
      tableName,
      labelField,
      valueField,
      conditionGroup,
      orderByField: orderByField || undefined,
      orderDirection
    });
    onClose();
  };

  const handleTableChange = (_: unknown, data: { optionValue?: string; optionText?: string }) => {
    const newTable = data.optionValue || '';
    setTableName(newTable);
    setLabelField('');
    setValueField('');
    setOrderByField('');
    setConditionGroup(createEmptyConditionGroup());
  };

  if (!isOpen) return null;

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Text size={500} weight="semibold">Configure Dynamic Values</Text>
          <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
            Map to Dataverse tables for PCF control integration
          </Text>
        </div>
        <Button
          appearance="subtle"
          icon={<Dismiss24Regular />}
          onClick={onClose}
        />
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Environment Indicator */}
        <div className={styles.infoCard} style={{ 
          backgroundColor: isPCFEnvironment ? tokens.colorPaletteGreenBackground2 : tokens.colorPaletteYellowBackground2,
          borderColor: isPCFEnvironment ? tokens.colorPaletteGreenBorder1 : tokens.colorPaletteYellowBorder1,
        }}>
          <Info16Regular style={{ 
            color: isPCFEnvironment ? tokens.colorPaletteGreenForeground1 : tokens.colorPaletteYellowForeground1, 
            flexShrink: 0, 
            marginTop: 2 
          }} />
          <div>
            <Text weight="semibold" size={300}>
              {isPCFEnvironment ? '🟢 Live Dataverse Connection' : '🟡 Development Mode (Sample Data)'}
            </Text>
            <Text size={200} style={{ display: 'block', color: tokens.colorNeutralForeground2 }}>
              {isPCFEnvironment 
                ? 'Connected to Dataverse. Entities and fields are fetched in real-time from your environment.'
                : 'Running in preview mode with sample entities. When deployed as a PCF control, this will automatically fetch real data from Dataverse via Xrm.WebApi.'
              }
            </Text>
          </div>
        </div>

        {/* Entity Selection */}
        <div className={styles.section}>
          <Field label="Dataverse Entity" hint="Select the Dataverse entity (table) from which dynamic values will be fetched.">
            <Combobox
              placeholder="Search entities..."
              value={selectedEntity?.displayName || ''}
              selectedOptions={tableName ? [tableName] : []}
              onOptionSelect={handleTableChange}
            >
              {entities.map((entity) => (
                <Option key={entity.logicalName} value={entity.logicalName} text={entity.displayName}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS, width: '100%' }}>
                    <DatabaseRegular />
                    <span style={{ flex: 1 }}>{entity.displayName}</span>
                    <Badge appearance="outline" className={styles.entityBadge}>
                      {entity.logicalName}
                    </Badge>
                  </div>
                </Option>
              ))}
            </Combobox>
          </Field>
        </div>

        {/* Attribute Mappings */}
        {tableName && (
          <div className={styles.section}>
            <Label weight="semibold">Attribute Mappings</Label>
            <div className={mergeClasses(styles.sectionCard, styles.grid2)}>
              <Field label="Label Attribute (Display Name)" hint="Displayed to the user">
                <Dropdown
                  placeholder="Select field for label..."
                  value={availableFields.find(f => f.logicalName === labelField)?.displayName || ''}
                  selectedOptions={labelField ? [labelField] : []}
                  onOptionSelect={(_, data) => setLabelField(data.optionValue || '')}
                >
                  {availableFields.map(field => (
                    <Option key={field.logicalName} value={field.logicalName} text={field.displayName}>
                      {field.displayName}
                      <Text size={200} style={{ marginLeft: 8, color: tokens.colorNeutralForeground3 }}>
                        ({field.logicalName})
                      </Text>
                    </Option>
                  ))}
                </Dropdown>
              </Field>

              <Field label="Value Attribute (Primary Key)" hint="Stored as the answer">
                <Dropdown
                  placeholder="Select field for value..."
                  value={availableFields.find(f => f.logicalName === valueField)?.displayName || ''}
                  selectedOptions={valueField ? [valueField] : []}
                  onOptionSelect={(_, data) => setValueField(data.optionValue || '')}
                >
                  {availableFields.map(field => (
                    <Option key={field.logicalName} value={field.logicalName} text={field.displayName}>
                      {field.displayName}
                      <Text size={200} style={{ marginLeft: 8, color: tokens.colorNeutralForeground3 }}>
                        ({field.logicalName})
                      </Text>
                    </Option>
                  ))}
                </Dropdown>
              </Field>
            </div>
          </div>
        )}

        {/* Filter Conditions */}
        {tableName && (
          <div className={styles.section}>
            <Label weight="semibold">Filter Conditions (OData $filter)</Label>
            <FilterGroupEditor
              group={conditionGroup}
              availableFields={availableFields}
              entityName={tableName}
              onUpdate={setConditionGroup}
            />
          </div>
        )}

        {/* Ordering */}
        {tableName && (
          <div className={styles.section}>
            <Label weight="semibold">Ordering (OData $orderby)</Label>
            <div className={mergeClasses(styles.sectionCard, styles.grid2)}>
              <Field label="Order By Field">
                <Dropdown
                  placeholder="Select field..."
                  value={availableFields.find(f => f.logicalName === orderByField)?.displayName || 'None'}
                  selectedOptions={orderByField ? [orderByField] : []}
                  onOptionSelect={(_, data) => setOrderByField(data.optionValue || '')}
                >
                  <Option value="" text="None">None</Option>
                  {availableFields.map(field => (
                    <Option key={field.logicalName} value={field.logicalName} text={field.displayName}>
                      {field.displayName}
                    </Option>
                  ))}
                </Dropdown>
              </Field>

              <Field label="Direction">
                <Dropdown
                  value={orderDirection === 'asc' ? 'Ascending (A → Z)' : 'Descending (Z → A)'}
                  selectedOptions={[orderDirection]}
                  onOptionSelect={(_, data) => setOrderDirection((data.optionValue || 'asc') as 'asc' | 'desc')}
                >
                  <Option value="asc">Ascending (A → Z)</Option>
                  <Option value="desc">Descending (Z → A)</Option>
                </Dropdown>
              </Field>
            </div>
          </div>
        )}

        {/* Query Preview */}
        {tableName && labelField && valueField && (
          <QueryPreview 
            config={{
              tableName,
              labelField,
              valueField,
              conditionGroup,
              orderByField: orderByField || undefined,
              orderDirection
            }}
          />
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <Button appearance="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          appearance="primary"
          onClick={handleSave}
          disabled={!tableName || !labelField || !valueField}
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default DynamicValuesPanel;
