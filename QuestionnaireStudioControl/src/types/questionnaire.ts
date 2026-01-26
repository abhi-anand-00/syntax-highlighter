import {
  ConditionOperator,
  DynamicValueCondition,
  DynamicValueConditionGroup,
  DynamicValueConfig,
  QuestionCondition,
  QuestionConditionGroup,
  AnswerSetCondition,
  AnswerSetConditionGroup,
  // Re-export deprecated aliases for backward compatibility
  DynamicValueFilter,
  DynamicValueFilterGroup,
  DynamicValueOperator,
  AnswerLevelOperator,
  QuestionLevelRule,
  AnswerLevelRule,
  RuleGroup,
  getQuestionConditionGroup,
  getBranchConditionGroup,
} from './condition';

// Re-export all condition types for convenience
export type {
  ConditionOperator,
  DynamicValueCondition,
  DynamicValueConditionGroup,
  DynamicValueConfig,
  QuestionCondition,
  QuestionConditionGroup,
  AnswerSetCondition,
  AnswerSetConditionGroup,
  // Backward compatibility aliases
  DynamicValueFilter,
  DynamicValueFilterGroup,
  DynamicValueOperator,
  AnswerLevelOperator,
  QuestionLevelRule,
  AnswerLevelRule,
  RuleGroup,
};

// Re-export helper functions
export { getQuestionConditionGroup, getBranchConditionGroup };

export type ImpactLevel = '1' | '2' | '3' | '4';
export type UrgencyLevel = '1' | '2' | '3' | '4';

export interface ActionRecord {
  operationCategoryTier1: string;
  operationCategoryTier2: string;
  operationCategoryTier3: string;
  productCategoryTier1: string;
  productCategoryTier2: string;
  productCategoryTier3: string;
  impact: ImpactLevel | '';
  urgency: UrgencyLevel | '';
}

export interface Answer {
  id: string;
  label: string;
  value: string;
  active: boolean;
  actionRecord?: ActionRecord;
}

export interface AnswerSet {
  id: string;
  name: string;
  tag: string;
  isDefault: boolean;
  answers: Answer[];
  dynamicValues?: boolean;
  dynamicConfig?: DynamicValueConfig;
  // Date restriction fields
  dateRestriction?: boolean;
  minDate?: string;
  maxDate?: string;
  includeTime?: boolean;
  // Number restriction fields
  numberRestriction?: boolean;
  minValue?: number;
  maxValue?: number;
  // TextArea format
  textAreaFormat?: 'plain' | 'rich';
  // Rating configuration
  ratingMinValue?: number;
  ratingMaxValue?: number;
  ratingMinLabel?: string;
  ratingMaxLabel?: string;
  ratingDisplayStyle?: 'numbers' | 'stars' | 'smileys' | 'hearts' | 'thumbs';
  // Document/File attachment configuration
  allowedFileTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number; // max number of files allowed
  // Downloadable Document configuration
  downloadableFileName?: string;
  downloadableFileUrl?: string;
  downloadableFileType?: string;
}

/**
 * Answer-level rule group typed with AnswerSet
 * This is the concrete type used in questions, with AnswerSet as the inline answer set type
 */
export interface AnswerLevelRuleGroup {
  type: 'group';
  id: string;
  matchType: 'AND' | 'OR';
  children: (AnswerLevelRuleGroup | AnswerLevelRule)[];
  inlineAnswerSet?: AnswerSet;
}

export type QuestionType = 'Choice' | 'Dropdown' | 'Text' | 'TextArea' | 'Number' | 'Decimal' | 'Date' | 'MultiSelect' | 'Rating' | 'Boolean' | 'RadioButton' | 'Document' | 'DownloadableDocument';

export type TextAreaFormat = 'plain' | 'rich';

export interface TextAreaConfig {
  format: TextAreaFormat;
  defaultValue?: string;
}

export interface NumberConfig {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
}

export type TextValidationType = 'none' | 'cost_center' | 'email' | 'ip_address' | 'phone' | 'url';

export interface TextConfig {
  validationType?: TextValidationType;
  defaultValue?: string;
}

export interface DateConfig {
  minDate?: string;
  maxDate?: string;
  defaultValue?: string;
}

export interface RatingConfig {
  minValue: number;
  maxValue: number;
  minLabel?: string;
  maxLabel?: string;
  defaultValue?: number;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  readOnly?: boolean;
  hidden?: boolean;
  order: number;
  answerSets: AnswerSet[];
  /** @deprecated Use conditionGroup instead */
  questionLevelRuleGroup?: RuleGroup;
  /** Condition group for showing/hiding this question */
  conditionGroup: RuleGroup;
  answerLevelRuleGroups: AnswerLevelRuleGroup[];
  textConfig?: TextConfig;
  numberConfig?: NumberConfig;
  dateConfig?: DateConfig;
  ratingConfig?: RatingConfig;
  textAreaConfig?: TextAreaConfig;
  actionRecord?: ActionRecord;
}

export interface ConditionalBranch {
  id: string;
  name: string;
  /** @deprecated Use conditionGroup instead */
  ruleGroup?: RuleGroup;
  /** Condition group for showing/hiding this branch */
  conditionGroup: RuleGroup;
  questions: Question[];
  childBranches: ConditionalBranch[];
}

export interface Section {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
  branches: ConditionalBranch[];
}

export interface Page {
  id: string;
  name: string;
  description?: string;
  sections: Section[];
}

export interface Questionnaire {
  name: string;
  description: string;
  status: string;
  version: string;
  serviceCatalog: string;
  pages: Page[];
}

export interface LayoutItem {
  type: 'question' | 'branch';
  id: string;
}
