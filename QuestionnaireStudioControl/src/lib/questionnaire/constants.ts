/**
 * Questionnaire Domain Constants
 * 
 * Centralizes all magic values and configuration constants.
 */

/**
 * Questionnaire status values
 */
export const QuestionnaireStatus = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ARCHIVED: 'Archived',
} as const;

export type QuestionnaireStatusType = typeof QuestionnaireStatus[keyof typeof QuestionnaireStatus];

/**
 * Question type options
 */
export const QuestionTypes = {
  CHOICE: 'Choice',
  DROPDOWN: 'Dropdown',
  TEXT: 'Text',
  TEXT_AREA: 'TextArea',
  NUMBER: 'Number',
  DECIMAL: 'Decimal',
  DATE: 'Date',
  MULTI_SELECT: 'MultiSelect',
  RATING: 'Rating',
  BOOLEAN: 'Boolean',
  RADIO_BUTTON: 'RadioButton',
  DOCUMENT: 'Document',
  DOWNLOADABLE_DOCUMENT: 'DownloadableDocument',
} as const;

export type QuestionTypeValue = typeof QuestionTypes[keyof typeof QuestionTypes];

/**
 * Question types that support choice-based answers
 */
export const CHOICE_BASED_TYPES: QuestionTypeValue[] = [
  QuestionTypes.CHOICE,
  QuestionTypes.DROPDOWN,
  QuestionTypes.MULTI_SELECT,
  QuestionTypes.RADIO_BUTTON,
];

/**
 * Question types that use simple value inputs
 */
export const SIMPLE_VALUE_TYPES: QuestionTypeValue[] = [
  QuestionTypes.TEXT,
  QuestionTypes.TEXT_AREA,
  QuestionTypes.NUMBER,
  QuestionTypes.DECIMAL,
  QuestionTypes.DATE,
  QuestionTypes.RATING,
  QuestionTypes.BOOLEAN,
  QuestionTypes.DOCUMENT,
  QuestionTypes.DOWNLOADABLE_DOCUMENT,
];

/**
 * Condition match types
 */
export const MatchType = {
  AND: 'AND',
  OR: 'OR',
} as const;

export type MatchTypeValue = typeof MatchType[keyof typeof MatchType];

/**
 * Impact levels for action records
 */
export const ImpactLevels = {
  CRITICAL: '1',
  HIGH: '2',
  MEDIUM: '3',
  LOW: '4',
} as const;

/**
 * Urgency levels for action records
 */
export const UrgencyLevels = {
  CRITICAL: '1',
  HIGH: '2',
  MEDIUM: '3',
  LOW: '4',
} as const;

/**
 * Text validation types
 */
export const TextValidationTypes = {
  NONE: 'none',
  COST_CENTER: 'cost_center',
  EMAIL: 'email',
  IP_ADDRESS: 'ip_address',
  PHONE: 'phone',
  URL: 'url',
} as const;

/**
 * Text validation patterns
 */
export const TEXT_VALIDATION_PATTERNS: Record<string, { pattern: RegExp; example: string }> = {
  cost_center: {
    pattern: /^[A-Z]{2}\d{4}$/,
    example: 'AB1234',
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    example: 'user@example.com',
  },
  ip_address: {
    pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    example: '192.168.1.1',
  },
  phone: {
    pattern: /^\+?[\d\s\-()]+$/,
    example: '+1 (555) 123-4567',
  },
  url: {
    pattern: /^https?:\/\/.+/,
    example: 'https://example.com',
  },
};

/**
 * TextArea format types
 */
export const TextAreaFormats = {
  PLAIN: 'plain',
  RICH: 'rich',
} as const;

/**
 * Rating display styles
 */
export const RatingDisplayStyles = {
  NUMBERS: 'numbers',
  STARS: 'stars',
  SMILEYS: 'smileys',
  HEARTS: 'hearts',
  THUMBS: 'thumbs',
} as const;

/**
 * Order direction
 */
export const OrderDirection = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

/**
 * Default values for new entities
 */
export const Defaults = {
  QUESTIONNAIRE_VERSION: '1.0',
  RATING_MIN: 1,
  RATING_MAX: 5,
  NUMBER_STEP: 1,
} as const;

/**
 * Storage keys for localStorage
 */
export const StorageKeys = {
  DRAFTS: 'questionnaire-drafts',
  PUBLISHED_RECORDS: 'published-questionnaires',
  EXECUTOR_QUESTIONNAIRE: 'executor-questionnaire',
} as const;

/**
 * Condition operators with display labels
 */
export const CONDITION_OPERATORS = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'does not equal' },
  { value: 'greater_than', label: 'is greater than' },
  { value: 'less_than', label: 'is less than' },
  { value: 'contains', label: 'contains' },
  { value: 'not_contains', label: 'does not contain' },
  { value: 'starts_with', label: 'starts with' },
  { value: 'ends_with', label: 'ends with' },
  { value: 'is_null', label: 'is null' },
  { value: 'is_not_null', label: 'is not null' },
] as const;

/**
 * Operators that don't require a comparison value
 */
export const NULL_CHECK_OPERATORS = ['is_null', 'is_not_null'] as const;
