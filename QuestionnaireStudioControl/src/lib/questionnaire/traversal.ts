/**
 * Questionnaire Traversal Utilities
 * 
 * Functions for navigating and collecting data from questionnaire structures.
 */

import { 
  Questionnaire, 
  Page, 
  Section, 
  Question, 
  ConditionalBranch,
  AnswerSet,
} from '../../types/questionnaire';

/**
 * Callback type for traversal functions
 */
export type TraversalCallback<T, R = void> = (item: T, path: TraversalPath) => R;

/**
 * Path information during traversal
 */
export interface TraversalPath {
  pageIndex: number;
  pageId: string;
  sectionIndex?: number;
  sectionId?: string;
  branchPath?: string[];
  depth: number;
}

/**
 * Recursively traverses all questions in a branch and its children
 */
export const traverseBranchQuestions = (
  branch: ConditionalBranch,
  callback: TraversalCallback<Question>,
  path: TraversalPath
): void => {
  const branchPath = [...(path.branchPath || []), branch.id];
  
  branch.questions.forEach((question, index) => {
    callback(question, {
      ...path,
      branchPath,
      depth: path.depth + 1,
    });
  });
  
  branch.childBranches.forEach((childBranch) => {
    traverseBranchQuestions(childBranch, callback, {
      ...path,
      branchPath,
      depth: path.depth + 1,
    });
  });
};

/**
 * Traverses all questions in a questionnaire
 */
export const traverseQuestions = (
  questionnaire: Questionnaire,
  callback: TraversalCallback<Question>
): void => {
  questionnaire.pages.forEach((page, pageIndex) => {
    const basePath: TraversalPath = {
      pageIndex,
      pageId: page.id,
      depth: 0,
    };
    
    page.sections.forEach((section, sectionIndex) => {
      const sectionPath: TraversalPath = {
        ...basePath,
        sectionIndex,
        sectionId: section.id,
        depth: 1,
      };
      
      section.questions.forEach((question) => {
        callback(question, sectionPath);
      });
      
      section.branches.forEach((branch) => {
        traverseBranchQuestions(branch, callback, sectionPath);
      });
    });
  });
};

/**
 * Collects all questions from a questionnaire
 */
export const collectAllQuestions = (questionnaire: Questionnaire): Question[] => {
  const questions: Question[] = [];
  traverseQuestions(questionnaire, (question) => {
    questions.push(question);
  });
  return questions;
};

/**
 * Collects all questions from a branch (including nested branches)
 */
export const collectBranchQuestions = (branch: ConditionalBranch): Question[] => {
  const questions: Question[] = [...branch.questions];
  
  branch.childBranches.forEach((childBranch) => {
    questions.push(...collectBranchQuestions(childBranch));
  });
  
  return questions;
};

/**
 * Collects all questions from a page
 */
export const collectPageQuestions = (page: Page): Question[] => {
  const questions: Question[] = [];
  
  page.sections.forEach((section) => {
    questions.push(...section.questions);
    section.branches.forEach((branch) => {
      questions.push(...collectBranchQuestions(branch));
    });
  });
  
  return questions;
};

/**
 * Collects all answer sets from a questionnaire
 */
export const collectAllAnswerSets = (questionnaire: Questionnaire): AnswerSet[] => {
  const answerSets: AnswerSet[] = [];
  
  traverseQuestions(questionnaire, (question) => {
    answerSets.push(...question.answerSets);
    
    // Also collect inline answer sets from rule groups
    question.answerLevelRuleGroups.forEach((ruleGroup) => {
      if (ruleGroup.inlineAnswerSet) {
        answerSets.push(ruleGroup.inlineAnswerSet);
      }
    });
  });
  
  return answerSets;
};

/**
 * Recursively counts branches in a branch tree
 */
export const countBranchesInBranch = (branch: ConditionalBranch): number => {
  let count = 1;
  branch.childBranches.forEach((childBranch) => {
    count += countBranchesInBranch(childBranch);
  });
  return count;
};

/**
 * Finds a question by ID across the entire questionnaire
 */
export const findQuestionById = (
  questionnaire: Questionnaire,
  questionId: string
): Question | undefined => {
  let found: Question | undefined;
  
  traverseQuestions(questionnaire, (question) => {
    if (question.id === questionId) {
      found = question;
    }
  });
  
  return found;
};

/**
 * Finds a branch by ID across the entire questionnaire
 */
export const findBranchById = (
  questionnaire: Questionnaire,
  branchId: string
): ConditionalBranch | undefined => {
  const findInBranch = (branch: ConditionalBranch): ConditionalBranch | undefined => {
    if (branch.id === branchId) return branch;
    
    for (const childBranch of branch.childBranches) {
      const found = findInBranch(childBranch);
      if (found) return found;
    }
    
    return undefined;
  };
  
  for (const page of questionnaire.pages) {
    for (const section of page.sections) {
      for (const branch of section.branches) {
        const found = findInBranch(branch);
        if (found) return found;
      }
    }
  }
  
  return undefined;
};

/**
 * Gets questions that appear before a given question in the questionnaire order
 */
export const getPrecedingQuestions = (
  questionnaire: Questionnaire,
  targetQuestionId: string
): Question[] => {
  const preceding: Question[] = [];
  let found = false;
  
  traverseQuestions(questionnaire, (question) => {
    if (found) return;
    if (question.id === targetQuestionId) {
      found = true;
      return;
    }
    preceding.push(question);
  });
  
  return preceding;
};
