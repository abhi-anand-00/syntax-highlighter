import { 
  RuleGroup, 
  QuestionLevelRule, 
  AnswerLevelOperator,
  Question,
  ConditionalBranch,
  AnswerLevelRuleGroup,
  AnswerLevelRule,
  AnswerSet
} from "../types/questionnaire";
import { getQuestionConditionGroup, getBranchConditionGroup } from "../types/condition";

type ResponseValue = string | string[] | number | boolean | null;
type ResponseMap = Record<string, ResponseValue>;

/**
 * Evaluates a single rule against the current responses
 */
const evaluateRule = (
  rule: QuestionLevelRule,
  responses: ResponseMap,
  allQuestions: Question[]
): boolean => {
  const sourceQuestion = allQuestions.find(q => q.id === rule.sourceQuestionId);
  if (!sourceQuestion) return false;

  const responseValue = responses[rule.sourceQuestionId];
  if (responseValue === undefined || responseValue === null) return false;

  // For choice-based types, find the answer to get the comparison value
  const isChoiceType = ['Choice', 'Dropdown', 'MultiSelect', 'RadioButton'].includes(sourceQuestion.type);
  
  let targetValue: string;
  if (isChoiceType) {
    // Find the answer set and answer to get the comparison value
    const answerSet = sourceQuestion.answerSets.find(as => as.id === rule.sourceAnswerSetId);
    const targetAnswer = answerSet?.answers.find(a => a.id === rule.sourceAnswerId);
    targetValue = targetAnswer?.value ?? rule.sourceAnswerId;
  } else {
    // For simple types (Text, Number, Date, Boolean, Rating), the sourceAnswerId IS the value
    targetValue = rule.sourceAnswerId;
  }

  return evaluateOperator(rule.operator, responseValue, targetValue);
};

/**
 * Evaluates an operator comparison
 */
const evaluateOperator = (
  operator: AnswerLevelOperator,
  responseValue: ResponseValue,
  targetValue: string
): boolean => {
  // Handle array responses (MultiSelect)
  if (Array.isArray(responseValue)) {
    switch (operator) {
      case 'equals':
        return responseValue.includes(targetValue);
      case 'not_equals':
        return !responseValue.includes(targetValue);
      case 'contains':
        return responseValue.some(v => v.includes(targetValue));
      case 'not_contains':
        return !responseValue.some(v => v.includes(targetValue));
      default:
        return false;
    }
  }

  const stringValue = String(responseValue);
  const numValue = Number(responseValue);
  const targetNum = Number(targetValue);

  switch (operator) {
    case 'equals':
      return stringValue === targetValue;
    case 'not_equals':
      return stringValue !== targetValue;
    case 'greater_than':
      return !isNaN(numValue) && !isNaN(targetNum) && numValue > targetNum;
    case 'less_than':
      return !isNaN(numValue) && !isNaN(targetNum) && numValue < targetNum;
    case 'contains':
      return stringValue.includes(targetValue);
    case 'not_contains':
      return !stringValue.includes(targetValue);
    case 'starts_with':
      return stringValue.startsWith(targetValue);
    case 'ends_with':
      return stringValue.endsWith(targetValue);
    default:
      return false;
  }
};

/**
 * Recursively evaluates a rule group (AND/OR logic)
 */
const evaluateRuleGroup = (
  ruleGroup: RuleGroup,
  responses: ResponseMap,
  allQuestions: Question[]
): boolean => {
  if (!ruleGroup.children || ruleGroup.children.length === 0) {
    // No rules means always visible
    return true;
  }

  const results = ruleGroup.children.map(child => {
    if (child.type === 'group') {
      return evaluateRuleGroup(child, responses, allQuestions);
    } else if (child.type === 'rule') {
      return evaluateRule(child, responses, allQuestions);
    }
    return true;
  });

  if (ruleGroup.matchType === 'AND') {
    return results.every(r => r === true);
  } else {
    return results.some(r => r === true);
  }
};

/**
 * Evaluates a single answer-level rule against current responses
 */
const evaluateAnswerLevelRule = (
  rule: AnswerLevelRule,
  responses: ResponseMap,
  allQuestions: Question[]
): boolean => {
  const sourceQuestion = allQuestions.find(q => q.id === rule.previousQuestionId);
  if (!sourceQuestion) return false;

  const responseValue = responses[rule.previousQuestionId];
  if (responseValue === undefined || responseValue === null) return false;

  // For choice-based types, find the answer to get the comparison value
  const isChoiceType = ['Choice', 'Dropdown', 'MultiSelect', 'RadioButton'].includes(sourceQuestion.type);
  
  let targetValue: string;
  if (isChoiceType) {
    // Find the answer set - check both regular answer sets and inline answer sets from rule groups
    let answerSet = sourceQuestion.answerSets.find(as => as.id === rule.previousAnswerSetId);
    
    // If not found in regular answer sets, check inline answer sets from rule groups
    if (!answerSet && sourceQuestion.answerLevelRuleGroups) {
      for (const ruleGroup of sourceQuestion.answerLevelRuleGroups) {
        if (ruleGroup.inlineAnswerSet?.id === rule.previousAnswerSetId) {
          answerSet = ruleGroup.inlineAnswerSet;
          break;
        }
      }
    }

    const targetAnswer = answerSet?.answers.find(a => a.id === rule.previousAnswerId);
    targetValue = targetAnswer?.value ?? rule.previousAnswerId;
  } else {
    // For simple types (Text, Number, Date, Boolean, Rating), the previousAnswerId IS the value
    targetValue = rule.previousAnswerId;
  }

  return evaluateOperator(rule.operator, responseValue, targetValue);
};

/**
 * Recursively evaluates an answer-level rule group (AND/OR logic)
 */
const evaluateAnswerLevelRuleGroup = (
  ruleGroup: AnswerLevelRuleGroup,
  responses: ResponseMap,
  allQuestions: Question[]
): boolean => {
  if (!ruleGroup.children || ruleGroup.children.length === 0) {
    // No rules means the group is not active
    return false;
  }

  const results = ruleGroup.children.map(child => {
    if (child.type === 'group') {
      return evaluateAnswerLevelRuleGroup(child as AnswerLevelRuleGroup, responses, allQuestions);
    } else if (child.type === 'answerRule') {
      return evaluateAnswerLevelRule(child as AnswerLevelRule, responses, allQuestions);
    }
    return false;
  });

  if (ruleGroup.matchType === 'AND') {
    return results.every(r => r === true);
  } else {
    return results.some(r => r === true);
  }
};

/**
 * Determines which answer set should be active for a question based on answer-level rules
 * Returns the inline answer set from a matching rule group, or falls back to the default answer set
 */
export const getActiveAnswerSetForQuestion = (
  question: Question,
  responses: ResponseMap,
  allQuestions: Question[]
): AnswerSet | null => {
  // First, check if any answer-level rule groups match
  if (question.answerLevelRuleGroups && question.answerLevelRuleGroups.length > 0) {
    for (const ruleGroup of question.answerLevelRuleGroups) {
      // Evaluate the rule group
      if (evaluateAnswerLevelRuleGroup(ruleGroup, responses, allQuestions)) {
        // If the rule group matches and has an inline answer set, use it
        if (ruleGroup.inlineAnswerSet) {
          return ruleGroup.inlineAnswerSet;
        }
      }
    }
  }

  // Fall back to the default answer set
  if (question.answerSets.length === 0) return null;
  return question.answerSets.find(as => as.isDefault) || question.answerSets[0];
};

/**
 * Determines if a question should be visible based on its conditionGroup
 */
export const isQuestionVisible = (
  question: Question,
  responses: ResponseMap,
  allQuestions: Question[]
): boolean => {
  // If question is explicitly hidden, don't show
  if (question.hidden) return false;

  // Get condition group (supports both new 'conditionGroup' and legacy 'questionLevelRuleGroup')
  const conditionGroup = getQuestionConditionGroup(question);

  // If no condition group or empty, show the question
  if (!conditionGroup || 
      !conditionGroup.children || 
      conditionGroup.children.length === 0) {
    return true;
  }

  return evaluateRuleGroup(conditionGroup, responses, allQuestions);
};

/**
 * Determines if a branch should be visible based on its conditionGroup
 */
export const isBranchVisible = (
  branch: ConditionalBranch,
  responses: ResponseMap,
  allQuestions: Question[]
): boolean => {
  // Get condition group (supports both new 'conditionGroup' and legacy 'ruleGroup')
  const conditionGroup = getBranchConditionGroup(branch);

  // If no condition group or empty, show the branch
  if (!conditionGroup || 
      !conditionGroup.children || 
      conditionGroup.children.length === 0) {
    return true;
  }

  return evaluateRuleGroup(conditionGroup, responses, allQuestions);
};

/**
 * Gets all visible questions from a page considering conditional logic
 */
export const getVisibleQuestionsForPage = (
  questions: Question[],
  responses: ResponseMap,
  allQuestions: Question[]
): Question[] => {
  return questions.filter(q => isQuestionVisible(q, responses, allQuestions));
};
