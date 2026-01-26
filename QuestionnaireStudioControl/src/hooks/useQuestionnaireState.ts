/**
 * useQuestionnaireState Hook
 * 
 * Manages questionnaire builder state with persistence and navigation.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Questionnaire, 
  Page, 
  Section, 
  Question, 
  ConditionalBranch 
} from '../types/questionnaire';
import { 
  DraftService, 
  SavedDraft,
  PublishedService,
  PublishedRecord,
  PublishedRecordsMap,
} from '../lib/storage';
import { 
  QuestionnaireFactory,
  collectAllQuestions,
} from '../lib/questionnaire';
import { createLogger } from '../lib/core/logger';

const logger = createLogger('QuestionnaireState');

export interface SelectionState {
  activePageId: string | null;
  selectedSectionId: string | null;
  selectedQuestionId: string | null;
  selectedBranchId: string | null;
}

export interface EditingState {
  draftId: string | null;
  recordId: string | null;
}

export interface QuestionnaireStateHook {
  // State
  questionnaire: Questionnaire | null;
  selection: SelectionState;
  editing: EditingState;
  drafts: SavedDraft[];
  publishedRecords: PublishedRecordsMap;
  allQuestions: Question[];
  activePage: Page | null;
  
  // Actions
  createQuestionnaire: () => void;
  setQuestionnaire: (q: Questionnaire | null) => void;
  updateQuestionnaire: (updates: Partial<Questionnaire>) => void;
  
  // Selection
  selectPage: (pageId: string | null) => void;
  selectSection: (sectionId: string | null) => void;
  selectQuestion: (questionId: string | null) => void;
  selectBranch: (branchId: string | null) => void;
  clearSelection: () => void;
  
  // Draft operations
  saveAsDraft: () => void;
  loadDraft: (draft: SavedDraft) => void;
  deleteDraft: (draftId: string) => void;
  
  // Published operations
  publish: () => { success: boolean; errors: string[] };
  loadPublishedRecord: (record: PublishedRecord) => void;
  deletePublishedRecord: (recordId: string) => void;
  
  // Reset
  reset: () => void;
}

export const useQuestionnaireState = (): QuestionnaireStateHook => {
  // Core state
  const [questionnaire, setQuestionnaireState] = useState<Questionnaire | null>(null);
  const [selection, setSelection] = useState<SelectionState>({
    activePageId: null,
    selectedSectionId: null,
    selectedQuestionId: null,
    selectedBranchId: null,
  });
  const [editing, setEditing] = useState<EditingState>({
    draftId: null,
    recordId: null,
  });
  
  // Persistence state
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [publishedRecords, setPublishedRecords] = useState<PublishedRecordsMap>({});

  // Load data on mount
  useEffect(() => {
    setDrafts(DraftService.loadAll());
    setPublishedRecords(PublishedService.loadAll());
  }, []);

  // Derived state
  const allQuestions = useMemo(() => 
    questionnaire ? collectAllQuestions(questionnaire) : [],
    [questionnaire]
  );

  const activePage = useMemo(() => 
    questionnaire?.pages.find(p => p.id === selection.activePageId) ?? null,
    [questionnaire, selection.activePageId]
  );

  // Actions
  const createQuestionnaire = useCallback(() => {
    const newQ = QuestionnaireFactory.questionnaire();
    setQuestionnaireState(newQ);
    setSelection({
      activePageId: newQ.pages[0]?.id ?? null,
      selectedSectionId: null,
      selectedQuestionId: null,
      selectedBranchId: null,
    });
    setEditing({ draftId: null, recordId: null });
    logger.info('Created new questionnaire');
  }, []);

  const setQuestionnaire = useCallback((q: Questionnaire | null) => {
    setQuestionnaireState(q);
    if (!q) {
      setSelection({
        activePageId: null,
        selectedSectionId: null,
        selectedQuestionId: null,
        selectedBranchId: null,
      });
    }
  }, []);

  const updateQuestionnaire = useCallback((updates: Partial<Questionnaire>) => {
    setQuestionnaireState(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Selection actions
  const selectPage = useCallback((pageId: string | null) => {
    setSelection(prev => ({
      ...prev,
      activePageId: pageId,
      selectedSectionId: null,
      selectedQuestionId: null,
      selectedBranchId: null,
    }));
  }, []);

  const selectSection = useCallback((sectionId: string | null) => {
    setSelection(prev => ({
      ...prev,
      selectedSectionId: sectionId,
      selectedQuestionId: null,
      selectedBranchId: null,
    }));
  }, []);

  const selectQuestion = useCallback((questionId: string | null) => {
    setSelection(prev => ({
      ...prev,
      selectedQuestionId: questionId,
      selectedBranchId: null,
    }));
  }, []);

  const selectBranch = useCallback((branchId: string | null) => {
    setSelection(prev => ({
      ...prev,
      selectedBranchId: branchId,
      selectedQuestionId: null,
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(prev => ({
      ...prev,
      selectedSectionId: null,
      selectedQuestionId: null,
      selectedBranchId: null,
    }));
  }, []);

  // Draft operations
  const saveAsDraft = useCallback(() => {
    if (!questionnaire) return;
    
    const draftId = editing.draftId || (editing.recordId ? `draft-${editing.recordId}` : undefined);
    const { draft, isNew } = DraftService.save(questionnaire, draftId);
    
    setDrafts(DraftService.loadAll());
    setEditing(prev => ({ ...prev, draftId: draft.id }));
    
    // Return to list view
    setQuestionnaireState(null);
    setSelection({
      activePageId: null,
      selectedSectionId: null,
      selectedQuestionId: null,
      selectedBranchId: null,
    });
    setEditing({ draftId: null, recordId: null });
    
    logger.info(`Draft ${isNew ? 'created' : 'updated'}: ${draft.id}`);
  }, [questionnaire, editing]);

  const loadDraft = useCallback((draft: SavedDraft) => {
    setQuestionnaireState(draft.questionnaire);
    setSelection({
      activePageId: draft.questionnaire.pages[0]?.id ?? null,
      selectedSectionId: draft.questionnaire.pages[0]?.sections[0]?.id ?? null,
      selectedQuestionId: null,
      selectedBranchId: null,
    });
    setEditing({ draftId: draft.id, recordId: null });
    logger.info(`Loaded draft: ${draft.id}`);
  }, []);

  const deleteDraft = useCallback((draftId: string) => {
    DraftService.delete(draftId);
    setDrafts(DraftService.loadAll());
    logger.info(`Deleted draft: ${draftId}`);
  }, []);

  // Publish operations
  const publish = useCallback((): { success: boolean; errors: string[] } => {
    if (!questionnaire) {
      return { success: false, errors: ['No questionnaire to publish'] };
    }

    // Validation (simplified - full validation would be in a separate validator)
    const errors: string[] = [];
    
    questionnaire.pages.forEach(page => {
      let hasContent = false;
      page.sections.forEach(section => {
        if (section.questions.length > 0 || section.branches.length > 0) {
          hasContent = true;
        }
      });
      if (!hasContent) {
        errors.push(`Page "${page.name || 'Untitled'}" is missing content`);
      }
    });

    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Publish
    const record = PublishedService.publish(questionnaire, editing.recordId ?? undefined);
    setPublishedRecords(PublishedService.loadAll());
    
    // Remove associated draft
    if (editing.draftId) {
      DraftService.delete(editing.draftId);
      setDrafts(DraftService.loadAll());
    }

    setEditing(prev => ({ ...prev, recordId: record.metadata.id, draftId: null }));
    setQuestionnaireState(record.questionnaire);
    
    logger.info(`Published questionnaire: ${record.metadata.id}`);
    return { success: true, errors: [] };
  }, [questionnaire, editing]);

  const loadPublishedRecord = useCallback((record: PublishedRecord) => {
    setQuestionnaireState(record.questionnaire);
    setSelection({
      activePageId: record.questionnaire.pages[0]?.id ?? null,
      selectedSectionId: record.questionnaire.pages[0]?.sections[0]?.id ?? null,
      selectedQuestionId: null,
      selectedBranchId: null,
    });
    setEditing({ draftId: null, recordId: record.metadata.id });
    logger.info(`Loaded published record: ${record.metadata.id}`);
  }, []);

  const deletePublishedRecord = useCallback((recordId: string) => {
    PublishedService.delete(recordId);
    setPublishedRecords(PublishedService.loadAll());
    logger.info(`Deleted published record: ${recordId}`);
  }, []);

  // Reset
  const reset = useCallback(() => {
    setQuestionnaireState(null);
    setSelection({
      activePageId: null,
      selectedSectionId: null,
      selectedQuestionId: null,
      selectedBranchId: null,
    });
    setEditing({ draftId: null, recordId: null });
    logger.info('Reset questionnaire state');
  }, []);

  return {
    questionnaire,
    selection,
    editing,
    drafts,
    publishedRecords,
    allQuestions,
    activePage,
    createQuestionnaire,
    setQuestionnaire,
    updateQuestionnaire,
    selectPage,
    selectSection,
    selectQuestion,
    selectBranch,
    clearSelection,
    saveAsDraft,
    loadDraft,
    deleteDraft,
    publish,
    loadPublishedRecord,
    deletePublishedRecord,
    reset,
  };
};
