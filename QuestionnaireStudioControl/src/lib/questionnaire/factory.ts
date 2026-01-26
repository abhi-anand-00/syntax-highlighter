/**
 * Questionnaire Entity Factory
 * 
 * Provides functions to create new questionnaire entities with proper defaults.
 * Centralizes entity creation to ensure consistency.
 */

import { EntityId } from '../core/id';
import { 
  Questionnaire, 
  Page, 
  Section, 
  Question, 
  ConditionalBranch,
  AnswerSet,
  Answer,
  QuestionType,
  ActionRecord,
} from '../../types/questionnaire';
import { 
  QuestionConditionGroup, 
  AnswerSetConditionGroup,
  createEmptyQuestionConditionGroup,
} from '../../types/condition';
import { QuestionnaireStatus, Defaults } from './constants';

/**
 * Creates an empty action record
 */
export const createActionRecord = (): ActionRecord => ({
  operationCategoryTier1: '',
  operationCategoryTier2: '',
  operationCategoryTier3: '',
  productCategoryTier1: '',
  productCategoryTier2: '',
  productCategoryTier3: '',
  impact: '',
  urgency: '',
});

/**
 * Creates a new answer with defaults
 */
export const createAnswer = (overrides?: Partial<Answer>): Answer => ({
  id: EntityId.answer(),
  label: '',
  value: '',
  active: true,
  ...overrides,
});

/**
 * Creates a new answer set with defaults
 */
export const createAnswerSet = (overrides?: Partial<AnswerSet>): AnswerSet => ({
  id: EntityId.answerSet(),
  name: '',
  tag: '',
  isDefault: false,
  answers: [createAnswer()],
  ...overrides,
});

/**
 * Creates a default answer set for a question type
 */
export const createDefaultAnswerSet = (questionType: QuestionType): AnswerSet => {
  const base = createAnswerSet({ isDefault: true });
  
  switch (questionType) {
    case 'Boolean':
      return {
        ...base,
        name: 'Yes/No',
        answers: [
          createAnswer({ label: 'Yes', value: 'true' }),
          createAnswer({ label: 'No', value: 'false' }),
        ],
      };
    case 'Rating':
      return {
        ...base,
        name: 'Rating',
        ratingMinValue: Defaults.RATING_MIN,
        ratingMaxValue: Defaults.RATING_MAX,
        ratingDisplayStyle: 'stars',
      };
    default:
      return base;
  }
};

/**
 * Creates an empty condition group for questions/branches
 */
export const createEmptyConditionGroup = (): QuestionConditionGroup => 
  createEmptyQuestionConditionGroup();

/**
 * Creates a new question with defaults
 */
export const createQuestion = (overrides?: Partial<Question>): Question => {
  const type = overrides?.type ?? 'Choice';
  
  return {
    id: EntityId.question(),
    text: '',
    type,
    required: false,
    readOnly: false,
    hidden: false,
    order: 1,
    answerSets: [createDefaultAnswerSet(type)],
    conditionGroup: createEmptyConditionGroup(),
    answerLevelRuleGroups: [],
    ...overrides,
  };
};

/**
 * Creates a new conditional branch with defaults
 */
export const createBranch = (overrides?: Partial<ConditionalBranch>): ConditionalBranch => ({
  id: EntityId.branch(),
  name: '',
  conditionGroup: createEmptyConditionGroup(),
  questions: [],
  childBranches: [],
  ...overrides,
});

/**
 * Creates a new section with defaults
 */
export const createSection = (overrides?: Partial<Section>): Section => ({
  id: EntityId.section(),
  name: '',
  description: '',
  questions: [],
  branches: [],
  ...overrides,
});

/**
 * Creates a new page with defaults
 */
export const createPage = (overrides?: Partial<Page>): Page => ({
  id: EntityId.page(),
  name: 'New Page',
  description: '',
  sections: [],
  ...overrides,
});

/**
 * Creates a new questionnaire with defaults
 */
export const createQuestionnaire = (overrides?: Partial<Questionnaire>): Questionnaire => {
  const defaultPage = createPage({ name: 'Page 1' });
  
  return {
    name: '',
    description: '',
    status: QuestionnaireStatus.DRAFT,
    version: Defaults.QUESTIONNAIRE_VERSION,
    serviceCatalog: '',
    pages: [defaultPage],
    ...overrides,
  };
};

/**
 * Creates an answer-level rule group (for conditional answer sets)
 */
export const createAnswerLevelRuleGroup = <T = AnswerSet>(
  inlineAnswerSet?: T
): AnswerSetConditionGroup<T> => ({
  type: 'group',
  id: EntityId.ruleGroup(),
  matchType: 'AND',
  children: [],
  inlineAnswerSet,
});

/**
 * Type for factory functions
 */
export const QuestionnaireFactory = {
  questionnaire: createQuestionnaire,
  page: createPage,
  section: createSection,
  question: createQuestion,
  branch: createBranch,
  answerSet: createAnswerSet,
  answer: createAnswer,
  conditionGroup: createEmptyConditionGroup,
  answerLevelRuleGroup: createAnswerLevelRuleGroup,
  actionRecord: createActionRecord,
} as const;
