import * as React from 'react';
import { useState } from "react";
import {
  Button,
  Input,
  Checkbox,
  Label,
  Textarea,
  Switch,
  Badge,
  Field,
  Dropdown,
  Option,
  Radio,
  RadioGroup,
  makeStyles,
  tokens,
  Text,
  Divider,
} from "@fluentui/react-components";
import {
  Add24Regular,
  Library24Regular,
  Flash24Regular,
  Database24Regular,
  Table24Regular,
  ArrowSort24Regular,
  Filter24Regular,
  Edit24Regular,
  ArrowUpload24Regular,
  Delete24Regular,
} from "@fluentui/react-icons";
import { AnswerSet, Answer, QuestionType, TextValidationType, TextAreaFormat } from "../../types/questionnaire";
import ActionRecordEditor from "./ActionRecordEditor";
import DynamicValuesPanel, { DynamicValueConfig, DynamicValueFilterGroup } from "./DynamicValuesPanel";
import RichTextEditor from "../ui/rich-text-editor";

const useStyles = makeStyles({
  container: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingHorizontalL,
    backgroundColor: tokens.colorNeutralBackground3,
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
  flexRowLarge: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalL,
  },
  flexBetween: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
  mb4: {
    marginBottom: tokens.spacingVerticalL,
  },
  spaceY3: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  spaceY2: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
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
  radioAnswerRow: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  flexGrow: {
    flex: 1,
  },
  dynamicCard: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
    overflow: "hidden",
  },
  dynamicCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  dynamicCardContent: {
    padding: tokens.spacingHorizontalL,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  uploadZone: {
    border: `2px dashed ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingHorizontalL,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: tokens.spacingVerticalS,
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  uploadedFile: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorBrandBackground2,
    border: `1px solid ${tokens.colorBrandStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
  },
  fileIcon: {
    height: "40px",
    width: "40px",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  smallInput: {
    minWidth: 0,
  },
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
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
});

interface AnswerSetEditorProps {
  answerSet: AnswerSet;
  onUpdate: (updated: AnswerSet) => void;
  onAddFromExisting?: () => void;
  questionType?: QuestionType;
  textValidationType?: TextValidationType;
  onTextValidationChange?: (validationType: TextValidationType) => void;
  textAreaFormat?: TextAreaFormat;
  onTextAreaFormatChange?: (format: TextAreaFormat) => void;
}

// Validation patterns
const TEXT_VALIDATION_PATTERNS: Record<TextValidationType, { pattern: RegExp; example: string }> = {
  none: { pattern: /.*/, example: '' },
  cost_center: { pattern: /^\d{5}-\d{4}$/, example: '00000-0000' },
  email: { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, example: 'someone@domain.com' },
  ip_address: { pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, example: '127.0.0.1' },
  phone: { pattern: /^\d{1}-\d{3}-\d{3}-\d{4}$/, example: '0-000-000-0000' },
  url: { pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, example: 'http://domain.com' },
};

const AnswerSetEditor = ({ answerSet, onUpdate, onAddFromExisting, questionType = 'Choice', textValidationType = 'none', onTextValidationChange, textAreaFormat = 'plain', onTextAreaFormatChange }: AnswerSetEditorProps) => {
  const styles = useStyles();
  const [showDynamicPanel, setShowDynamicPanel] = useState(false);
  
  const dynamicValues = answerSet.dynamicValues ?? false;
  const dynamicConfig = answerSet.dynamicConfig;
  
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
      case 'TextArea': return textAreaFormat === 'rich' ? 'Default Rich Text Content' : 'Default Text Area Content';
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

  const getSimpleTypePlaceholder = () => {
    switch (questionType) {
      case 'Text': return 'Enter default text response (optional)';
      case 'TextArea': return textAreaFormat === 'rich' ? 'Enter default rich text content (optional)' : 'Enter default text area content (optional)';
      case 'Number': return 'Enter default number (optional)';
      case 'Decimal': return 'Enter default decimal (optional)';
      case 'Date': return 'Select default date (optional)';
      case 'Rating': return 'Enter default rating (optional)';
      default: return 'Enter default value (optional)';
    }
  };

  const countConditions = (group: DynamicValueFilterGroup): number => {
    return group.children.reduce((count, child) => {
      if (child.type === 'filter') return count + 1;
      return count + countConditions(child);
    }, 0);
  };

  const getTextValidationError = (): string | null => {
    if (questionType !== 'Text' || textValidationType === 'none' || !simpleAnswer.value) {
      return null;
    }
    const validation = TEXT_VALIDATION_PATTERNS[textValidationType];
    if (!validation.pattern.test(simpleAnswer.value)) {
      return `Invalid format. Expected: ${validation.example}`;
    }
    return null;
  };

  const textValidationError = getTextValidationError();

  // Simple types UI
  if (isSimpleType) {
    return (
      <div className={styles.container}>
        {/* Name and Tag */}
        <div className={styles.grid2}>
          <Field label={<Label required>Set Name</Label>}>
            <Input
              placeholder="Answer Set Name"
              value={answerSet.name}
              onChange={(e, data) => onUpdate({ ...answerSet, name: data.value })}
            />
          </Field>
          <Field label={<Label required>Tag</Label>}>
            <Input
              placeholder="Tag"
              value={answerSet.tag}
              onChange={(e, data) => onUpdate({ ...answerSet, tag: data.value })}
            />
          </Field>
        </div>

        <div className={`${styles.flexRow} ${styles.mt3} ${styles.mb4}`}>
          <Checkbox
            id={`default-simple-${answerSet.id}`}
            checked={answerSet.isDefault}
            onChange={(_, data) => onUpdate({ ...answerSet, isDefault: !!data.checked })}
            label="Is Default"
          />
        </div>

        {/* Type-specific content */}
        <div className={styles.spaceY2}>
          {questionType === 'Text' && (
            <div className={styles.spaceY3}>
              <Label weight="semibold">{getSimpleTypeLabel()}</Label>
              <Textarea
                placeholder={textValidationType !== 'none' 
                  ? `Format: ${TEXT_VALIDATION_PATTERNS[textValidationType].example}` 
                  : getSimpleTypePlaceholder()}
                value={simpleAnswer.value}
                onChange={(e, data) => updateSimpleAnswer(data.value, 'Text Response')}
                resize="vertical"
              />
              {textValidationError && (
                <Text className={styles.errorText}>{textValidationError}</Text>
              )}
              <div className={styles.flexRow}>
                <Text size={200}>Regular Expression</Text>
                <select
                  value={textValidationType || 'none'}
                  onChange={(e) => onTextValidationChange?.(e.target.value as TextValidationType)}
                  className={styles.selectNative}
                >
                  <option value="none">None</option>
                  <option value="cost_center">Cost Center (00000-0000)</option>
                  <option value="email">Email (someone@domain.com)</option>
                  <option value="ip_address">IP Address (127.0.0.1)</option>
                  <option value="phone">Phone (0-000-000-0000)</option>
                  <option value="url">URL (http://domain.com)</option>
                </select>
              </div>
            </div>
          )}

          {questionType === 'TextArea' && (
            <div className={styles.spaceY3}>
              <Label weight="semibold">{getSimpleTypeLabel()}</Label>
              {textAreaFormat === 'rich' ? (
                <RichTextEditor
                  value={simpleAnswer.value}
                  onChange={(value) => updateSimpleAnswer(value, 'Text Area Response')}
                  placeholder={getSimpleTypePlaceholder()}
                />
              ) : (
                <Textarea
                  placeholder={getSimpleTypePlaceholder()}
                  value={simpleAnswer.value}
                  onChange={(e, data) => updateSimpleAnswer(data.value, 'Text Area Response')}
                  resize="vertical"
                  style={{ minHeight: '120px' }}
                />
              )}
              <div className={styles.flexRow}>
                <Text size={200}>Format</Text>
                <select
                  value={textAreaFormat || 'plain'}
                  onChange={(e) => onTextAreaFormatChange?.(e.target.value as TextAreaFormat)}
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
              <Label weight="semibold">{getSimpleTypeLabel()}</Label>
              <Input
                type="number"
                placeholder={getSimpleTypePlaceholder()}
                value={simpleAnswer.value}
                onChange={(e, data) => updateSimpleAnswer(data.value, 'Number Response')}
              />
              <div className={styles.flexRow}>
                <Switch
                  checked={answerSet.numberRestriction ?? false}
                  onChange={(_, data) => onUpdate({ ...answerSet, numberRestriction: data.checked })}
                  label="Restriction"
                />
              </div>
              {answerSet.numberRestriction && (
                <div className={styles.grid2}>
                  <Field label={<Text size={200}>Min Value</Text>}>
                    <Input
                      type="number"
                      placeholder="No min"
                      value={answerSet.minValue?.toString() ?? ''}
                      onChange={(e, data) => onUpdate({ ...answerSet, minValue: data.value ? Number(data.value) : undefined })}
                    />
                  </Field>
                  <Field label={<Text size={200}>Max Value</Text>}>
                    <Input
                      type="number"
                      placeholder="No max"
                      value={answerSet.maxValue?.toString() ?? ''}
                      onChange={(e, data) => onUpdate({ ...answerSet, maxValue: data.value ? Number(data.value) : undefined })}
                    />
                  </Field>
                </div>
              )}
            </div>
          )}

          {questionType === 'Decimal' && (
            <div className={styles.spaceY3}>
              <Label weight="semibold">{getSimpleTypeLabel()}</Label>
              <Input
                type="number"
                step={0.01}
                placeholder={getSimpleTypePlaceholder()}
                value={simpleAnswer.value}
                onChange={(e, data) => updateSimpleAnswer(data.value, 'Decimal Response')}
              />
              <div className={styles.flexRow}>
                <Switch
                  checked={answerSet.numberRestriction ?? false}
                  onChange={(_, data) => onUpdate({ ...answerSet, numberRestriction: data.checked })}
                  label="Restriction"
                />
              </div>
              {answerSet.numberRestriction && (
                <div className={styles.grid2}>
                  <Field label={<Text size={200}>Min Value</Text>}>
                    <Input
                      type="number"
                      step={0.01}
                      placeholder="No min"
                      value={answerSet.minValue?.toString() ?? ''}
                      onChange={(e, data) => onUpdate({ ...answerSet, minValue: data.value ? Number(data.value) : undefined })}
                    />
                  </Field>
                  <Field label={<Text size={200}>Max Value</Text>}>
                    <Input
                      type="number"
                      step={0.01}
                      placeholder="No max"
                      value={answerSet.maxValue?.toString() ?? ''}
                      onChange={(e, data) => onUpdate({ ...answerSet, maxValue: data.value ? Number(data.value) : undefined })}
                    />
                  </Field>
                </div>
              )}
            </div>
          )}

          {questionType === 'Date' && (
            <div className={styles.spaceY3}>
              <Label weight="semibold">{getSimpleTypeLabel()}</Label>
              <div className={answerSet.includeTime ? styles.grid2 : undefined}>
                <Input
                  type="date"
                  value={simpleAnswer.value?.split('T')[0] || simpleAnswer.value || ''}
                  onChange={(e, data) => {
                    const dateValue = data.value;
                    const timeValue = simpleAnswer.value?.split('T')[1] || '';
                    const newValue = answerSet.includeTime && timeValue 
                      ? `${dateValue}T${timeValue}` 
                      : dateValue;
                    updateSimpleAnswer(newValue, 'Date Response');
                  }}
                />
                {answerSet.includeTime && (
                  <Input
                    type="time"
                    value={simpleAnswer.value?.split('T')[1] || ''}
                    onChange={(e, data) => {
                      const timeValue = data.value;
                      const dateValue = simpleAnswer.value?.split('T')[0] || simpleAnswer.value || '';
                      const newValue = dateValue ? `${dateValue}T${timeValue}` : timeValue;
                      updateSimpleAnswer(newValue, 'Date Response');
                    }}
                  />
                )}
              </div>
              <div className={styles.flexRowLarge}>
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
                      onChange={(e, data) => onUpdate({ ...answerSet, minDate: data.value })}
                    />
                  </Field>
                  <Field label={<Text size={200}>Max Date</Text>}>
                    <Input
                      type="date"
                      value={answerSet.maxDate ?? ''}
                      onChange={(e, data) => onUpdate({ ...answerSet, maxDate: data.value })}
                    />
                  </Field>
                </div>
              )}
            </div>
          )}

          {questionType === 'Rating' && (
            <div className={styles.spaceY3}>
              <Label weight="semibold">{getSimpleTypeLabel()}</Label>
              <Input
                type="number"
                placeholder={getSimpleTypePlaceholder()}
                min={answerSet.ratingMinValue ?? 1}
                max={answerSet.ratingMaxValue ?? 5}
                value={simpleAnswer.value}
                onChange={(e, data) => updateSimpleAnswer(data.value, 'Rating Response')}
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
                    onChange={(e, data) => onUpdate({ ...answerSet, ratingMinValue: Number(data.value) || 1 })}
                  />
                </Field>
                <Field label={<Text size={200}>Max Value</Text>}>
                  <Input
                    type="number"
                    min={1}
                    value={(answerSet.ratingMaxValue ?? 5).toString()}
                    onChange={(e, data) => onUpdate({ ...answerSet, ratingMaxValue: Number(data.value) || 5 })}
                  />
                </Field>
                <Field label={<Text size={200}>Min Label (optional)</Text>}>
                  <Input
                    placeholder="e.g., Poor"
                    value={answerSet.ratingMinLabel ?? ''}
                    onChange={(e, data) => onUpdate({ ...answerSet, ratingMinLabel: data.value || undefined })}
                  />
                </Field>
                <Field label={<Text size={200}>Max Label (optional)</Text>}>
                  <Input
                    placeholder="e.g., Excellent"
                    value={answerSet.ratingMaxLabel ?? ''}
                    onChange={(e, data) => onUpdate({ ...answerSet, ratingMaxLabel: data.value || undefined })}
                  />
                </Field>
              </div>
            </div>
          )}

          {questionType === 'Boolean' && (
            <div className={styles.spaceY2}>
              <Label weight="semibold">{getSimpleTypeLabel()}</Label>
              <div className={styles.flexRow}>
                <Switch
                  checked={simpleAnswer.value === 'true'}
                  onChange={(_, data) => updateSimpleAnswer(data.checked ? 'true' : 'false', data.checked ? 'Yes' : 'No')}
                  label={simpleAnswer.value === 'true' ? 'Yes (True)' : 'No (False)'}
                />
              </div>
            </div>
          )}

          {questionType === 'Document' && (
            <div className={styles.spaceY3}>
              <div className={styles.flexRow}>
                <ArrowUpload24Regular />
                <Label weight="semibold">{getSimpleTypeLabel()}</Label>
              </div>
              <div className={styles.spaceY3}>
                <Field label={<Text size={200}>Allowed File Types</Text>}>
                  <div className={styles.grid2}>
                    {[
                      { value: 'pdf', label: 'PDF (.pdf)' },
                      { value: 'doc', label: 'Word (.doc, .docx)' },
                      { value: 'xls', label: 'Excel (.xls, .xlsx)' },
                      { value: 'ppt', label: 'PowerPoint (.ppt, .pptx)' },
                      { value: 'txt', label: 'Text (.txt)' },
                      { value: 'image', label: 'Images (.jpg, .png, .gif)' },
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
                </Field>
                <div className={styles.grid2}>
                  <Field label={<Text size={200}>Max File Size (MB)</Text>}>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      placeholder="10"
                      value={(answerSet.maxFileSize ?? 10).toString()}
                      onChange={(e, data) => onUpdate({ ...answerSet, maxFileSize: Number(data.value) || 10 })}
                    />
                  </Field>
                  <Field label={<Text size={200}>Number of Files</Text>}>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      placeholder="3"
                      value={(answerSet.maxFiles ?? 3).toString()}
                      onChange={(e, data) => onUpdate({ ...answerSet, maxFiles: Number(data.value) || 3 })}
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {questionType === 'DownloadableDocument' && (
            <div className={styles.spaceY3}>
              <div className={styles.flexRow}>
                <ArrowUpload24Regular />
                <Label weight="semibold">{getSimpleTypeLabel()}</Label>
              </div>
              <Text size={200}>
                Upload a document that will be available for download by users completing this questionnaire.
              </Text>
              <div className={styles.spaceY3}>
                <Field label={<Text size={200}>Document Name</Text>}>
                  <Input
                    placeholder="Enter document display name"
                    value={answerSet.downloadableFileName ?? ''}
                    onChange={(e, data) => onUpdate({ ...answerSet, downloadableFileName: data.value })}
                  />
                </Field>
                <Field label={<Text size={200}>Attach Document</Text>}>
                  {!answerSet.downloadableFileUrl ? (
                    <label className={styles.uploadZone}>
                      <ArrowUpload24Regular />
                      <Text size={300}>Click to upload a document</Text>
                      <Text size={200}>PDF, Word, Excel, PowerPoint, Text, or Images</Text>
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
                        <Text weight="semibold" block truncate>
                          {answerSet.downloadableFileName || 'Uploaded document'}
                        </Text>
                        <Text size={200}>
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
            </div>
          )}
        </div>
      </div>
    );
  }

  // Choice types UI
  return (
    <div className={styles.container}>
      <div className={`${styles.flexBetween} ${styles.mb3}`}>
        <Label weight="semibold">
          Answer Set {questionType === 'MultiSelect' && <Text size={200}>(Multiple selections allowed)</Text>}
        </Label>
        <div className={styles.flexRow}>
          {onAddFromExisting && !dynamicValues && (
            <Button 
              appearance="outline" 
              size="small"
              icon={<Library24Regular />}
              onClick={onAddFromExisting}
            >
              Add from Existing
            </Button>
          )}
          {isChoiceType && (
            <div className={styles.flexRow}>
              <Switch
                checked={dynamicValues}
                onChange={(_, data) => {
                  onUpdate({ ...answerSet, dynamicValues: data.checked });
                  if (data.checked) {
                    setShowDynamicPanel(true);
                  }
                }}
                label="Dynamic Values"
              />
              {dynamicValues && dynamicConfig?.tableName && (
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<Database24Regular />}
                  onClick={() => setShowDynamicPanel(true)}
                >
                  {dynamicConfig.tableName}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.grid2}>
        <Field label={<Label required>Set Name</Label>}>
          <Input
            placeholder="Answer Set Name"
            value={answerSet.name}
            onChange={(e, data) => onUpdate({ ...answerSet, name: data.value })}
          />
        </Field>
        <Field label={<Label required>Tag</Label>}>
          <Input
            placeholder="Tag"
            value={answerSet.tag}
            onChange={(e, data) => onUpdate({ ...answerSet, tag: data.value })}
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

      {/* Answers Section */}
      <div className={styles.mt4}>
        {dynamicValues && dynamicConfig?.tableName ? (
          // Dynamic Values Summary
          <div className={styles.dynamicCard}>
            <div className={styles.dynamicCardHeader}>
              <div className={styles.flexRow}>
                <Database24Regular primaryFill={tokens.colorBrandForeground1} />
                <Label weight="semibold">Dynamic Values</Label>
              </div>
              <Button 
                appearance="subtle" 
                size="small"
                icon={<Edit24Regular />}
                onClick={() => setShowDynamicPanel(true)}
              >
                Edit
              </Button>
            </div>
            
            <div className={styles.dynamicCardContent}>
              <div className={styles.flexRow}>
                <Table24Regular />
                <Text size={200}>Table:</Text>
                <Badge appearance="outline">{dynamicConfig.tableName}</Badge>
              </div>

              <div className={styles.flexRow}>
                <div style={{ width: 24 }} />
                <Text size={200}>
                  Label: <Text weight="semibold">{dynamicConfig.labelField}</Text>
                </Text>
                <Text size={200}>
                  Value: <Text weight="semibold">{dynamicConfig.valueField}</Text>
                </Text>
              </div>

              {((dynamicConfig.conditionGroup || dynamicConfig.filterGroup)?.children?.length ?? 0) > 0 && (
                <div className={styles.flexRow}>
                  <Filter24Regular />
                  <Text size={200}>Conditions:</Text>
                  <Badge appearance="outline">
                    {countConditions(dynamicConfig.conditionGroup || dynamicConfig.filterGroup!)} condition{countConditions(dynamicConfig.conditionGroup || dynamicConfig.filterGroup!) !== 1 ? 's' : ''}
                  </Badge>
                  <Text size={200}>
                    ({(dynamicConfig.conditionGroup || dynamicConfig.filterGroup)?.matchType})
                  </Text>
                </div>
              )}

              {dynamicConfig.orderByField && (
                <div className={styles.flexRow}>
                  <ArrowSort24Regular />
                  <Text size={200}>
                    Order by: <Text weight="semibold">{dynamicConfig.orderByField}</Text>
                    <Text size={200}> ({dynamicConfig.orderDirection === 'asc' ? 'A → Z' : 'Z → A'})</Text>
                  </Text>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Static Answers
          <>
            <div className={`${styles.flexBetween} ${styles.mb3}`}>
              <Label>Answers</Label>
              <Button appearance="subtle" size="small" icon={<Add24Regular />} onClick={addAnswer}>
                Add Answer
              </Button>
            </div>

            {answerSet.answers.length === 0 && (
              <Text className={styles.errorText}>At least one answer is required</Text>
            )}

            {questionType === 'RadioButton' ? (
              <div className={styles.spaceY2}>
                {answerSet.answers.map(ans => (
                  <div key={ans.id} className={styles.radioAnswerRow}>
                    <Radio value={ans.value} disabled />
                    <div className={`${styles.flexGrow} ${styles.grid2}`}>
                      <Input
                        placeholder="Label"
                        value={ans.label}
                        onChange={(e, data) => updateAnswer(ans.id, { label: data.value })}
                      />
                      <Input
                        placeholder="Value"
                        value={ans.value}
                        onChange={(e, data) => updateAnswer(ans.id, { value: data.value })}
                      />
                    </div>
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
            ) : (
              <div className={styles.spaceY2}>
                {answerSet.answers.map(ans => (
                  <div key={ans.id} className={styles.answerRow}>
                    <Input
                      placeholder="Label"
                      value={ans.label}
                      onChange={(e, data) => updateAnswer(ans.id, { label: data.value })}
                      className={styles.flexGrow}
                    />
                    <Input
                      placeholder="Value"
                      value={ans.value}
                      onChange={(e, data) => updateAnswer(ans.id, { value: data.value })}
                      className={styles.flexGrow}
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
            )}
          </>
        )}
      </div>

      <DynamicValuesPanel
        isOpen={showDynamicPanel}
        onClose={() => setShowDynamicPanel(false)}
        config={dynamicConfig}
        onSave={(config) => {
          onUpdate({ ...answerSet, dynamicConfig: config, dynamicValues: true });
        }}
      />
    </div>
  );
};

export default AnswerSetEditor;
