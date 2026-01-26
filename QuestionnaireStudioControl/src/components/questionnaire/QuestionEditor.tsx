import * as React from 'react';
import { useState } from "react";
import {
  Card,
  CardHeader,
  Input,
  Checkbox,
  Button,
  Label,
  Dropdown,
  Option,
  Field,
  Badge,
  makeStyles,
  tokens,
  Text,
  Divider,
} from "@fluentui/react-components";
import {
  QuestionCircle24Regular,
  Add24Regular,
  BranchFork24Regular,
  Delete24Regular,
  Flash24Regular,
  Library24Regular,
} from "@fluentui/react-icons";
import { ConfirmDialog } from "../fluent";
import ActionRecordEditor from "./ActionRecordEditor";
import { Question, AnswerLevelRuleGroup, AnswerSet, QuestionType } from "../../types/questionnaire";
import AnswerSetEditor from "./AnswerSetEditor";
import AnswerLevelRuleGroupEditor from "./AnswerLevelRuleGroupEditor";
import AnswerSetPickerDialog from "./AnswerSetPickerDialog";
import { cn } from "../../lib/utils";

const useStyles = makeStyles({
  card: {
    border: `1px dashed ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: tokens.spacingVerticalM,
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  actionBadge: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
    padding: tokens.spacingHorizontalL,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: tokens.spacingHorizontalM,
  },
  checkboxGroup: {
    display: "flex",
    alignItems: "flex-end",
    gap: tokens.spacingHorizontalL,
  },
  checkboxItem: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  splitLayout: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
  },
  leftPanel: {
    width: "20%",
    minWidth: "160px",
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  rightPanel: {
    width: "80%",
    flex: 1,
  },
  branchingItem: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: tokens.colorNeutralBackground1,
  },
  branchingItemSelected: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
    border: `1px solid ${tokens.colorBrandStroke1}`,
  },
  branchingName: {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  emptyState: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "96px",
    border: `1px dashed ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  emptyStateTall: {
    height: "128px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: tokens.spacingVerticalS,
  },
});

interface QuestionEditorProps {
  question: Question;
  allQuestions: Question[];
  onUpdate: (id: string, updated: Partial<Question>) => void;
  onDelete?: (questionId: string) => void;
}

const QUESTION_TYPES = [
  { value: "Choice", label: "Choice-options" },
  { value: "Dropdown", label: "Dropdown" },
  { value: "RadioButton", label: "Radio Button" },
  { value: "MultiSelect", label: "Multi-Select" },
  { value: "Text", label: "Text" },
  { value: "TextArea", label: "Text Area" },
  { value: "Number", label: "Number" },
  { value: "Decimal", label: "Decimal" },
  { value: "Date", label: "Date" },
  { value: "Rating", label: "Rating" },
  { value: "Boolean", label: "Boolean (Yes/No)" },
  { value: "Document", label: "File Attachment" },
  { value: "DownloadableDocument", label: "Downloadable Document" },
];

const QuestionEditor = ({ question, allQuestions, onUpdate, onDelete }: QuestionEditorProps) => {
  const styles = useStyles();
  const [selectedBranchingId, setSelectedBranchingId] = useState<string | null>(
    question.answerLevelRuleGroups.length > 0 ? question.answerLevelRuleGroups[0].id : null
  );
  const [showAnswerSetPicker, setShowAnswerSetPicker] = useState(false);
  const [pickerTargetAnswerSetId, setPickerTargetAnswerSetId] = useState<string | null>(null);
  const [pickerTargetBranchingId, setPickerTargetBranchingId] = useState<string | null>(null);

  const handleOpenPickerForAnswerSet = (answerSetId: string) => {
    setPickerTargetAnswerSetId(answerSetId);
    setPickerTargetBranchingId(null);
    setShowAnswerSetPicker(true);
  };

  const handleOpenPickerForBranching = (branchingId: string) => {
    setPickerTargetAnswerSetId(null);
    setPickerTargetBranchingId(branchingId);
    setShowAnswerSetPicker(true);
  };

  const handleSelectFromExisting = (answerSet: AnswerSet) => {
    if (pickerTargetAnswerSetId) {
      const updatedSets = question.answerSets.map(s => 
        s.id === pickerTargetAnswerSetId 
          ? { ...answerSet, id: s.id }
          : s
      );
      onUpdate(question.id, { answerSets: updatedSets });
    } else if (pickerTargetBranchingId) {
      const updatedGroups = question.answerLevelRuleGroups.map(g => 
        g.id === pickerTargetBranchingId 
          ? { 
              ...g, 
              inlineAnswerSet: { 
                ...answerSet, 
                id: g.inlineAnswerSet?.id || answerSet.id 
              } 
            }
          : g
      );
      onUpdate(question.id, { answerLevelRuleGroups: updatedGroups });
    }
    setPickerTargetAnswerSetId(null);
    setPickerTargetBranchingId(null);
  };

  const handleAddAnswerLevelBranching = () => {
    const newGroup: AnswerLevelRuleGroup = {
      type: 'group',
      id: `ag-${Date.now()}`,
      matchType: 'AND',
      children: [],
      inlineAnswerSet: {
        id: `as-inline-${Date.now()}`,
        name: '',
        tag: '',
        isDefault: false,
        answers: [
          {
            id: `ans-${Date.now()}`,
            label: '',
            value: '',
            active: true
          }
        ]
      }
    };
    onUpdate(question.id, { 
      answerLevelRuleGroups: [...question.answerLevelRuleGroups, newGroup] 
    });
    setSelectedBranchingId(newGroup.id);
  };

  const handleRemoveAnswerLevelBranching = (groupId: string) => {
    const newGroups = question.answerLevelRuleGroups.filter(g => g.id !== groupId);
    onUpdate(question.id, { answerLevelRuleGroups: newGroups });
    
    if (selectedBranchingId === groupId) {
      setSelectedBranchingId(newGroups.length > 0 ? newGroups[0].id : null);
    }
  };

  const handleUpdateAnswerLevelGroup = (groupId: string, updated: AnswerLevelRuleGroup) => {
    onUpdate(question.id, { 
      answerLevelRuleGroups: question.answerLevelRuleGroups.map(g => 
        g.id === groupId ? updated : g
      ) 
    });
  };

  const selectedBranching = question.answerLevelRuleGroups.find(g => g.id === selectedBranchingId);

  return (
    <Card className={styles.card}>
      <CardHeader
        header={
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <QuestionCircle24Regular primaryFill={tokens.colorBrandForeground1} />
              <Text weight="semibold" size={500}>Question Details</Text>
            </div>
            <div className={styles.headerActions}>
              <div className={styles.actionBadge}>
                <Flash24Regular 
                  primaryFill={question.actionRecord ? tokens.colorPaletteYellowForeground1 : tokens.colorNeutralForeground4} 
                />
                <Text size={200}>Action:</Text>
                <ActionRecordEditor
                  actionRecord={question.actionRecord}
                  onUpdate={(actionRecord) => onUpdate(question.id, { actionRecord })}
                />
              </div>
              {onDelete && (
                <ConfirmDialog
                  trigger={
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<Delete24Regular />}
                    >
                      Delete Question
                    </Button>
                  }
                  title="Delete Question"
                  description={`Are you sure you want to delete "${question.text || 'Untitled Question'}"? This will also delete all answer sets and conditional branching rules. This action cannot be undone.`}
                  onConfirm={() => onDelete(question.id)}
                />
              )}
            </div>
          </div>
        }
      />
      
      <div className={styles.content}>
        {/* Question Title */}
        <Field
          label={<Label required>Question Title</Label>}
          validationState={!question.text.trim() ? "error" : "none"}
        >
          <Input
            placeholder="Enter your question"
            value={question.text}
            onChange={(e, data) => onUpdate(question.id, { text: data.value })}
          />
        </Field>

        {/* Question Type and Checkboxes */}
        <div className={styles.formGrid}>
          <Field label={<Label required>Question Type</Label>}>
            <Dropdown
              value={QUESTION_TYPES.find(t => t.value === question.type)?.label || question.type}
              selectedOptions={[question.type]}
              onOptionSelect={(_, data) => {
                if (data.optionValue) {
                  onUpdate(question.id, { type: data.optionValue as QuestionType });
                }
              }}
            >
              {QUESTION_TYPES.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Dropdown>
          </Field>

          <div className={styles.checkboxGroup}>
            <div className={styles.checkboxItem}>
              <Checkbox
                id="required"
                checked={question.required}
                onChange={(_, data) => onUpdate(question.id, { required: !!data.checked })}
                label="Required"
              />
            </div>
            <div className={styles.checkboxItem}>
              <Checkbox
                id="readOnly"
                checked={question.readOnly ?? false}
                onChange={(_, data) => onUpdate(question.id, { readOnly: !!data.checked })}
                label="Read-only"
              />
            </div>
            <div className={styles.checkboxItem}>
              <Checkbox
                id="hidden"
                checked={question.hidden ?? false}
                onChange={(_, data) => onUpdate(question.id, { hidden: !!data.checked })}
                label="Hidden"
              />
            </div>
          </div>
        </div>

        <Divider />

        {/* Answer Sets */}
        <div>
          <Text weight="semibold" size={400}>Answer Sets</Text>
          <div style={{ marginTop: tokens.spacingVerticalM, display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM }}>
            {question.answerSets.map(as => (
              <AnswerSetEditor
                key={as.id}
                answerSet={as}
                questionType={question.type}
                textValidationType={question.textConfig?.validationType}
                onTextValidationChange={(validationType) => onUpdate(question.id, { 
                  textConfig: { 
                    ...question.textConfig, 
                    validationType 
                  } 
                })}
                textAreaFormat={question.textAreaConfig?.format}
                onTextAreaFormatChange={(format) => onUpdate(question.id, { 
                  textAreaConfig: { 
                    ...question.textAreaConfig,
                    format 
                  } 
                })}
                onUpdate={(updated) => {
                  const updatedSets = question.answerSets.map(s => 
                    s.id === as.id ? updated : s
                  );
                  onUpdate(question.id, { answerSets: updatedSets });
                }}
                onAddFromExisting={() => handleOpenPickerForAnswerSet(as.id)}
              />
            ))}
          </div>
        </div>

        <Divider />

        {/* Answer-Level Conditional Branching */}
        <div>
          <div className={styles.sectionHeader}>
            <Text weight="semibold" size={400}>Answer-Level Conditional Branching</Text>
            <Button 
              appearance="outline" 
              size="small"
              icon={<Add24Regular />}
              onClick={handleAddAnswerLevelBranching}
            >
              Add Answer Set
            </Button>
          </div>
          
          {question.answerLevelRuleGroups.length > 0 ? (
            <div className={styles.splitLayout}>
              {/* Left panel - Branching list */}
              <div className={styles.leftPanel}>
                {question.answerLevelRuleGroups.map((group) => (
                  <div
                    key={group.id}
                    className={cn(
                      styles.branchingItem,
                      selectedBranchingId === group.id && styles.branchingItemSelected
                    )}
                    onClick={() => setSelectedBranchingId(group.id)}
                  >
                    <BranchFork24Regular />
                    <span className={styles.branchingName}>
                      {group.inlineAnswerSet?.name || 'Untitled Answer Set'}
                    </span>
                    <ConfirmDialog
                      trigger={
                        <Button
                          appearance="subtle"
                          size="small"
                          icon={<Delete24Regular />}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                      title="Delete Answer Set"
                      description={`Are you sure you want to delete "${group.inlineAnswerSet?.name || 'Untitled Answer Set'}"? This will also delete all associated branching rules. This action cannot be undone.`}
                      onConfirm={() => handleRemoveAnswerLevelBranching(group.id)}
                    />
                  </div>
                ))}
              </div>

              {/* Right panel - Branching details */}
              <div className={styles.rightPanel}>
                {selectedBranching ? (
                  <AnswerLevelRuleGroupEditor
                    group={selectedBranching}
                    allQuestions={allQuestions}
                    currentQuestion={question}
                    onUpdate={(updated) => handleUpdateAnswerLevelGroup(selectedBranching.id, updated)}
                    onAddFromExisting={() => handleOpenPickerForBranching(selectedBranching.id)}
                    questionType={question.type}
                  />
                ) : (
                  <div className={cn(styles.emptyState, styles.emptyStateTall)}>
                    <Text size={200}>Select a branching to view details</Text>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Text size={200}>No conditional branching configured</Text>
            </div>
          )}
        </div>

        <AnswerSetPickerDialog
          open={showAnswerSetPicker}
          onOpenChange={(open) => {
            setShowAnswerSetPicker(open);
            if (!open) {
              setPickerTargetAnswerSetId(null);
              setPickerTargetBranchingId(null);
            }
          }}
          onSelect={handleSelectFromExisting}
        />
      </div>
    </Card>
  );
};

export default QuestionEditor;
