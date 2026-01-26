/**
 * Interactive Dynamic Values Playground
 * 
 * Self-contained playground for PCF documentation.
 * NO external dependencies on project files.
 */

import * as React from 'react';
import { useState, useMemo, useCallback } from "react";
import {
  makeStyles,
  tokens,
  shorthands,
  Card,
  CardHeader,
  Title3,
  Body1,
  Body2,
  Label,
  Dropdown,
  Option,
  Input,
  Button,
  Badge,
  Divider,
  TabList,
  Tab,
  SelectTabData,
  SelectTabEvent,
  Combobox,
  Spinner,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from "@fluentui/react-components";
import {
  Add16Regular,
  Delete16Regular,
  Play16Regular,
  Copy16Regular,
  Checkmark16Regular,
  Database16Regular,
  Filter16Regular,
  ArrowSort16Regular,
  Play24Regular,
  Dismiss16Regular,
  TableSimple24Regular,
} from "@fluentui/react-icons";

// Self-contained imports (no project dependencies)
import { CodeBlock } from "./CodeBlock";
import { SAMPLE_ENTITIES, SAMPLE_DATA, getFilterableFields, OPERATORS } from "../data/sampleEntities";
import { generateFetchXml, generateFormattedOData } from "../utils/queryGenerators";
import type { DynamicValueConfig, DynamicValueFilterGroup, DynamicValueFilter, ConditionOperator, FilterState, SampleRecord } from "../types";

// ============================================================================
// Styles
// ============================================================================

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
    padding: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusLarge,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  configSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: tokens.spacingVerticalL,
    "@media (max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
  },
  filtersSection: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  filterHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterRow: {
    display: "grid",
    gridTemplateColumns: "1fr 120px 1fr auto",
    gap: tokens.spacingHorizontalS,
    alignItems: "center",
  },
  previewSection: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  tabContent: {
    marginTop: tokens.spacingVerticalM,
  },
  emptyState: {
    padding: tokens.spacingVerticalL,
    textAlign: "center",
    color: tokens.colorNeutralForeground3,
    fontStyle: "italic",
  },
  orderRow: {
    display: "grid",
    gridTemplateColumns: "1fr 120px",
    gap: tokens.spacingHorizontalS,
    alignItems: "center",
  },
  badgeRow: {
    display: "flex",
    gap: tokens.spacingHorizontalS,
    flexWrap: "wrap",
    marginTop: tokens.spacingVerticalS,
  },
  resultsSection: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorBrandStroke1}`,
  },
  resultsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultsTitle: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  resultsTable: {
    marginTop: tokens.spacingVerticalS,
    ...shorthands.overflow("auto"),
    maxHeight: "300px",
  },
  resultRow: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  tryItButton: {
    minWidth: "120px",
  },
  statsRow: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
    flexWrap: "wrap",
  },
  loadingOverlay: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalL,
  },
});

// ============================================================================
// Component
// ============================================================================

export const DynamicValuesPlayground = () => {
  const styles = useStyles();
  
  // Configuration state
  const [selectedEntity, setSelectedEntity] = useState<string>("account");
  const [valueField, setValueField] = useState<string>("accountid");
  const [labelField, setLabelField] = useState<string>("name");
  const [orderByField, setOrderByField] = useState<string>("name");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<FilterState[]>([
    { id: "1", field: "statecode", operator: "eq", value: "0" }
  ]);
  const [matchType, setMatchType] = useState<"AND" | "OR">("AND");
  
  // UI state
  const [activeTab, setActiveTab] = useState<string>("odata");
  const [copied, setCopied] = useState(false);
  
  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SampleRecord[] | null>(null);
  const [executionTime, setExecutionTime] = useState<number>(0);

  // Get current entity and its fields
  const currentEntity = useMemo(() => 
    SAMPLE_ENTITIES.find(e => e.logicalName === selectedEntity),
    [selectedEntity]
  );

  const filterableFields = useMemo(() => 
    currentEntity ? getFilterableFields(currentEntity) : [],
    [currentEntity]
  );

  // Build DynamicValueConfig from state
  const config = useMemo((): DynamicValueConfig => {
    const conditionGroup: DynamicValueFilterGroup = {
      type: "group",
      id: "root",
      matchType,
      children: filters
        .filter(f => f.field)
        .map((f): DynamicValueFilter => ({
          type: "filter",
          id: f.id,
          field: f.field,
          operator: f.operator as ConditionOperator,
          value: f.value,
        })),
    };

    return {
      tableName: selectedEntity,
      valueField,
      labelField,
      orderByField,
      orderDirection,
      conditionGroup,
    };
  }, [selectedEntity, valueField, labelField, orderByField, orderDirection, filters, matchType]);

  // Generate queries
  const { odataQuery, fetchXmlQuery, error } = useMemo(() => {
    try {
      const odata = generateFormattedOData(config);
      const fetchXml = generateFetchXml(config, { top: 500 });
      return { odataQuery: odata, fetchXmlQuery: fetchXml, error: null };
    } catch (e) {
      return { 
        odataQuery: "", 
        fetchXmlQuery: "", 
        error: e instanceof Error ? e.message : "Unknown error" 
      };
    }
  }, [config]);

  // Handlers
  const handleEntityChange = (entity: string) => {
    setSelectedEntity(entity);
    const newEntity = SAMPLE_ENTITIES.find(e => e.logicalName === entity);
    if (newEntity) {
      setValueField(newEntity.primaryIdAttribute);
      setLabelField(newEntity.primaryNameAttribute);
      setOrderByField(newEntity.primaryNameAttribute);
      setFilters([{ id: "1", field: "statecode", operator: "eq", value: "0" }]);
    }
  };

  const addFilter = () => {
    setFilters([
      ...filters,
      { id: String(Date.now()), field: "", operator: "eq", value: "" }
    ]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const updateFilter = (id: string, updates: Partial<FilterState>) => {
    setFilters(filters.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleCopy = async () => {
    const text = activeTab === "odata" ? odataQuery : fetchXmlQuery;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTabSelect = (_: SelectTabEvent, data: SelectTabData) => {
    setActiveTab(data.value as string);
  };

  // Simulation logic
  const simulateQuery = useCallback(async () => {
    setIsSimulating(true);
    setSimulationResults(null);
    
    const startTime = performance.now();
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    
    // Get sample data for this entity
    const entityData = SAMPLE_DATA[selectedEntity] || [];
    
    // Apply filters
    let filteredData = entityData.filter(record => {
      if (filters.length === 0 || !filters.some(f => f.field)) {
        return true;
      }

      const filterResults = filters
        .filter(f => f.field)
        .map(filter => {
          const recordValue = record[filter.field];
          const filterValue = filter.value;
          
          switch (filter.operator) {
            case "eq":
              return String(recordValue) === filterValue;
            case "ne":
              return String(recordValue) !== filterValue;
            case "gt":
              return Number(recordValue) > Number(filterValue);
            case "lt":
              return Number(recordValue) < Number(filterValue);
            case "contains":
              return String(recordValue).toLowerCase().includes(filterValue.toLowerCase());
            case "startswith":
              return String(recordValue).toLowerCase().startsWith(filterValue.toLowerCase());
            case "null":
              return recordValue === null || recordValue === undefined || recordValue === "";
            case "not_null":
              return recordValue !== null && recordValue !== undefined && recordValue !== "";
            default:
              return true;
          }
        });

      if (matchType === "AND") {
        return filterResults.every(r => r);
      } else {
        return filterResults.some(r => r);
      }
    });

    // Apply ordering
    if (orderByField) {
      filteredData = [...filteredData].sort((a, b) => {
        const aVal = a[orderByField];
        const bVal = b[orderByField];
        
        if (typeof aVal === "number" && typeof bVal === "number") {
          return orderDirection === "asc" ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = String(aVal || "").toLowerCase();
        const bStr = String(bVal || "").toLowerCase();
        
        return orderDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }

    const endTime = performance.now();
    setExecutionTime(Math.round(endTime - startTime));
    setSimulationResults(filteredData);
    setIsSimulating(false);
  }, [selectedEntity, filters, matchType, orderByField, orderDirection]);

  const clearResults = () => {
    setSimulationResults(null);
    setExecutionTime(0);
  };

  // Get display columns for results table
  const displayColumns = useMemo(() => {
    const cols: string[] = [];
    if (valueField) cols.push(valueField);
    if (labelField && labelField !== valueField) cols.push(labelField);
    const extraCols = currentEntity?.fields
      .filter(f => f.logicalName !== valueField && f.logicalName !== labelField)
      .slice(0, 2)
      .map(f => f.logicalName) || [];
    return [...cols, ...extraCols];
  }, [valueField, labelField, currentEntity]);

  const getFieldDisplayName = (logicalName: string): string => {
    return currentEntity?.fields.find(f => f.logicalName === logicalName)?.displayName || logicalName;
  };

  const formatCellValue = (value: string | number | boolean | null): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number" && value > 10000) {
      return value.toLocaleString();
    }
    const str = String(value);
    if (str.length === 36 && str.includes("-")) {
      return str.substring(0, 8) + "...";
    }
    return str;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Play16Regular />
          <Title3>Interactive Configuration Playground</Title3>
        </div>
        <Badge appearance="outline" color="success">Live Preview</Badge>
      </div>

      <Divider />

      {/* Entity & Field Selection */}
      <Card>
        <CardHeader
          image={<Database16Regular />}
          header={<b>1. Select Entity & Fields</b>}
          description="Choose which Dataverse table to query and map fields"
        />
        <div className={styles.configSection} style={{ padding: tokens.spacingVerticalM }}>
          <div className={styles.fieldGroup}>
            <Label htmlFor="entity-select">Dataverse Entity</Label>
            <Combobox
              id="entity-select"
              value={currentEntity?.displayName || ""}
              onOptionSelect={(_, data) => {
                if (data.optionValue) handleEntityChange(data.optionValue);
              }}
              placeholder="Select entity..."
            >
              {SAMPLE_ENTITIES.map(entity => (
                <Option key={entity.logicalName} value={entity.logicalName} text={`${entity.displayName} (${entity.logicalName})`}>
                  {entity.displayName} ({entity.logicalName})
                </Option>
              ))}
            </Combobox>
          </div>

          <div className={styles.fieldGroup}>
            <Label htmlFor="value-field">Value Attribute (stored)</Label>
            <Dropdown
              id="value-field"
              value={currentEntity?.fields.find(f => f.logicalName === valueField)?.displayName || valueField}
              onOptionSelect={(_, data) => data.optionValue && setValueField(data.optionValue)}
            >
              {currentEntity?.fields.map(field => (
                <Option key={field.logicalName} value={field.logicalName} text={`${field.displayName} (${field.logicalName})`}>
                  {field.displayName} ({field.logicalName})
                </Option>
              ))}
            </Dropdown>
          </div>

          <div className={styles.fieldGroup}>
            <Label htmlFor="label-field">Label Attribute (displayed)</Label>
            <Dropdown
              id="label-field"
              value={currentEntity?.fields.find(f => f.logicalName === labelField)?.displayName || labelField}
              onOptionSelect={(_, data) => data.optionValue && setLabelField(data.optionValue)}
            >
              {currentEntity?.fields.map(field => (
                <Option key={field.logicalName} value={field.logicalName} text={`${field.displayName} (${field.logicalName})`}>
                  {field.displayName} ({field.logicalName})
                </Option>
              ))}
            </Dropdown>
          </div>

          <div className={styles.fieldGroup}>
            <Label>Current Config</Label>
            <div className={styles.badgeRow}>
              <Badge appearance="tint" color="informative">{selectedEntity}</Badge>
              <Badge appearance="tint" color="success">Value: {valueField}</Badge>
              <Badge appearance="tint" color="warning">Label: {labelField}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader
          image={<Filter16Regular />}
          header={<b>2. Add Filter Conditions</b>}
          description="Filter which records appear in the dropdown"
        />
        <div className={styles.filtersSection} style={{ margin: tokens.spacingVerticalM }}>
          <div className={styles.filterHeader}>
            <Dropdown
              value={matchType}
              onOptionSelect={(_, data) => setMatchType(data.optionValue as "AND" | "OR")}
              style={{ width: 100 }}
            >
              <Option value="AND">AND</Option>
              <Option value="OR">OR</Option>
            </Dropdown>
            <Button
              appearance="subtle"
              icon={<Add16Regular />}
              onClick={addFilter}
            >
              Add Filter
            </Button>
          </div>

          {filters.length === 0 ? (
            <div className={styles.emptyState}>
              No filters configured. All records will be returned.
            </div>
          ) : (
            filters.map((filter) => (
              <div key={filter.id} className={styles.filterRow}>
                <Dropdown
                  value={filterableFields.find(f => f.logicalName === filter.field)?.displayName || filter.field || "Select field..."}
                  onOptionSelect={(_, data) => updateFilter(filter.id, { field: data.optionValue || "" })}
                  placeholder="Field"
                >
                  {filterableFields.map(field => (
                    <Option key={field.logicalName} value={field.logicalName}>
                      {field.displayName}
                    </Option>
                  ))}
                </Dropdown>

                <Dropdown
                  value={OPERATORS.find(o => o.value === filter.operator)?.label || filter.operator}
                  onOptionSelect={(_, data) => updateFilter(filter.id, { operator: data.optionValue || "eq" })}
                >
                  {OPERATORS.map(op => (
                    <Option key={op.value} value={op.value}>
                      {op.label}
                    </Option>
                  ))}
                </Dropdown>

                <Input
                  value={filter.value}
                  onChange={(_, data) => updateFilter(filter.id, { value: data.value })}
                  placeholder="Value"
                  disabled={["null", "not_null"].includes(filter.operator)}
                />

                <Button
                  appearance="subtle"
                  icon={<Delete16Regular />}
                  onClick={() => removeFilter(filter.id)}
                  title="Remove filter"
                />
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Ordering */}
      <Card>
        <CardHeader
          image={<ArrowSort16Regular />}
          header={<b>3. Set Ordering</b>}
          description="Define sort order for dropdown options"
        />
        <div className={styles.orderRow} style={{ padding: tokens.spacingVerticalM }}>
          <Dropdown
            value={currentEntity?.fields.find(f => f.logicalName === orderByField)?.displayName || orderByField}
            onOptionSelect={(_, data) => data.optionValue && setOrderByField(data.optionValue)}
          >
            {currentEntity?.fields.map(field => (
              <Option key={field.logicalName} value={field.logicalName}>
                {field.displayName}
              </Option>
            ))}
          </Dropdown>

          <Dropdown
            value={orderDirection === "asc" ? "Ascending" : "Descending"}
            onOptionSelect={(_, data) => setOrderDirection(data.optionValue as "asc" | "desc")}
          >
            <Option value="asc">Ascending</Option>
            <Option value="desc">Descending</Option>
          </Dropdown>
        </div>
      </Card>

      {/* Try It Section */}
      <Card>
        <CardHeader
          image={<TableSimple24Regular />}
          header={<b>4. Try It - Simulate Query</b>}
          description="Execute the query against sample data to see results"
          action={
            <Button
              appearance="primary"
              icon={isSimulating ? <Spinner size="tiny" /> : <Play24Regular />}
              onClick={simulateQuery}
              disabled={isSimulating}
              className={styles.tryItButton}
            >
              {isSimulating ? "Running..." : "Try It"}
            </Button>
          }
        />
        
        {isSimulating && (
          <div className={styles.loadingOverlay}>
            <Spinner size="small" />
            <Body1>Executing query against sample data...</Body1>
          </div>
        )}

        {simulationResults !== null && !isSimulating && (
          <div className={styles.resultsSection} style={{ margin: tokens.spacingVerticalM }}>
            <div className={styles.resultsHeader}>
              <div className={styles.resultsTitle}>
                <TableSimple24Regular />
                <Title3>Query Results</Title3>
              </div>
              <div style={{ display: "flex", gap: tokens.spacingHorizontalS, alignItems: "center" }}>
                <Badge appearance="filled" color="success">
                  {simulationResults.length} record{simulationResults.length !== 1 ? "s" : ""}
                </Badge>
                <Badge appearance="tint" color="informative">
                  {executionTime}ms
                </Badge>
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<Dismiss16Regular />}
                  onClick={clearResults}
                  title="Clear results"
                />
              </div>
            </div>

            <div className={styles.statsRow}>
              <Body2>
                <strong>Entity:</strong> {currentEntity?.displayName}
              </Body2>
              <Body2>
                <strong>Filters:</strong> {filters.filter(f => f.field).length} condition{filters.filter(f => f.field).length !== 1 ? "s" : ""}
              </Body2>
              <Body2>
                <strong>Order:</strong> {getFieldDisplayName(orderByField)} ({orderDirection})
              </Body2>
            </div>

            {simulationResults.length === 0 ? (
              <div className={styles.emptyState}>
                No records match the current filter criteria.
              </div>
            ) : (
              <div className={styles.resultsTable}>
                <Table size="small">
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell style={{ width: "40px" }}>#</TableHeaderCell>
                      {displayColumns.map(col => (
                        <TableHeaderCell key={col}>
                          {getFieldDisplayName(col)}
                        </TableHeaderCell>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {simulationResults.slice(0, 10).map((record, index) => (
                      <TableRow key={index} className={styles.resultRow}>
                        <TableCell>{index + 1}</TableCell>
                        {displayColumns.map(col => (
                          <TableCell key={col}>
                            {formatCellValue(record[col])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {simulationResults.length > 10 && (
                  <div style={{ 
                    padding: tokens.spacingVerticalS, 
                    textAlign: "center",
                    color: tokens.colorNeutralForeground3 
                  }}>
                    Showing first 10 of {simulationResults.length} results
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Query Preview */}
      <div className={styles.previewSection}>
        <div className={styles.header}>
          <Title3>Generated Query Preview</Title3>
          <Button
            appearance="subtle"
            icon={copied ? <Checkmark16Regular /> : <Copy16Regular />}
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>

        <TabList selectedValue={activeTab} onTabSelect={handleTabSelect}>
          <Tab value="odata">OData URL</Tab>
          <Tab value="fetchxml">FetchXML</Tab>
          <Tab value="config">Config Object</Tab>
        </TabList>

        <div className={styles.tabContent}>
          {error ? (
            <div style={{ color: tokens.colorPaletteRedForeground1, padding: tokens.spacingVerticalM }}>
              Error: {error}
            </div>
          ) : activeTab === "odata" ? (
            <CodeBlock code={odataQuery || "// Configure entity and fields above"} language="text" />
          ) : activeTab === "fetchxml" ? (
            <CodeBlock code={fetchXmlQuery || "<!-- Configure entity and fields above -->"} language="xml" />
          ) : (
            <CodeBlock 
              code={JSON.stringify(config, null, 2)} 
              language="json" 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicValuesPlayground;
