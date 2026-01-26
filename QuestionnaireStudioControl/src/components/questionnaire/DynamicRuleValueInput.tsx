import * as React from 'react';
import {
  Input,
  Switch,
  Label,
  Dropdown,
  Option,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { Question, Answer, QuestionType } from "../../types/questionnaire";

const useStyles = makeStyles({
  container: {
    height: "32px",
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  input: {
    minWidth: "150px",
  },
  dropdown: {
    minWidth: "150px",
  },
  label: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
});

interface DynamicRuleValueInputProps {
  questionType: QuestionType;
  answers: Answer[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Renders the appropriate input type based on the source question type.
 * - Choice/Dropdown/RadioButton/MultiSelect → Dropdown of answers
 * - Text/TextArea → Text input
 * - Number/Decimal → Number input
 * - Date → Date input
 * - Boolean → Switch/Toggle
 * - Rating → Number input with constraints
 */
const DynamicRuleValueInput = ({
  questionType,
  answers,
  value,
  onChange,
  disabled = false,
  placeholder = "Enter value",
}: DynamicRuleValueInputProps) => {
  const styles = useStyles();
  
  // Choice-based types show a dropdown of available answers
  const isChoiceType = ["Choice", "Dropdown", "MultiSelect", "RadioButton"].includes(questionType);

  if (isChoiceType) {
    const selectedAnswer = answers.find((a) => a.id === value);
    return (
      <Dropdown
        value={selectedAnswer?.label || ""}
        selectedOptions={value ? [value] : []}
        onOptionSelect={(_, data) => onChange(data.optionValue || "")}
        disabled={disabled}
        placeholder="Select answer"
        className={styles.dropdown}
        size="small"
      >
        {answers.map((ans) => (
          <Option key={ans.id} value={ans.id}>
            {ans.label || "Untitled Answer"}
          </Option>
        ))}
      </Dropdown>
    );
  }

  if (questionType === "Text" || questionType === "TextArea") {
    return (
      <Input
        type="text"
        value={value}
        onChange={(_, data) => onChange(data.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={styles.input}
        size="small"
      />
    );
  }

  if (questionType === "Number") {
    return (
      <Input
        type="number"
        value={value}
        onChange={(_, data) => onChange(data.value)}
        disabled={disabled}
        placeholder="Enter number"
        className={styles.input}
        size="small"
      />
    );
  }

  if (questionType === "Decimal") {
    return (
      <Input
        type="number"
        step="0.01"
        value={value}
        onChange={(_, data) => onChange(data.value)}
        disabled={disabled}
        placeholder="Enter decimal"
        className={styles.input}
        size="small"
      />
    );
  }

  if (questionType === "Date") {
    return (
      <Input
        type="date"
        value={value}
        onChange={(_, data) => onChange(data.value)}
        disabled={disabled}
        className={styles.input}
        size="small"
      />
    );
  }

  if (questionType === "Boolean") {
    return (
      <div className={styles.container}>
        <Switch
          checked={value === "true"}
          onChange={(_, data) => onChange(data.checked ? "true" : "false")}
          disabled={disabled}
        />
        <Label className={styles.label}>
          {value === "true" ? "Yes" : value === "false" ? "No" : "Select"}
        </Label>
      </div>
    );
  }

  if (questionType === "Rating") {
    return (
      <Input
        type="number"
        min={1}
        max={10}
        value={value}
        onChange={(_, data) => onChange(data.value)}
        disabled={disabled}
        placeholder="Enter rating"
        className={styles.input}
        size="small"
      />
    );
  }

  // Default fallback: text input
  return (
    <Input
      type="text"
      value={value}
      onChange={(_, data) => onChange(data.value)}
      disabled={disabled}
      placeholder={placeholder}
      className={styles.input}
      size="small"
    />
  );
};

export default DynamicRuleValueInput;
