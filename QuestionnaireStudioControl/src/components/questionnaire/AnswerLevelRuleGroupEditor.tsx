import * as React from 'react';
import { useState } from "react";
import {
  Button,
  Input,
  Label,
  Checkbox,
  Textarea,
  Switch,
  Dropdown,
  Option,
  Field,
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  makeStyles,
  tokens,
  Text,
} from "@fluentui/react-components";
import {
  Add24Regular,
  ChevronDown24Regular,
  ChevronUp24Regular,
  Delete24Regular,
  Library24Regular,
  Flash24Regular,
  ArrowUpload24Regular,
} from "@fluentui/react-icons";
import { AnswerLevelRuleGroup, AnswerLevelRule, Question, AnswerSet, Answer, AnswerLevelOperator, QuestionType } from "../../types/questionnaire";
import ActionRecordEditor from "./ActionRecordEditor";
import DynamicRuleValueInput from "./DynamicRuleValueInput";

const useStyles = makeStyles({
  container: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  header: {
    display: "flex",
    alignItems: "center",
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  matchTypeCell: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    minWidth: "80px",
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  columnsHeader: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
  },
  actionsCell: {
    width: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.spacingHorizontalS,
  },
  ruleRow: {
    display: "flex",
    alignItems: "stretch",
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  connectorCell: {
    width: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  treeLine: {
    position: "absolute",
    left: "16px",
    width: "1px",
    backgroundColor: tokens.colorNeutralStroke1,
    top: 0,
    bottom: 0,
  },
  treeConnector: {
    position: "absolute",
    left: "16px",
    width: "16px",
    height: "1px",
    backgroundColor: tokens.colorNeutralStroke1,
    top: "50%",
  },
  ruleColumns: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalS}`,
  },
  nestedGroup: {
    flex: 1,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalS}`,
  },
  addRow: {
    display: "flex",
    alignItems: "center",
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  addButton: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalS}`,
  },
  inlineAnswerSet: {
    border: `1px solid ${tokens.colorBrandStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingHorizontalL,
    backgroundColor: tokens.colorBrandBackground2,
    marginTop: tokens.spacingVerticalM,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: tokens.spacingHorizontalM,
  },
  flexRow: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  flexBetween: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  answerRow: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  mt3: {
    marginTop: tokens.spacingVerticalM,
  },
  mt4: {
    marginTop: tokens.spacingVerticalL,
  },
  mb3: {
    marginBottom: tokens.spacingVerticalM,
  },
  spaceY2: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  spaceY3: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
  },
  flexGrow: {
    flex: 1,
  },
  selectNative: {
    height: "28px",
    padding: `0 ${tokens.spacingHorizontalS}`,
    fontSize: tokens.fontSizeBase200,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: "pointer",
  },
  uploadZone: {
    border: `2px dashed ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingHorizontalM,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: tokens.spacingVerticalXS,
    cursor: "pointer",
  },
  uploadedFile: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorBrandBackground2,
    border: `1px solid ${tokens.colorBrandStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
  },
  fileIcon: {
    height: "32px",
    width: "32px",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

interface AnswerLevelRuleGroupEditorProps {
  group: AnswerLevelRuleGroup;
  allQuestions: Question[];
  currentQuestion: Question;
  onUpdate: (updated: AnswerLevelRuleGroup) => void;
  isRoot?: boolean;
  onDelete?: () => void;
  onAddFromExisting?: () => void;
  questionType?: QuestionType;
}

interface InlineAnswerSetEditorProps {
  answerSet: AnswerSet;
  onUpdate: (updated: AnswerSet) => void;
  onAddFromExisting?: () => void;
  questionType?: QuestionType;
}

const InlineAnswerSetEditor = ({ answerSet, onUpdate, onAddFromExisting, questionType = 'Choice' }: InlineAnswerSetEditorProps) => {
  const styles = useStyles();
  
  const isSimpleType = ['Text', 'TextArea', 'Number', 'Decimal', 'Date', 'Rating', 'Boolean', 'Document', 'DownloadableDocument'].includes(questionType);
  const isChoiceType = ['Choice', 'Dropdown', 'MultiSelect', 'RadioButton'].includes(questionType);

  const addAnswer = () => {
    const newAnswer: Answer = {
      id: `ans-${Date.now()}`,
      label: '',
      value: '',
      active: false
    };
    onUpdate({ ...answerSet, answers: [...answerSet.answers, newAnswer] });
  };

  const updateAnswer = (answerId: string, updated: Partial<Answer>) => {
    if (updated.active === true && (questionType === 'Choice' || questionType === 'Dropdown')) {
      onUpdate({
        ...answerSet,
        answers: answerSet.answers.map(a => 
          a.id === answerId 
            ? { ...a, ...updated } 
            : { ...a, active: false }
        )
      });
    } else {
      onUpdate({
        ...answerSet,
        answers: answerSet.answers.map(a => a.id === answerId ? { ...a, ...updated } : a)
      });
    }
  };

  const removeAnswer = (answerId: string) => {
    onUpdate({
      ...answerSet,
      answers: answerSet.answers.filter(a => a.id !== answerId)
    });
  };

  const simpleAnswer = answerSet.answers[0] || { id: `ans-${Date.now()}`, label: '', value: '', active: true };

  const updateSimpleAnswer = (value: string, label: string) => {
    if (answerSet.answers.length === 0) {
      onUpdate({ 
        ...answerSet, 
        answers: [{ id: `ans-${Date.now()}`, label, value, active: true }] 
      });
    } else {
      onUpdate({
        ...answerSet,
        answers: [{ ...answerSet.answers[0], value, label }]
      });
    }
  };

  const getSimpleTypeLabel = () => {
    switch (questionType) {
      case 'Text': return 'Default Text Answer';
      case 'TextArea': return 'Default Text Area Content';
      case 'Number': return 'Default Number Value';
      case 'Decimal': return 'Default Decimal Value';
      case 'Date': return 'Default Date Value';
      case 'Rating': return 'Default Rating Value';
      case 'Boolean': return 'Default Boolean Value';
      case 'Document': return 'File Attachment Configuration';
      case 'DownloadableDocument': return 'Downloadable Document Configuration';
      default: return 'Default Value';
    }
  };

  if (isSimpleType) {
    return (
      <div className={styles.inlineAnswerSet}>
        <div className={styles.grid2}>
          <Field label={<Label required size="small">Set Name</Label>}>
            <Input
              placeholder="Answer Set Name"
              value={answerSet.name}
              onChange={(_, data) => onUpdate({ ...answerSet, name: data.value })}
              size="small"
            />
          </Field>
          <Field label={<Label required size="small">Tag</Label>}>
            <Input
              placeholder="Tag"
              value={answerSet.tag}
              onChange={(_, data) => onUpdate({ ...answerSet, tag: data.value })}
              size="small"
            />
          </Field>
        </div>

        <div className={`${styles.flexRow} ${styles.mt3} ${styles.mb3}`}>
          <Checkbox
            checked={answerSet.isDefault}
            onChange={(_, data) => onUpdate({ ...answerSet, isDefault: !!data.checked })}
            label="Is Default"
          />
        </div>

        <div className={styles.spaceY3}>
          <Text weight="semibold" size={300}>{getSimpleTypeLabel()}</Text>
          
          {questionType === 'Text' && (
            <Textarea
              placeholder="Enter default text response (optional)"
              value={simpleAnswer.value}
              onChange={(_, data) => updateSimpleAnswer(data.value, 'Text Response')}
              resize="vertical"
            />
          )}

          {questionType === 'TextArea' && (
            <div className={styles.spaceY3}>
              <Textarea
                placeholder="Enter default text area content (optional)"
                value={simpleAnswer.value}
                onChange={(_, data) => updateSimpleAnswer(data.value, 'Text Area Response')}
                resize="vertical"
                style={{ minHeight: '120px' }}
              />
              <div className={styles.flexRow}>
                <Text size={200}>Format</Text>
                <select
                  value={answerSet.textAreaFormat || 'plain'}
                  onChange={(e) => onUpdate({ ...answerSet, textAreaFormat: e.target.value as 'plain' | 'rich' })}
                  className={styles.selectNative}
                >
                  <option value="plain">Plain Text</option>
                  <option value="rich">Rich Text</option>
                </select>
              </div>
            </div>
          )}

          {questionType === 'Number' && (
            <div className={styles.spaceY3}>
              <Input
                type="number"
                placeholder="Enter default number (optional)"
                value={simpleAnswer.value}
                onChange={(_, data) => updateSimpleAnswer(data.value, 'Number Response')}
                size="small"
              />
              <Switch
                checked={answerSet.numberRestriction ?? false}
                onChange={(_, data) => onUpdate({ ...answerSet, numberRestriction: data.checked })}
                label="Restriction"
              />
              {answerSet.numberRestriction && (
                <div className={styles.grid2}>
                  <Field label={<Text size={200}>Min Value</Text>}>
                    <Input
                      type="number"
                      placeholder="No min"
                      value={answerSet.minValue?.toString() ?? ''}
                      onChange={(_, data) => onUpdate({ ...answerSet, minValue: data.value ? Number(data.value) : undefined })}
                      size="small"
                    />
                  </Field>
                  <Field label={<Text size={200}>Max Value</Text>}>
                    <Input
                      type="number"
                      placeholder="No max"
                      value={answerSet.maxValue?.toString() ?? ''}
                      onChange={(_, data) => onUpdate({ ...answerSet, maxValue: data.value ? Number(data.value) : undefined })}
                      size="small"
                    />
                  </Field>
                </div>
              )}
            </div>
          )}

          {questionType === 'Decimal' && (
            <div className={styles.spaceY3}>
              <Input
                type="number"
                step={0.01}
                placeholder="Enter default decimal (optional)"
                value={simpleAnswer.value}
                onChange={(_, data) => updateSimpleAnswer(data.value, 'Decimal Response')}
                size="small"
              />
              <Switch
                checked={answerSet.numberRestriction ?? false}
                onChange={(_, data) => onUpdate({ ...answerSet, numberRestriction: data.checked })}
                label="Restriction"
              />
              {answerSet.numberRestriction && (
                <div className={styles.grid2}>
                  <Field label={<Text size={200}>Min Value</Text>}>
                    <Input
                      type="number"
                      step={0.01}
                      placeholder="No min"
                      value={answerSet.minValue?.toString() ?? ''}
                      onChange={(_, data) => onUpdate({ ...answerSet, minValue: data.value ? Number(data.value) : undefined })}
                      size="small"
                    />
                  </Field>
                  <Field label={<Text size={200}>Max Value</Text>}>
                    <Input
                      type="number"
                      step={0.01}
                      placeholder="No max"
                      value={answerSet.maxValue?.toString() ?? ''}
                      onChange={(_, data) => onUpdate({ ...answerSet, maxValue: data.value ? Number(data.value) : undefined })}
                      size="small"
                    />
                  </Field>
                </div>
              )}
            </div>
          )}

          {questionType === 'Date' && (
            <div className={styles.spaceY3}>
              <div className={answerSet.includeTime ? styles.grid2 : undefined}>
                <Input
                  type="date"
                  value={simpleAnswer.value?.split('T')[0] || simpleAnswer.value || ''}
                  onChange={(_, data) => {
                    const dateValue = data.value;
                    const timeValue = simpleAnswer.value?.split('T')[1] || '';
                    const newValue = answerSet.includeTime && timeValue 
                      ? `${dateValue}T${timeValue}` 
                      : dateValue;
                    updateSimpleAnswer(newValue, 'Date Response');
                  }}
                  size="small"
                />
                {answerSet.includeTime && (
                  <Input
                    type="time"
                    value={simpleAnswer.value?.split('T')[1] || ''}
                    onChange={(_, data) => {
                      const timeValue = data.value;
                      const dateValue = simpleAnswer.value?.split('T')[0] || simpleAnswer.value || '';
                      const newValue = dateValue ? `${dateValue}T${timeValue}` : timeValue;
                      updateSimpleAnswer(newValue, 'Date Response');
                    }}
                    size="small"
                  />
                )}
              </div>
              <div className={styles.flexRow} style={{ gap: tokens.spacingHorizontalL }}>
                <Switch
                  checked={answerSet.dateRestriction ?? false}
                  onChange={(_, data) => onUpdate({ ...answerSet, dateRestriction: data.checked })}
                  label="Date Restriction"
                />
                <Switch
                  checked={answerSet.includeTime ?? false}
                  onChange={(_, data) => onUpdate({ ...answerSet, includeTime: data.checked })}
                  label="Time"
                />
              </div>
              {answerSet.dateRestriction && (
                <div className={styles.grid2}>
                  <Field label={<Text size={200}>Min Date</Text>}>
                    <Input
                      type="date"
                      value={answerSet.minDate ?? ''}
                      onChange={(_, data) => onUpdate({ ...answerSet, minDate: data.value })}
                      size="small"
                    />
                  </Field>
                  <Field label={<Text size={200}>Max Date</Text>}>
                    <Input
                      type="date"
                      value={answerSet.maxDate ?? ''}
                      onChange={(_, data) => onUpdate({ ...answerSet, maxDate: data.value })}
                      size="small"
                    />
                  </Field>
                </div>
              )}
            </div>
          )}

          {questionType === 'Rating' && (
            <div className={styles.spaceY3}>
              <Input
                type="number"
                placeholder="Enter default rating (optional)"
                min={answerSet.ratingMinValue ?? 1}
                max={answerSet.ratingMaxValue ?? 5}
                value={simpleAnswer.value}
                onChange={(_, data) => updateSimpleAnswer(data.value, 'Rating Response')}
                size="small"
              />
              <div className={styles.flexRow}>
                <Text size={200}>Display Style</Text>
                <select
                  value={answerSet.ratingDisplayStyle ?? 'numbers'}
                  onChange={(e) => onUpdate({ ...answerSet, ratingDisplayStyle: e.target.value as 'numbers' | 'stars' | 'smileys' | 'hearts' | 'thumbs' })}
                  className={styles.selectNative}
                >
                  <option value="numbers">Numbers (1, 2, 3...)</option>
                  <option value="stars">Stars (★)</option>
                  <option value="smileys">Smileys (😊)</option>
                  <option value="hearts">Hearts (❤️)</option>
                  <option value="thumbs">Thumbs (👍)</option>
                </select>
              </div>
              <div className={styles.grid2}>
                <Field label={<Text size={200}>Min Value</Text>}>
                  <Input
                    type="number"
                    min={0}
                    value={(answerSet.ratingMinValue ?? 1).toString()}
                    onChange={(_, data) => onUpdate({ ...answerSet, ratingMinValue: Number(data.value) || 1 })}
                    size="small"
                  />
                </Field>
                <Field label={<Text size={200}>Max Value</Text>}>
                  <Input
                    type="number"
                    min={1}
                    value={(answerSet.ratingMaxValue ?? 5).toString()}
                    onChange={(_, data) => onUpdate({ ...answerSet, ratingMaxValue: Number(data.value) || 5 })}
                    size="small"
                  />
                </Field>
                <Field label={<Text size={200}>Min Label (optional)</Text>}>
                  <Input
                    placeholder="e.g., Poor"
                    value={answerSet.ratingMinLabel ?? ''}
                    onChange={(_, data) => onUpdate({ ...answerSet, ratingMinLabel: data.value || undefined })}
                    size="small"
                  />
                </Field>
                <Field label={<Text size={200}>Max Label (optional)</Text>}>
                  <Input
                    placeholder="e.g., Excellent"
                    value={answerSet.ratingMaxLabel ?? ''}
                    onChange={(_, data) => onUpdate({ ...answerSet, ratingMaxLabel: data.value || undefined })}
                    size="small"
                  />
                </Field>
              </div>
            </div>
          )}

          {questionType === 'Boolean' && (
            <Switch
              checked={simpleAnswer.value === 'true'}
              onChange={(_, data) => updateSimpleAnswer(data.checked ? 'true' : 'false', data.checked ? 'Yes' : 'No')}
              label={simpleAnswer.value === 'true' ? 'Yes (True)' : 'No (False)'}
            />
          )}

          {questionType === 'Document' && (
            <div className={styles.spaceY3}>
              <div className={styles.flexRow}>
                <ArrowUpload24Regular />
                <Text size={200}>File Attachment Configuration</Text>
              </div>
              <div className={styles.grid2}>
                {[
                  { value: 'pdf', label: 'PDF' },
                  { value: 'doc', label: 'Word' },
                  { value: 'xls', label: 'Excel' },
                  { value: 'ppt', label: 'PowerPoint' },
                  { value: 'txt', label: 'Text' },
                  { value: 'image', label: 'Images' },
                ].map((fileType) => (
                  <Checkbox
                    key={fileType.value}
                    checked={(answerSet.allowedFileTypes ?? ['pdf', 'doc', 'xls', 'ppt', 'txt', 'image']).includes(fileType.value)}
                    onChange={(_, data) => {
                      const current = answerSet.allowedFileTypes ?? ['pdf', 'doc', 'xls', 'ppt', 'txt', 'image'];
                      const updated = data.checked 
                        ? [...current, fileType.value]
                        : current.filter(t => t !== fileType.value);
                      onUpdate({ ...answerSet, allowedFileTypes: updated });
                    }}
                    label={fileType.label}
                  />
                ))}
              </div>
              <div className={styles.grid2}>
                <Field label={<Text size={200}>Max File Size (MB)</Text>}>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    placeholder="10"
                    value={(answerSet.maxFileSize ?? 10).toString()}
                    onChange={(_, data) => onUpdate({ ...answerSet, maxFileSize: Number(data.value) || 10 })}
                    size="small"
                  />
                </Field>
                <Field label={<Text size={200}>Number of Files</Text>}>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    placeholder="3"
                    value={(answerSet.maxFiles ?? 3).toString()}
                    onChange={(_, data) => onUpdate({ ...answerSet, maxFiles: Number(data.value) || 3 })}
                    size="small"
                  />
                </Field>
              </div>
            </div>
          )}

          {questionType === 'DownloadableDocument' && (
            <div className={styles.spaceY3}>
              <div className={styles.flexRow}>
                <ArrowUpload24Regular />
                <Text size={200}>Downloadable Document Configuration</Text>
              </div>
              <Text size={200}>Upload a document for users to download.</Text>
              <Field label={<Text size={200}>Document Name</Text>}>
                <Input
                  placeholder="Enter document display name"
                  value={answerSet.downloadableFileName ?? ''}
                  onChange={(_, data) => onUpdate({ ...answerSet, downloadableFileName: data.value })}
                  size="small"
                />
              </Field>
              <Field label={<Text size={200}>Attach Document</Text>}>
                {!answerSet.downloadableFileUrl ? (
                  <label className={styles.uploadZone}>
                    <ArrowUpload24Regular />
                    <Text size={200}>Click to upload</Text>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          onUpdate({ 
                            ...answerSet, 
                            downloadableFileUrl: url,
                            downloadableFileName: answerSet.downloadableFileName || file.name,
                            downloadableFileType: file.type
                          });
                        }
                      }}
                    />
                  </label>
                ) : (
                  <div className={styles.uploadedFile}>
                    <div className={styles.fileIcon}>
                      <ArrowUpload24Regular />
                    </div>
                    <div className={styles.flexGrow}>
                      <Text weight="semibold" size={200} truncate block>
                        {answerSet.downloadableFileName || 'Uploaded document'}
                      </Text>
                      <Text size={100}>
                        {answerSet.downloadableFileType || 'Document attached'}
                      </Text>
                    </div>
                    <Button
                      appearance="outline"
                      size="small"
                      onClick={() => onUpdate({ 
                        ...answerSet, 
                        downloadableFileUrl: undefined,
                        downloadableFileName: undefined,
                        downloadableFileType: undefined
                      })}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </Field>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Choice types UI
  return (
    <div className={styles.inlineAnswerSet}>
      <div className={`${styles.flexBetween} ${styles.mb3}`}>
        <Text weight="semibold" size={300}>
          Answer Set for this Rule {questionType === 'MultiSelect' && <Text size={200}>(Multi-Select)</Text>}
        </Text>
        {onAddFromExisting && (
          <Button 
            appearance="outline" 
            size="small"
            icon={<Library24Regular />}
            onClick={onAddFromExisting}
          >
            Add from Existing
          </Button>
        )}
      </div>

      <div className={styles.grid2}>
        <Field label={<Label required size="small">Set Name</Label>}>
          <Input
            placeholder="Answer Set Name"
            value={answerSet.name}
            onChange={(_, data) => onUpdate({ ...answerSet, name: data.value })}
            size="small"
          />
        </Field>
        <Field label={<Label required size="small">Tag</Label>}>
          <Input
            placeholder="Tag"
            value={answerSet.tag}
            onChange={(_, data) => onUpdate({ ...answerSet, tag: data.value })}
            size="small"
          />
        </Field>
      </div>

      <div className={`${styles.flexRow} ${styles.mt3}`}>
        <Checkbox
          checked={answerSet.isDefault}
          onChange={(_, data) => onUpdate({ ...answerSet, isDefault: !!data.checked })}
          label="Is Default"
        />
      </div>

      <div className={styles.mt4}>
        <div className={`${styles.flexBetween} ${styles.mb3}`}>
          <Text size={200} weight="medium">Answers</Text>
          <Button appearance="subtle" size="small" icon={<Add24Regular />} onClick={addAnswer}>
            Add Answer
          </Button>
        </div>

        <div className={styles.spaceY2}>
          {answerSet.answers.length === 0 && (
            <Text className={styles.errorText}>At least one answer is required</Text>
          )}
          {answerSet.answers.map(ans => (
            <div key={ans.id} className={styles.answerRow}>
              <Input
                placeholder="Label"
                value={ans.label}
                onChange={(_, data) => updateAnswer(ans.id, { label: data.value })}
                className={styles.flexGrow}
                size="small"
              />
              <Input
                placeholder="Value"
                value={ans.value}
                onChange={(_, data) => updateAnswer(ans.id, { value: data.value })}
                className={styles.flexGrow}
                size="small"
              />
              <Checkbox
                checked={ans.active}
                onChange={(_, data) => updateAnswer(ans.id, { active: !!data.checked })}
                label="Active"
              />
              {ans.actionRecord && (
                <Flash24Regular primaryFill={tokens.colorPaletteYellowForeground1} />
              )}
              <ActionRecordEditor
                actionRecord={ans.actionRecord}
                onUpdate={(actionRecord) => updateAnswer(ans.id, { actionRecord })}
              />
              <Button 
                appearance="subtle" 
                size="small"
                icon={<Delete24Regular />}
                onClick={() => removeAnswer(ans.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const OPERATORS: { value: AnswerLevelOperator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Not Contains' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'ends_with', label: 'Ends With' },
];

const AnswerLevelRuleGroupEditor = ({ group, allQuestions, currentQuestion, onUpdate, isRoot = true, onDelete, onAddFromExisting, questionType = 'Choice' }: AnswerLevelRuleGroupEditorProps) => {
  const styles = useStyles();
  const [answerSetExpanded, setAnswerSetExpanded] = useState<string[]>(group.inlineAnswerSet ? ["answerSet"] : []);
  const isTextType = questionType === 'Text';

  const previousQuestions = allQuestions.filter(q => q.order < currentQuestion.order);

  const updateGroup = (partial: Partial<AnswerLevelRuleGroup>) => {
    onUpdate({ ...group, ...partial });
  };

  const updateChild = (index: number, updatedChild: AnswerLevelRuleGroup | AnswerLevelRule) => {
    const newChildren = [...group.children];
    newChildren[index] = updatedChild;
    updateGroup({ children: newChildren });
  };

  const deleteChild = (index: number) => {
    const newChildren = group.children.filter((_, i) => i !== index);
    updateGroup({ children: newChildren });
  };

  const addGroup = () => {
    const newGroup: AnswerLevelRuleGroup = {
      type: 'group',
      id: `ag-${Date.now()}`,
      matchType: 'AND',
      children: []
    };
    updateGroup({ children: [...group.children, newGroup] });
  };

  const addRule = () => {
    const newRule: AnswerLevelRule = {
      type: 'answerRule',
      id: `ar-${Date.now()}`,
      previousQuestionId: '',
      previousAnswerSetId: '',
      operator: 'equals',
      previousAnswerId: '',
      selectedAnswerSetId: ''
    };
    updateGroup({ children: [...group.children, newRule] });
  };

  const getAnswerSetsForQuestion = (questionId: string) => {
    const question = allQuestions.find(q => q.id === questionId);
    if (!question) return [];
    
    const allAnswerSets = [...question.answerSets];
    question.answerLevelRuleGroups?.forEach(ruleGroup => {
      if (ruleGroup.inlineAnswerSet) {
        allAnswerSets.push(ruleGroup.inlineAnswerSet);
      }
    });
    
    return allAnswerSets;
  };

  const getAnswersForAnswerSet = (questionId: string, answerSetId: string) => {
    const question = allQuestions.find(q => q.id === questionId);
    if (!question || !answerSetId) return [];
    
    let answerSet = question.answerSets.find(as => as.id === answerSetId);
    
    if (!answerSet) {
      for (const ruleGroup of question.answerLevelRuleGroups || []) {
        if (ruleGroup.inlineAnswerSet?.id === answerSetId) {
          answerSet = ruleGroup.inlineAnswerSet;
          break;
        }
      }
    }
    
    return answerSet?.answers || [];
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.matchTypeCell}>
          <Dropdown
            value={group.matchType}
            selectedOptions={[group.matchType]}
            onOptionSelect={(_, data) => updateGroup({ matchType: data.optionValue as 'AND' | 'OR' })}
            size="small"
            style={{ minWidth: '64px' }}
          >
            <Option value="AND">AND</Option>
            <Option value="OR">OR</Option>
          </Dropdown>
        </div>
        <div className={styles.columnsHeader}>
          <Text size={200} weight="medium">Select Question</Text>
          <Text size={200} weight="medium">Answer Set</Text>
          <Text size={200} weight="medium">Operator</Text>
          <Text size={200} weight="medium">Answer</Text>
        </div>
        <div className={styles.actionsCell}>
          {!isRoot && onDelete && (
            <Button 
              appearance="subtle" 
              size="small"
              icon={<Delete24Regular />}
              onClick={onDelete}
            />
          )}
        </div>
      </div>

      {/* Rules */}
      <div className="relative">
        {group.children.map((child, index) => (
          <div key={child.id} className={styles.ruleRow}>
            <div className={styles.connectorCell}>
              <div className={styles.treeLine} />
              <div className={styles.treeConnector} />
            </div>

            {child.type === 'group' ? (
              <div className={styles.nestedGroup}>
                <AnswerLevelRuleGroupEditor
                  group={child}
                  allQuestions={allQuestions}
                  currentQuestion={currentQuestion}
                  onUpdate={(updated) => updateChild(index, updated)}
                  isRoot={false}
                  onDelete={() => deleteChild(index)}
                />
              </div>
            ) : (
              <>
                <div className={styles.ruleColumns}>
                  <Dropdown
                    placeholder="Select question"
                    value={previousQuestions.find(q => q.id === child.previousQuestionId)?.text || ''}
                    selectedOptions={child.previousQuestionId ? [child.previousQuestionId] : []}
                    onOptionSelect={(_, data) => {
                      updateChild(index, { ...child, previousQuestionId: data.optionValue as string, previousAnswerSetId: '', previousAnswerId: '' });
                    }}
                    size="small"
                  >
                    {previousQuestions.map(q => (
                      <Option key={q.id} value={q.id}>
                        {q.text || 'Untitled Question'}
                      </Option>
                    ))}
                  </Dropdown>

                  <Dropdown
                    placeholder="Select answer set"
                    value={getAnswerSetsForQuestion(child.previousQuestionId).find(as => as.id === child.previousAnswerSetId)?.name || ''}
                    selectedOptions={child.previousAnswerSetId ? [child.previousAnswerSetId] : []}
                    onOptionSelect={(_, data) => {
                      updateChild(index, { ...child, previousAnswerSetId: data.optionValue as string, previousAnswerId: '' });
                    }}
                    disabled={!child.previousQuestionId}
                    size="small"
                  >
                    {getAnswerSetsForQuestion(child.previousQuestionId).map(as => (
                      <Option key={as.id} value={as.id}>
                        {as.name || 'Untitled Answer Set'}
                      </Option>
                    ))}
                  </Dropdown>

                  <Dropdown
                    value={OPERATORS.find(op => op.value === (child.operator || 'equals'))?.label || 'Equals'}
                    selectedOptions={[child.operator || 'equals']}
                    onOptionSelect={(_, data) => {
                      updateChild(index, { ...child, operator: data.optionValue as AnswerLevelOperator });
                    }}
                    size="small"
                  >
                    {OPERATORS.map(op => (
                      <Option key={op.value} value={op.value}>
                        {op.label}
                      </Option>
                    ))}
                  </Dropdown>

                  {(() => {
                    const sourceQuestion = allQuestions.find(q => q.id === child.previousQuestionId);
                    const qType = sourceQuestion?.type || 'Choice';
                    const answers = getAnswersForAnswerSet(child.previousQuestionId, child.previousAnswerSetId || '');
                    
                    return (
                      <DynamicRuleValueInput
                        questionType={qType}
                        answers={answers}
                        value={child.previousAnswerId}
                        onChange={(value) => {
                          updateChild(index, { ...child, previousAnswerId: value });
                        }}
                        disabled={!child.previousAnswerSetId}
                      />
                    );
                  })()}
                </div>

                <div className={styles.actionsCell}>
                  <Button 
                    appearance="subtle" 
                    size="small"
                    icon={<Delete24Regular />}
                    onClick={() => deleteChild(index)}
                  />
                </div>
              </>
            )}
          </div>
        ))}

        {/* Add Button */}
        <div className={styles.addRow}>
          <div className={styles.connectorCell}>
            {group.children.length > 0 && (
              <>
                <div className={styles.treeLine} style={{ bottom: '50%' }} />
                <div className={styles.treeConnector} />
              </>
            )}
          </div>
          <div className={styles.addButton}>
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <Button appearance="outline" size="small" icon={<Add24Regular />}>
                  Add
                  <ChevronDown24Regular style={{ marginLeft: tokens.spacingHorizontalXS }} />
                </Button>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem onClick={addRule}>Add Rule</MenuItem>
                  <MenuItem onClick={addGroup}>Add Group</MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </div>
        </div>
      </div>

      {/* Inline Answer Set */}
      {isRoot && group.inlineAnswerSet && (
        <div style={{ borderTop: `1px solid ${tokens.colorNeutralStroke1}` }}>
          <Accordion
            openItems={answerSetExpanded}
            onToggle={(_, data) => setAnswerSetExpanded(data.openItems as string[])}
            collapsible
          >
            <AccordionItem value="answerSet">
              <AccordionHeader size="small">
                <Text size={200}>
                  {answerSetExpanded.includes("answerSet") ? 'Hide' : 'Show'} {isTextType ? 'Default Text Answer' : 'Answer Set'}
                </Text>
              </AccordionHeader>
              <AccordionPanel>
                <InlineAnswerSetEditor
                  answerSet={group.inlineAnswerSet}
                  onUpdate={(updated) => {
                    updateGroup({ inlineAnswerSet: updated });
                  }}
                  onAddFromExisting={onAddFromExisting}
                  questionType={questionType}
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default AnswerLevelRuleGroupEditor;
