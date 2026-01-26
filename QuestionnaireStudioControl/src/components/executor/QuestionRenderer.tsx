import * as React from 'react';
import { Question, AnswerSet } from "../../types/questionnaire";
import {
  Input,
  Textarea,
  Checkbox,
  RadioGroup,
  Radio,
  Label,
  Dropdown,
  Option,
  Switch,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  Star24Regular,
  Star24Filled,
  Heart24Regular,
  Heart24Filled,
  ThumbLike24Regular,
  ThumbLike24Filled,
  EmojiSad24Regular,
  Emoji24Regular,
  EmojiSmileSlight24Regular,
} from "@fluentui/react-icons";
import { cn } from "../../lib/utils";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: tokens.spacingVerticalM,
  },
  questionHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: tokens.spacingHorizontalS,
  },
  questionText: {
    fontWeight: tokens.fontWeightSemibold,
  },
  required: {
    color: tokens.colorPaletteRedForeground1,
  },
  radioGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: tokens.spacingVerticalS,
  },
  radioItem: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  buttonGroup: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: tokens.spacingHorizontalS,
  },
  choiceButton: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  choiceButtonHover: {
    backgroundColor: tokens.colorNeutralBackground1Hover,
  },
  choiceButtonSelected: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  checkboxGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: tokens.spacingVerticalS,
  },
  checkboxItem: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  ratingContainer: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  ratingLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  ratingButtons: {
    display: "flex",
    gap: tokens.spacingHorizontalXS,
  },
  ratingButton: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: "pointer",
    fontWeight: tokens.fontWeightSemibold,
  },
  ratingButtonHover: {
    backgroundColor: tokens.colorNeutralBackground1Hover,
  },
  ratingButtonSelected: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  iconButton: {
    padding: tokens.spacingHorizontalXS,
    cursor: "pointer",
  },
  switchContainer: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
  },
  uploadPlaceholder: {
    border: `2px dashed ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingVerticalL,
    textAlign: "center" as const,
    maxWidth: "400px",
  },
  uploadText: {
    color: tokens.colorNeutralForeground3,
    marginBottom: tokens.spacingVerticalS,
  },
  downloadContainer: {
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    maxWidth: "400px",
  },
  downloadLink: {
    color: tokens.colorBrandForeground1,
    ":hover": {
      textDecoration: "underline",
    },
  },
  dropdown: {
    maxWidth: "400px",
  },
  input: {
    maxWidth: "400px",
  },
  textarea: {
    minHeight: "100px",
    maxWidth: "512px",
  },
});

interface QuestionRendererProps {
  question: Question;
  value: string | string[] | number | boolean | null;
  onChange: (value: string | string[] | number | boolean | null) => void;
  activeAnswerSet?: AnswerSet | null;
}

const getDefaultAnswerSet = (question: Question): AnswerSet | null => {
  if (question.answerSets.length === 0) return null;
  return question.answerSets.find((as) => as.isDefault) || question.answerSets[0];
};

const QuestionRenderer = ({ question, value, onChange, activeAnswerSet }: QuestionRendererProps) => {
  const styles = useStyles();
  const answerSet = activeAnswerSet ?? getDefaultAnswerSet(question);
  const activeAnswers = answerSet?.answers.filter((a) => a.active) || [];

  const renderChoiceQuestion = () => (
    <RadioGroup
      value={value as string || ""}
      onChange={(_, data) => onChange(data.value)}
      className={styles.radioGroup}
    >
      {activeAnswers.map((answer) => (
        <div key={answer.id} className={styles.radioItem}>
          <Radio value={answer.value} label={answer.label} />
        </div>
      ))}
    </RadioGroup>
  );

  const renderRadioButtonQuestion = () => (
    <div className={styles.buttonGroup}>
      {activeAnswers.map((answer) => (
        <button
          key={answer.id}
          type="button"
          onClick={() => onChange(answer.value)}
          className={cn(
            styles.choiceButton,
            value === answer.value && styles.choiceButtonSelected
          )}
        >
          {answer.label}
        </button>
      ))}
    </div>
  );

  const renderDropdownQuestion = () => (
    <Dropdown
      placeholder="Select an option..."
      value={activeAnswers.find(a => a.value === value)?.label || ""}
      selectedOptions={value ? [value as string] : []}
      onOptionSelect={(_, data) => onChange(data.optionValue || null)}
      className={styles.dropdown}
    >
      {activeAnswers.map((answer) => (
        <Option key={answer.id} value={answer.value}>
          {answer.label}
        </Option>
      ))}
    </Dropdown>
  );

  const renderMultiSelectQuestion = () => {
    const selectedValues = Array.isArray(value) ? value : [];

    const handleToggle = (answerValue: string) => {
      if (selectedValues.includes(answerValue)) {
        onChange(selectedValues.filter((v) => v !== answerValue));
      } else {
        onChange([...selectedValues, answerValue]);
      }
    };

    return (
      <div className={styles.checkboxGroup}>
        {activeAnswers.map((answer) => (
          <div key={answer.id} className={styles.checkboxItem}>
            <Checkbox
              checked={selectedValues.includes(answer.value)}
              onChange={() => handleToggle(answer.value)}
              label={answer.label}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderTextQuestion = () => (
    <Input
      type="text"
      value={value as string || ""}
      onChange={(_, data) => onChange(data.value)}
      placeholder="Enter your answer..."
      className={styles.input}
    />
  );

  const renderTextAreaQuestion = () => (
    <Textarea
      value={value as string || ""}
      onChange={(_, data) => onChange(data.value)}
      placeholder="Enter your answer..."
      className={styles.textarea}
    />
  );

  const renderNumberQuestion = () => {
    const config = question.numberConfig;
    return (
      <Input
        type="number"
        value={value?.toString() || ""}
        onChange={(_, data) => onChange(data.value ? Number(data.value) : null)}
        min={config?.min}
        max={config?.max}
        step={config?.step || 1}
        placeholder="Enter a number..."
        className={styles.input}
      />
    );
  };

  const renderDecimalQuestion = () => (
    <Input
      type="number"
      step="0.01"
      value={value?.toString() || ""}
      onChange={(_, data) => onChange(data.value ? Number(data.value) : null)}
      placeholder="Enter a decimal number..."
      className={styles.input}
    />
  );

  const renderDateQuestion = () => {
    const config = question.dateConfig;
    return (
      <Input
        type="date"
        value={value as string || ""}
        onChange={(_, data) => onChange(data.value)}
        min={config?.minDate}
        max={config?.maxDate}
        className={styles.input}
      />
    );
  };

  const renderBooleanQuestion = () => (
    <div className={styles.switchContainer}>
      <Switch
        checked={value === true}
        onChange={(_, data) => onChange(data.checked)}
      />
      <Label>{value === true ? "Yes" : value === false ? "No" : "Not answered"}</Label>
    </div>
  );

  const renderRatingQuestion = () => {
    const config = question.ratingConfig || { minValue: 1, maxValue: 5 };
    const style = answerSet?.ratingDisplayStyle || "numbers";
    const currentValue = typeof value === "number" ? value : 0;

    const renderIcon = (index: number, filled: boolean) => {
      const iconSize = { width: 32, height: 32 };
      const filledColor = { color: tokens.colorBrandForeground1 };
      const unfilledColor = { color: tokens.colorNeutralForeground3 };

      switch (style) {
        case "stars":
          return filled ? (
            <Star24Filled style={{ ...iconSize, ...filledColor }} />
          ) : (
            <Star24Regular style={{ ...iconSize, ...unfilledColor }} />
          );
        case "hearts":
          return filled ? (
            <Heart24Filled style={{ ...iconSize, ...filledColor }} />
          ) : (
            <Heart24Regular style={{ ...iconSize, ...unfilledColor }} />
          );
        case "thumbs":
          return filled ? (
            <ThumbLike24Filled style={{ ...iconSize, ...filledColor }} />
          ) : (
            <ThumbLike24Regular style={{ ...iconSize, ...unfilledColor }} />
          );
        case "smileys":
          if (index <= Math.floor((config.maxValue - config.minValue) / 3)) {
            return <EmojiSad24Regular style={{ ...iconSize, ...(filled ? filledColor : unfilledColor) }} />;
          } else if (index <= Math.floor((2 * (config.maxValue - config.minValue)) / 3)) {
            return <Emoji24Regular style={{ ...iconSize, ...(filled ? filledColor : unfilledColor) }} />;
          }
          return <EmojiSmileSlight24Regular style={{ ...iconSize, ...(filled ? filledColor : unfilledColor) }} />;
        default:
          return null;
      }
    };

    if (style === "numbers") {
      return (
        <div className={styles.ratingContainer}>
          {config.minLabel && <span className={styles.ratingLabel}>{config.minLabel}</span>}
          <div className={styles.ratingButtons}>
            {Array.from(
              { length: config.maxValue - config.minValue + 1 },
              (_, i) => config.minValue + i
            ).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onChange(num)}
                className={cn(
                  styles.ratingButton,
                  currentValue === num && styles.ratingButtonSelected
                )}
              >
                {num}
              </button>
            ))}
          </div>
          {config.maxLabel && <span className={styles.ratingLabel}>{config.maxLabel}</span>}
        </div>
      );
    }

    return (
      <div className={styles.ratingContainer}>
        {config.minLabel && <span className={styles.ratingLabel}>{config.minLabel}</span>}
        <div className={styles.ratingButtons}>
          {Array.from(
            { length: config.maxValue - config.minValue + 1 },
            (_, i) => config.minValue + i
          ).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className={styles.iconButton}
            >
              {renderIcon(num - config.minValue, num <= currentValue)}
            </button>
          ))}
        </div>
        {config.maxLabel && <span className={styles.ratingLabel}>{config.maxLabel}</span>}
      </div>
    );
  };

  const renderDocumentQuestion = () => (
    <div className={styles.uploadPlaceholder}>
      <p className={styles.uploadText}>File upload is not available in this preview</p>
      <Input
        type="text"
        value={value as string || ""}
        onChange={(_, data) => onChange(data.value)}
        placeholder="Enter file reference..."
      />
    </div>
  );

  const renderDownloadableDocument = () => (
    <div className={styles.downloadContainer}>
      <p style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
        {answerSet?.downloadableFileName || "Document available for download"}
      </p>
      {answerSet?.downloadableFileUrl && (
        <a
          href={answerSet.downloadableFileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.downloadLink}
        >
          Download
        </a>
      )}
    </div>
  );

  const renderers: Record<string, () => JSX.Element> = {
    Choice: renderChoiceQuestion,
    RadioButton: renderRadioButtonQuestion,
    Dropdown: renderDropdownQuestion,
    MultiSelect: renderMultiSelectQuestion,
    Text: renderTextQuestion,
    TextArea: renderTextAreaQuestion,
    Number: renderNumberQuestion,
    Decimal: renderDecimalQuestion,
    Date: renderDateQuestion,
    Boolean: renderBooleanQuestion,
    Rating: renderRatingQuestion,
    Document: renderDocumentQuestion,
    DownloadableDocument: renderDownloadableDocument,
  };

  const renderer = renderers[question.type];
  if (!renderer) {
    return <p style={{ color: tokens.colorNeutralForeground3 }}>Unsupported question type: {question.type}</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.questionHeader}>
        <span className={styles.questionText}>{question.text}</span>
        {question.required && <span className={styles.required}>*</span>}
      </div>
      {renderer()}
    </div>
  );
};

export default QuestionRenderer;
