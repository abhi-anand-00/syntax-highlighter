/**
 * Draft Storage Service
 * 
 * Manages questionnaire draft persistence.
 */

import { Questionnaire } from '../../types/questionnaire';
import { createStorageService, getWithFallback } from './storageService';
import { StorageKeys } from '../questionnaire/constants';
import { getQuestionnaireStats } from '../questionnaire/stats';
import { EntityId } from '../core/id';
import { createLogger } from '../core/logger';

const logger = createLogger('DraftService');

/**
 * Saved draft structure
 */
export interface SavedDraft {
  id: string;
  questionnaire: Questionnaire;
  savedAt: string;
  pageCount: number;
  sectionCount: number;
  questionCount: number;
  branchCount: number;
}

// Create the storage service
const draftStorage = createStorageService<SavedDraft[]>(StorageKeys.DRAFTS);

/**
 * Draft service operations
 */
export const DraftService = {
  /**
   * Load all drafts from storage
   */
  loadAll: (): SavedDraft[] => {
    return getWithFallback(draftStorage, []);
  },
  
  /**
   * Save all drafts to storage
   */
  saveAll: (drafts: SavedDraft[]): boolean => {
    const result = draftStorage.set(drafts);
    if (!result.success) {
      logger.error('Failed to save drafts', result.error);
    }
    return result.success;
  },
  
  /**
   * Find a draft by ID
   */
  findById: (id: string): SavedDraft | undefined => {
    const drafts = DraftService.loadAll();
    return drafts.find(d => d.id === id);
  },
  
  /**
   * Create or update a draft
   */
  save: (
    questionnaire: Questionnaire, 
    existingId?: string
  ): { draft: SavedDraft; isNew: boolean } => {
    const drafts = DraftService.loadAll();
    const stats = getQuestionnaireStats(questionnaire);
    const now = new Date().toLocaleString();
    
    // Determine the draft ID
    const draftId = existingId || EntityId.draft();
    const existingIndex = drafts.findIndex(d => d.id === draftId);
    
    const draft: SavedDraft = {
      id: draftId,
      questionnaire: { ...questionnaire, status: 'Draft' },
      savedAt: now,
      ...stats,
    };
    
    if (existingIndex >= 0) {
      // Update existing
      drafts[existingIndex] = draft;
      DraftService.saveAll(drafts);
      logger.info(`Updated draft: ${draftId}`);
      return { draft, isNew: false };
    } else {
      // Create new
      DraftService.saveAll([...drafts, draft]);
      logger.info(`Created new draft: ${draftId}`);
      return { draft, isNew: true };
    }
  },
  
  /**
   * Delete a draft by ID
   */
  delete: (id: string): boolean => {
    const drafts = DraftService.loadAll();
    const filtered = drafts.filter(d => d.id !== id);
    
    if (filtered.length === drafts.length) {
      logger.warn(`Draft not found for deletion: ${id}`);
      return false;
    }
    
    DraftService.saveAll(filtered);
    logger.info(`Deleted draft: ${id}`);
    return true;
  },
  
  /**
   * Clear all drafts
   */
  clearAll: (): void => {
    draftStorage.remove();
    logger.info('Cleared all drafts');
  },
};
