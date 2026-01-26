/**
 * Questionnaire Statistics
 * 
 * Functions for calculating metrics about questionnaires.
 */

import { 
  Questionnaire, 
  ConditionalBranch,
  Question,
  AnswerSet,
} from '../../types/questionnaire';
import { 
  traverseQuestions, 
  countBranchesInBranch,
  collectBranchQuestions,
} from './traversal';

/**
 * Statistics for a questionnaire
 */
export interface QuestionnaireStats {
  pageCount: number;
  sectionCount: number;
  questionCount: number;
  branchCount: number;
  answerSetCount: number;
  actionCount: number;
  requiredQuestionCount: number;
}

/**
 * Counts action records in an answer set
 */
const countActionsInAnswerSet = (answerSet: AnswerSet): number => {
  return answerSet.answers.filter(a => a.actionRecord).length;
};

/**
 * Counts action records and answer sets for a question
 */
const countQuestionMetrics = (question: Question): { answerSets: number; actions: number } => {
  let answerSetCount = question.answerSets.length;
  let actionCount = 0;
  
  // Count actions in regular answer sets
  question.answerSets.forEach(as => {
    actionCount += countActionsInAnswerSet(as);
  });
  
  // Count inline answer sets and their actions
  question.answerLevelRuleGroups.forEach(rg => {
    if (rg.inlineAnswerSet) {
      answerSetCount++;
      actionCount += countActionsInAnswerSet(rg.inlineAnswerSet);
    }
  });
  
  // Count question-level action record
  if (question.actionRecord) {
    actionCount++;
  }
  
  return { answerSets: answerSetCount, actions: actionCount };
};

/**
 * Calculates comprehensive statistics for a questionnaire
 */
export const calculateQuestionnaireStats = (questionnaire: Questionnaire): QuestionnaireStats => {
  let sectionCount = 0;
  let questionCount = 0;
  let branchCount = 0;
  let answerSetCount = 0;
  let actionCount = 0;
  let requiredQuestionCount = 0;
  
  questionnaire.pages.forEach(page => {
    sectionCount += page.sections.length;
    
    page.sections.forEach(section => {
      // Count section questions
      section.questions.forEach(question => {
        questionCount++;
        if (question.required) requiredQuestionCount++;
        
        const metrics = countQuestionMetrics(question);
        answerSetCount += metrics.answerSets;
        actionCount += metrics.actions;
      });
      
      // Count branches and their questions
      section.branches.forEach(branch => {
        branchCount += countBranchesInBranch(branch);
        
        const branchQuestions = collectBranchQuestions(branch);
        branchQuestions.forEach(question => {
          questionCount++;
          if (question.required) requiredQuestionCount++;
          
          const metrics = countQuestionMetrics(question);
          answerSetCount += metrics.answerSets;
          actionCount += metrics.actions;
        });
      });
    });
  });
  
  return {
    pageCount: questionnaire.pages.length,
    sectionCount,
    questionCount,
    branchCount,
    answerSetCount,
    actionCount,
    requiredQuestionCount,
  };
};

/**
 * Calculates a simplified stats object (for backward compatibility)
 */
export const getQuestionnaireStats = (questionnaire: Questionnaire): Pick<
  QuestionnaireStats, 
  'pageCount' | 'sectionCount' | 'questionCount' | 'branchCount'
> => {
  const stats = calculateQuestionnaireStats(questionnaire);
  return {
    pageCount: stats.pageCount,
    sectionCount: stats.sectionCount,
    questionCount: stats.questionCount,
    branchCount: stats.branchCount,
  };
};
